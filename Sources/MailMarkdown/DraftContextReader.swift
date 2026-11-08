import AppKit
import ApplicationServices
import MailMarkdownCore

@MainActor
struct DraftContext {
    let element: AXUIElement
    let window: AXUIElement
    let selectedRange: CFRange
    let style: DraftStyle
}

/// Resolves Mail's native or WebKit-backed message body without reading its text.
/// Only one adjacent character's attributed range is fetched for the style sample.
@MainActor
final class DraftContextReader {
    private(set) var lastFailure = "Noch kein Mail-Entwurf geprüft."
    private(set) var windowAwaitingFocus: AXUIElement?

    private struct BodyFocus {
        let body: AXUIElement
        let window: AXUIElement
    }

    private struct Selection {
        let range: CFRange
        let startMarker: AXTextMarker?
        let endMarker: AXTextMarker?
    }

    func currentDraft() -> DraftContext? {
        guard let focus = currentBody() else { return nil }
        guard let selection = selection(of: focus.body) else {
            return fail("Mail stellt weder eine Textauswahl noch lesbare WebKit-Textmarker bereit.")
        }
        guard let sample = styleSample(in: focus.body, selection: selection), sample.length > 0 else {
            return fail("An der Einfügeposition ist keine benachbarte Schriftprobe verfügbar. Leere Entwürfe werden unverändert eingefügt.")
        }
        let attributes = sample.attributes(at: 0, effectiveRange: nil)
        guard let font = font(from: attributes) else {
            return fail("Mail liefert für die benachbarte Stilprobe keine verwendbare Schrift.")
        }
        guard let foreground = foregroundColor(from: attributes) else {
            return fail("Mail liefert für die benachbarte Stilprobe keine Textfarbe.")
        }
        let paragraph = attributes[.paragraphStyle] as? NSParagraphStyle ?? NSParagraphStyle.default
        lastFailure = ""
        return DraftContext(
            element: focus.body,
            window: focus.window,
            selectedRange: selection.range,
            style: DraftStyle(font: font, foregroundColor: foreground, paragraphStyle: paragraph)
        )
    }

    func stillMatches(_ context: DraftContext) -> Bool {
        guard let focus = currentBody(),
              CFEqual(focus.body, context.element),
              CFEqual(focus.window, context.window),
              let current = selection(of: focus.body) else { return false }
        return current.range.location == context.selectedRange.location
            && current.range.length == context.selectedRange.length
    }

    func isFocusedWindow(_ window: AXUIElement) -> Bool {
        guard let application = NSWorkspace.shared.frontmostApplication,
              application.bundleIdentifier == "com.apple.mail",
              let current = elementAttribute(AXUIElementCreateApplication(application.processIdentifier),
                                             kAXFocusedWindowAttribute) else { return false }
        return CFEqual(current, window)
    }

    private func currentBody() -> BodyFocus? {
        windowAwaitingFocus = nil
        guard let application = NSWorkspace.shared.frontmostApplication,
              application.bundleIdentifier == "com.apple.mail" else {
            return failBody("Apple Mail ist nicht im Vordergrund.")
        }
        let mail = AXUIElementCreateApplication(application.processIdentifier)
        guard let window = elementAttribute(mail, kAXFocusedWindowAttribute), isComposeWindow(window) else {
            return failBody("Kein Verfassen-Fenster mit einer Senden-Schaltfläche erkannt.")
        }
        let system = AXUIElementCreateSystemWide()
        guard let focused = elementAttribute(system, kAXFocusedUIElementAttribute)
            ?? elementAttribute(mail, kAXFocusedUIElementAttribute) else {
            if let body = focusedMessageBody(in: window) {
                return BodyFocus(body: body, window: window)
            }
            windowAwaitingFocus = window
            return failBody("Mail liefert kein fokussiertes Bedienelement.")
        }
        guard let body = resolveBody(from: focused) else {
            let role = stringAttribute(focused, kAXRoleAttribute) ?? "unbekannt"
            var pid: pid_t = 0
            AXUIElementGetPid(focused, &pid)
            return failBody("Kein Nachrichtentext erkannt (Rolle: \(role), Prozess: \(pid)).")
        }
        // WebKit may own the body in a separate WebContent process. Its containing
        // Mail compose window, rather than its PID, establishes the app identity.
        guard belongs(body, to: window) || belongs(focused, to: window) else {
            return failBody("Der Nachrichtentext gehört nicht zum fokussierten Mail-Entwurf.")
        }
        return BodyFocus(body: body, window: window)
    }

    private func focusedMessageBody(in window: AXUIElement) -> AXUIElement? {
        // WebKit can report focus on the editor itself while neither
        // application-level focus query has a value. Never infer focus just
        // because a compose window contains a message body.
        var pending: [(AXUIElement, Int)] = [(window, 0)]
        var visited = 0
        while let (element, depth) = pending.popLast(), visited < 80 {
            visited += 1
            let role = stringAttribute(element, kAXRoleAttribute)
            if role == "AXWebArea" || role == kAXTextAreaRole as String {
                if boolAttribute(element, kAXFocusedAttribute) == true,
                   let body = resolveBody(from: element) { return body }
                continue
            }
            guard depth < 6,
                  role != kAXToolbarRole as String,
                  role != kAXTextFieldRole as String,
                  let children = attribute(element, kAXChildrenAttribute) as? [AXUIElement] else { continue }
            pending.append(contentsOf: children.map { ($0, depth + 1) })
        }
        return nil
    }

    private func resolveBody(from focused: AXUIElement) -> AXUIElement? {
        var element: AXUIElement? = focused
        var visited: [AXUIElement] = []
        for _ in 0..<16 {
            guard let current = element, !visited.contains(where: { CFEqual($0, current) }) else { break }
            visited.append(current)
            let role = stringAttribute(current, kAXRoleAttribute)
            let isBodyRole = role == kAXTextAreaRole as String || role == "AXWebArea"
            if isBodyRole, boolAttribute(current, kAXEnabledAttribute) != false {
                // Observed in Mail's compose WebKit view. Read-only message viewers
                // are additionally excluded by the positive compose-window check.
                let description = stringAttribute(current, kAXDescriptionAttribute)
                if description?.lowercased() == "message body" || isExplicitlyEditable(current) {
                    return current
                }
            }
            if role == kAXWindowRole as String || role == kAXTextFieldRole as String { break }
            element = elementAttribute(current, "AXEditableAncestor")
                ?? elementAttribute(current, kAXParentAttribute)
        }
        return nil
    }

    private func isExplicitlyEditable(_ element: AXUIElement) -> Bool {
        if boolAttribute(element, "AXEditable") == true
            || boolAttribute(element, kAXIsEditableAttribute) == true { return true }
        var settable = DarwinBoolean(false)
        return AXUIElementIsAttributeSettable(element, kAXValueAttribute as CFString, &settable) == .success
            && settable.boolValue
    }

    private func belongs(_ element: AXUIElement, to window: AXUIElement) -> Bool {
        if let containing = elementAttribute(element, kAXWindowAttribute), CFEqual(containing, window) { return true }
        var current: AXUIElement? = element
        for _ in 0..<24 {
            guard let node = current else { return false }
            if CFEqual(node, window) { return true }
            current = elementAttribute(node, kAXParentAttribute)
        }
        return false
    }

    private func isComposeWindow(_ window: AXUIElement) -> Bool {
        guard stringAttribute(window, kAXRoleAttribute) == kAXWindowRole as String else { return false }
        var pending: [(AXUIElement, Int, Bool)] = [(window, 0, false)]
        var visited = 0
        while let (element, depth, insideToolbar) = pending.popLast(), visited < 300 {
            visited += 1
            let role = stringAttribute(element, kAXRoleAttribute)
            let toolbar = insideToolbar || role == kAXToolbarRole as String
            if role == kAXButtonRole as String || role == kAXMenuButtonRole as String {
                // 'send' is Mail's observed compose button identifier. Disabled
                // Send controls also identify drafts without a recipient yet.
                if stringAttribute(element, kAXIdentifierAttribute) == "send" { return true }
                if toolbar {
                    let title = stringAttribute(element, kAXTitleAttribute)
                    let description = stringAttribute(element, kAXDescriptionAttribute)
                    if isSendName(title) || isSendName(description) { return true }
                }
            }
            guard depth < 8,
                  role != kAXTextAreaRole as String,
                  role != kAXTextFieldRole as String,
                  role != "AXWebArea",
                  let children = attribute(element, kAXChildrenAttribute) as? [AXUIElement] else { continue }
            pending.append(contentsOf: children.map { ($0, depth + 1, toolbar) })
        }
        return false
    }

    private func isSendName(_ value: String?) -> Bool {
        value == "Send" || value == "Senden"
    }

    private func selection(of element: AXUIElement) -> Selection? {
        if let ranges = attribute(element, kAXSelectedTextRangesAttribute) as? [Any], ranges.count > 1 { return nil }
        if let raw = attribute(element, "AXSelectedTextMarkerRange"),
           CFGetTypeID(raw) == AXTextMarkerRangeGetTypeID() {
            let markers = raw as! AXTextMarkerRange
            let start = AXTextMarkerRangeCopyStartMarker(markers)
            let end = AXTextMarkerRangeCopyEndMarker(markers)
            if let startIndex = markerIndex(start, in: element),
               let endIndex = markerIndex(end, in: element) {
                let lower = min(startIndex, endIndex)
                return Selection(range: CFRange(location: lower, length: abs(endIndex - startIndex)),
                                 startMarker: startIndex <= endIndex ? start : end,
                                 endMarker: startIndex <= endIndex ? end : start)
            }
        }
        guard let raw = attribute(element, kAXSelectedTextRangeAttribute),
              CFGetTypeID(raw) == AXValueGetTypeID() else { return nil }
        let value = raw as! AXValue
        var range = CFRange()
        guard AXValueGetType(value) == .cfRange,
              AXValueGetValue(value, .cfRange, &range),
              range.location >= 0, range.length >= 0,
              range.length <= Int.max - range.location else { return nil }
        return Selection(range: range, startMarker: nil, endMarker: nil)
    }

    private func markerIndex(_ marker: AXTextMarker, in element: AXUIElement) -> Int? {
        guard let index = parameterized(element, "AXIndexForTextMarker", marker) as? NSNumber,
              index.intValue >= 0 else { return nil }
        return index.intValue
    }

    private func styleSample(in element: AXUIElement, selection: Selection) -> NSAttributedString? {
        if let start = selection.startMarker {
            // Use one adjacent WebKit character, not the full selected text or
            // document. Text-marker APIs also support WebAreas without NSRange.
            if selection.range.length == 0,
               let previous = marker(parameterized(element, "AXPreviousTextMarkerForTextMarker", start)),
               let sample = attributedSample(in: element, from: previous, to: start) {
                return sample
            }
            if let next = marker(parameterized(element, "AXNextTextMarkerForTextMarker", start)),
               let sample = attributedSample(in: element, from: start, to: next) {
                return sample
            }
            return nil
        }
        let index = selection.range.length > 0 ? selection.range.location : max(0, selection.range.location - 1)
        if let count = numberAttribute(element, kAXNumberOfCharactersAttribute)?.intValue, index >= count { return nil }
        var range = CFRange(location: index, length: 1)
        guard let parameter = AXValueCreate(.cfRange, &range) else { return nil }
        return parameterized(element, kAXAttributedStringForRangeParameterizedAttribute, parameter) as? NSAttributedString
    }

    private func marker(_ raw: CFTypeRef?) -> AXTextMarker? {
        guard let raw, CFGetTypeID(raw) == AXTextMarkerGetTypeID() else { return nil }
        return (raw as! AXTextMarker)
    }

    private func attributedSample(in element: AXUIElement, from start: AXTextMarker, to end: AXTextMarker) -> NSAttributedString? {
        let range = AXTextMarkerRangeCreate(nil, start, end)
        guard let sample = parameterized(element, "AXAttributedStringForTextMarkerRange", range) as? NSAttributedString,
              sample.length > 0 else { return nil }
        return sample
    }

    private func parameterized(_ element: AXUIElement, _ name: String, _ parameter: CFTypeRef) -> CFTypeRef? {
        var result: CFTypeRef?
        guard AXUIElementCopyParameterizedAttributeValue(element, name as CFString, parameter, &result) == .success else { return nil }
        return result
    }

    private func fail(_ message: String) -> DraftContext? {
        lastFailure = message
        return nil
    }

    private func failBody(_ message: String) -> BodyFocus? {
        lastFailure = message
        return nil
    }

    private func font(from attributes: [NSAttributedString.Key: Any]) -> NSFont? {
        if let font = attributes[.font] as? NSFont,
           font.pointSize.isFinite, font.pointSize > 0 {
            return font
        }
        let key = NSAttributedString.Key(kAXFontTextAttribute.takeUnretainedValue() as String)
        guard let dictionary = attributes[key] as? NSDictionary,
              let name = dictionary[kAXFontNameKey.takeUnretainedValue() as String] as? String,
              let size = dictionary[kAXFontSizeKey.takeUnretainedValue() as String] as? NSNumber,
              size.doubleValue.isFinite, size.doubleValue > 0 else { return nil }
        // The actual font name preserves its weight/slant; no family-based
        // substitution or guessed default is used when it is unavailable.
        return NSFont(name: name, size: CGFloat(size.doubleValue))
    }

    private func foregroundColor(from attributes: [NSAttributedString.Key: Any]) -> NSColor? {
        if let color = color(from: attributes[.foregroundColor]) { return color }
        let key = NSAttributedString.Key(kAXForegroundColorTextAttribute.takeUnretainedValue() as String)
        return color(from: attributes[key])
    }

    private func color(from raw: Any?) -> NSColor? {
        if let color = raw as? NSColor { return color }
        guard let raw, CFGetTypeID(raw as CFTypeRef) == CGColor.typeID else { return nil }
        return NSColor(cgColor: raw as! CGColor)
    }

    private func attribute(_ element: AXUIElement, _ name: String) -> CFTypeRef? {
        var value: CFTypeRef?
        guard AXUIElementCopyAttributeValue(element, name as CFString, &value) == .success else { return nil }
        return value
    }

    private func elementAttribute(_ element: AXUIElement, _ name: String) -> AXUIElement? {
        guard let value = attribute(element, name), CFGetTypeID(value) == AXUIElementGetTypeID() else { return nil }
        return (value as! AXUIElement)
    }

    private func stringAttribute(_ element: AXUIElement, _ name: String) -> String? {
        attribute(element, name) as? String
    }

    private func boolAttribute(_ element: AXUIElement, _ name: String) -> Bool? {
        (attribute(element, name) as? NSNumber)?.boolValue
    }

    private func numberAttribute(_ element: AXUIElement, _ name: String) -> NSNumber? {
        attribute(element, name) as? NSNumber
    }
}
