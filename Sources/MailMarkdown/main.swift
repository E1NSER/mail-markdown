import AppKit
import ApplicationServices
import CoreServices
import MailMarkdownCore
import OSLog

private let syntheticPasteMarker: Int64 = 0x4D_44_4D_41_49_4C

@MainActor
final class MailMarkdownApp: NSObject, NSApplicationDelegate, NSWindowDelegate {
    private var statusItem: NSStatusItem!
    private var toggleItem: NSMenuItem!
    private var statusLine: NSMenuItem!
    private var restoreItem: NSMenuItem!
    private var eventTap: CFMachPort?
    private var eventSource: CFRunLoopSource?
    private var permissionTimer: Timer?
    private var busy = false
    private var enabled = UserDefaults.standard.object(forKey: "formattingEnabled") as? Bool ?? true
    private var statusMessage = "Wird gestartet …"
    private var appWindow: AppWindowController?
    private var originalClipboard: [[NSPasteboard.PasteboardType: Data]]?
    private var stagedChangeCount: Int?
    private let contextReader = DraftContextReader()
    private let renderer = MarkdownRenderer()
    private let loginItems = LoginItemController()
    private let diagnostics = Logger(subsystem: "at.einser.mail-markdown.prototype", category: "Paste")

    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.accessory)
        configureMainMenu()
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.squareLength)
        statusItem.button?.image = NSImage(systemSymbolName: "text.badge.checkmark", accessibilityDescription: "Mail Markdown")
        let menu = NSMenu()
        let title = NSMenuItem(title: "Mail Markdown", action: nil, keyEquivalent: "")
        menu.addItem(title)
        statusLine = NSMenuItem(title: "Bedienungshilfen erforderlich", action: nil, keyEquivalent: "")
        menu.addItem(statusLine)
        menu.addItem(.separator())
        toggleItem = item("Markdown bei ⌘V in Mail formatieren", #selector(toggleEnabled))
        toggleItem.state = enabled ? .on : .off
        menu.addItem(toggleItem)
        menu.addItem(item("Einstellungen …", #selector(showSettings)))
        menu.addItem(item("Bedienungshilfen freigeben …", #selector(openAccessibility)))
        restoreItem = item("Original-Zwischenablage wiederherstellen", #selector(restoreClipboard))
        restoreItem.isEnabled = false
        menu.addItem(restoreItem)
        menu.addItem(item("Hinweise …", #selector(showHelp)))
        menu.addItem(.separator())
        menu.addItem(item("Beenden", #selector(quit)))
        menu.autoenablesItems = false
        statusItem.menu = menu
        startEventTapIfAllowed()
        permissionTimer = Timer.scheduledTimer(withTimeInterval: 2, repeats: true) { [weak self] _ in
            MainActor.assumeIsolated { self?.refreshPermissionAndState() }
        }
        let launchEvent = NSAppleEventManager.shared().currentAppleEvent
        let isLoginLaunch = launchEvent?.eventID == kAEOpenApplication
            && launchEvent?.paramDescriptor(forKeyword: keyAEPropData)?.enumCodeValue == keyAELaunchedAsLogInItem
        if !isLoginLaunch && !ProcessInfo.processInfo.arguments.contains("--background") { showSettings() }
    }

    private func item(_ title: String, _ action: Selector) -> NSMenuItem {
        let item = NSMenuItem(title: title, action: action, keyEquivalent: "")
        item.target = self
        return item
    }

    private func setStatus(_ message: String, diagnostic: String? = nil) {
        statusLine.title = message
        if statusMessage != message || diagnostic != nil {
            // Only operational status, roles and process IDs; never draft/clipboard text.
            diagnostics.notice("\(diagnostic ?? message, privacy: .public)")
        }
        statusMessage = message
        refreshWindow()
    }

    private func refreshPermissionAndState() {
        if !AXIsProcessTrusted(), let tap = eventTap {
            CFMachPortInvalidate(tap)
            if let eventSource { CFRunLoopRemoveSource(CFRunLoopGetMain(), eventSource, .commonModes) }
            eventTap = nil
            eventSource = nil
        }
        startEventTapIfAllowed()
        if let stagedChangeCount, stagedChangeCount != NSPasteboard.general.changeCount {
            originalClipboard = nil
            self.stagedChangeCount = nil
        }
        restoreItem.isEnabled = originalClipboard != nil
        refreshWindow()
    }

    private func refreshWindow() {
        guard let appWindow else { return }
        appWindow.update(AppViewState(
            enabled: enabled, permissionGranted: AXIsProcessTrusted(),
            ready: eventTap.map { CGEvent.tapIsEnabled(tap: $0) } ?? false,
            status: statusMessage,
            canRestoreClipboard: originalClipboard != nil && stagedChangeCount == NSPasteboard.general.changeCount,
            launchAtLogin: loginItems.isRegistered, loginNeedsApproval: loginItems.requiresApproval,
            loginStatus: loginItems.statusDescription,
            version: Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "1.0"
        ))
    }

    private func startEventTapIfAllowed() {
        guard eventTap == nil else { return }
        guard AXIsProcessTrusted() else { setStatus("Bedienungshilfen erforderlich"); return }
        let mask = CGEventMask(1 << CGEventType.keyDown.rawValue)
        let callback: CGEventTapCallBack = { _, type, event, userInfo in
            guard let userInfo else { return Unmanaged.passUnretained(event) }
            let app = Unmanaged<MailMarkdownApp>.fromOpaque(userInfo).takeUnretainedValue()
            return MainActor.assumeIsolated { app.receive(type: type, event: event) }
        }
        guard let tap = CGEvent.tapCreate(
            tap: .cgSessionEventTap, place: .headInsertEventTap, options: .defaultTap,
            eventsOfInterest: mask, callback: callback,
            userInfo: Unmanaged.passUnretained(self).toOpaque()
        ) else { setStatus("Tastenkürzel konnte nicht aktiviert werden"); return }
        eventTap = tap
        eventSource = CFMachPortCreateRunLoopSource(kCFAllocatorDefault, tap, 0)
        CFRunLoopAddSource(CFRunLoopGetMain(), eventSource, .commonModes)
        CGEvent.tapEnable(tap: tap, enable: true)
        setStatus(enabled ? "Bereit für Apple Mail" : "Pausiert")
    }

    private func receive(type: CGEventType, event: CGEvent) -> Unmanaged<CGEvent>? {
        if type == .tapDisabledByTimeout || type == .tapDisabledByUserInput {
            if let eventTap { CGEvent.tapEnable(tap: eventTap, enable: true) }
            return Unmanaged.passUnretained(event)
        }
        let relevantFlags = event.flags.intersection([.maskCommand, .maskShift, .maskControl, .maskAlternate])
        guard enabled, type == .keyDown,
              event.getIntegerValueField(.eventSourceUserData) != syntheticPasteMarker,
              event.getIntegerValueField(.keyboardEventKeycode) == 9,
              relevantFlags == .maskCommand,
              NSWorkspace.shared.frontmostApplication?.bundleIdentifier == "com.apple.mail"
        else { return Unmanaged.passUnretained(event) }
        // Keep the event callback short. Accessibility and rendering run after it returns.
        guard !busy else { NSSound.beep(); return nil }
        busy = true
        let requestedPID = NSWorkspace.shared.frontmostApplication?.processIdentifier
        DispatchQueue.main.async { [weak self] in
            guard let self else { return }
            self.processPaste(requestedPID: requestedPID)
            self.busy = false
        }
        return nil
    }

    private func processPaste(requestedPID: pid_t?) {
        guard NSWorkspace.shared.frontmostApplication?.processIdentifier == requestedPID else {
            setStatus("Einfügen abgebrochen: Fenster gewechselt")
            return
        }
        let board = NSPasteboard.general
        let beforeCount = board.changeCount
        let clipboardText = board.string(forType: .string)
        guard board.changeCount == beforeCount else {
            setStatus("Einfügen abgebrochen: Zwischenablage geändert")
            return
        }
        guard let markdown = clipboardText, markdown.utf16.count <= 100_000,
              renderer.containsMarkdown(markdown) else { postPaste(to: requestedPID); return }
        guard let context = contextReader.currentDraft() else {
            guard board.changeCount == beforeCount else {
                setStatus("Einfügen abgebrochen: Zwischenablage geändert")
                return
            }
            setStatus("Normal eingefügt · Textstil nicht verfügbar", diagnostic: contextReader.lastFailure)
            postPaste(to: requestedPID)
            return
        }
        let formatted = renderer.render(markdown, style: context.style)
        let range = NSRange(location: 0, length: formatted.length)
        do {
            let rtf = try formatted.data(from: range, documentAttributes: [.documentType: NSAttributedString.DocumentType.rtf])
            // Materializing lazy pasteboard representations can take time. Validate
            // the clipboard and destination again after the snapshot completes.
            let savedOriginal = stagedChangeCount == beforeCount ? originalClipboard : snapshot(board)
            guard contextReader.stillMatches(context), board.changeCount == beforeCount else {
                setStatus("Einfügen abgebrochen: Auswahl oder Zwischenablage geändert")
                return
            }
            let converted = NSPasteboardItem()
            converted.setData(rtf, forType: .rtf)
            converted.setString(formatted.string, forType: .string)
            originalClipboard = savedOriginal
            board.clearContents()
            guard board.writeObjects([converted]) else {
                restoreSnapshotIfAvailable(board)
                setStatus("Zwischenablage konnte nicht geschrieben werden")
                postPaste(to: requestedPID)
                return
            }
            stagedChangeCount = board.changeCount
            restoreItem.isEnabled = originalClipboard != nil
            guard contextReader.stillMatches(context), stagedChangeCount == board.changeCount else {
                if stagedChangeCount == board.changeCount { restoreSnapshotIfAvailable(board) }
                setStatus("Einfügen abgebrochen: Auswahl geändert")
                return
            }
            postPaste(to: requestedPID)
            setStatus("Markdown bereitgestellt · Stil aus dem Entwurf")
        } catch {
            setStatus("Formatierung fehlgeschlagen · normal eingefügt")
            postPaste(to: requestedPID)
        }
    }

    private func postPaste(to expectedPID: pid_t?) {
        // A changed foreground app must never receive an event intended for Mail.
        guard let expectedPID,
              let frontmost = NSWorkspace.shared.frontmostApplication,
              frontmost.bundleIdentifier == "com.apple.mail",
              frontmost.processIdentifier == expectedPID else { return }
        for isDown in [true, false] {
            guard let event = CGEvent(keyboardEventSource: nil, virtualKey: 9, keyDown: isDown) else { continue }
            event.flags = .maskCommand
            event.setIntegerValueField(.eventSourceUserData, value: syntheticPasteMarker)
            event.postToPid(expectedPID)
        }
    }

    private func snapshot(_ board: NSPasteboard) -> [[NSPasteboard.PasteboardType: Data]] {
        (board.pasteboardItems ?? []).map { entry in
            var representations: [NSPasteboard.PasteboardType: Data] = [:]
            for type in entry.types { if let data = entry.data(forType: type) { representations[type] = data } }
            return representations
        }
    }

    private func restoreSnapshotIfAvailable(_ board: NSPasteboard) {
        guard let originalClipboard else { return }
        let items = originalClipboard.map { representations in
            let item = NSPasteboardItem()
            for (type, data) in representations { item.setData(data, forType: type) }
            return item
        }
        board.clearContents()
        board.writeObjects(items)
        self.originalClipboard = nil
        stagedChangeCount = nil
        restoreItem.isEnabled = false
    }

    @objc private func restoreClipboard() {
        guard stagedChangeCount == NSPasteboard.general.changeCount else {
            originalClipboard = nil
            stagedChangeCount = nil
            restoreItem.isEnabled = false
            setStatus("Neu kopierten Inhalt beibehalten")
            return
        }
        restoreSnapshotIfAvailable(NSPasteboard.general)
        setStatus("Original-Zwischenablage wiederhergestellt")
    }

    @objc private func toggleEnabled() {
        setFormattingEnabled(!enabled)
    }

    private func setFormattingEnabled(_ value: Bool) {
        enabled = value
        UserDefaults.standard.set(enabled, forKey: "formattingEnabled")
        toggleItem.state = enabled ? .on : .off
        if !enabled { setStatus("Pausiert") }
        else if !AXIsProcessTrusted() { setStatus("Bedienungshilfen erforderlich") }
        else if eventTap.map({ CGEvent.tapIsEnabled(tap: $0) }) == true { setStatus("Bereit für Apple Mail") }
        else { setStatus("Tastenkürzel konnte nicht aktiviert werden") }
    }

    @objc private func openAccessibility() {
        let key = kAXTrustedCheckOptionPrompt.takeUnretainedValue() as String
        _ = AXIsProcessTrustedWithOptions([key: true] as CFDictionary)
        if let url = URL(string: "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility") {
            NSWorkspace.shared.open(url)
        }
    }

    @objc private func showHelp() {
        showSettings()
        appWindow?.showHelpPage()
    }

    @objc private func showSettings() {
        if appWindow == nil {
            appWindow = AppWindowController(actions: AppActions(
                setEnabled: { [weak self] in self?.setFormattingEnabled($0) },
                openAccessibility: { [weak self] in self?.openAccessibility() },
                setLaunchAtLogin: { [weak self] in self?.setLaunchAtLogin($0) },
                openLoginItems: { [weak self] in self?.loginItems.openLoginItemsSettings() },
                restoreClipboard: { [weak self] in self?.restoreClipboard() }
            ))
            appWindow?.window?.delegate = self
        }
        NSApp.setActivationPolicy(.regular)
        refreshWindow()
        appWindow?.present()
    }

    private func setLaunchAtLogin(_ value: Bool) {
        do { try loginItems.setEnabled(value) }
        catch {
            let alert = NSAlert()
            alert.messageText = "Autostart konnte nicht geändert werden"
            alert.informativeText = error.localizedDescription
            alert.addButton(withTitle: "OK")
            if let window = appWindow?.window { alert.beginSheetModal(for: window) }
            else { alert.runModal() }
        }
        refreshWindow()
    }

    private func configureMainMenu() {
        let mainMenu = NSMenu()
        let appItem = NSMenuItem()
        let appMenu = NSMenu(title: "Mail Markdown")
        appMenu.addItem(item("Über Mail Markdown", #selector(showAbout)))
        appMenu.addItem(.separator())
        let settings = item("Einstellungen …", #selector(showSettings))
        settings.keyEquivalent = ","
        appMenu.addItem(settings)
        appMenu.addItem(.separator())
        let hide = NSMenuItem(title: "Mail Markdown ausblenden", action: #selector(NSApplication.hide(_:)), keyEquivalent: "h")
        hide.target = NSApp
        appMenu.addItem(hide)
        appMenu.addItem(.separator())
        let quit = item("Mail Markdown beenden", #selector(quit))
        quit.keyEquivalent = "q"
        appMenu.addItem(quit)
        appItem.submenu = appMenu
        mainMenu.addItem(appItem)

        let editItem = NSMenuItem()
        let editMenu = NSMenu(title: "Bearbeiten")
        for (title, action, key) in [
            ("Widerrufen", Selector(("undo:")), "z"),
            ("Ausschneiden", #selector(NSText.cut(_:)), "x"),
            ("Kopieren", #selector(NSText.copy(_:)), "c"),
            ("Einfügen", #selector(NSText.paste(_:)), "v"),
            ("Alles auswählen", #selector(NSText.selectAll(_:)), "a")
        ] { editMenu.addItem(NSMenuItem(title: title, action: action, keyEquivalent: key)) }
        let redo = NSMenuItem(title: "Wiederholen", action: Selector(("redo:")), keyEquivalent: "z")
        redo.keyEquivalentModifierMask = [.command, .shift]
        editMenu.insertItem(redo, at: 1)
        editItem.submenu = editMenu
        mainMenu.addItem(editItem)

        let windowItem = NSMenuItem()
        let windowMenu = NSMenu(title: "Fenster")
        windowMenu.addItem(NSMenuItem(title: "Fenster schließen", action: #selector(NSWindow.performClose(_:)), keyEquivalent: "w"))
        windowMenu.addItem(NSMenuItem(title: "Im Dock ablegen", action: #selector(NSWindow.performMiniaturize(_:)), keyEquivalent: "m"))
        windowItem.submenu = windowMenu
        mainMenu.addItem(windowItem)
        NSApp.windowsMenu = windowMenu

        let helpItem = NSMenuItem()
        let helpMenu = NSMenu(title: "Hilfe")
        helpMenu.addItem(item("Mail Markdown verwenden", #selector(showHelp)))
        helpItem.submenu = helpMenu
        mainMenu.addItem(helpItem)
        NSApp.mainMenu = mainMenu
    }

    @objc private func showAbout() {
        NSApp.activate(ignoringOtherApps: true)
        NSApp.orderFrontStandardAboutPanel(options: [.applicationName: "Mail Markdown",
                                                     .applicationIcon: NSApp.applicationIconImage as Any,
                                                     .credits: NSAttributedString(string: "Markdown für Apple Mail.\nEntwickelt von E1NSER.\n\nVerwendet swift-markdown und cmark-gfm.\nLizenzhinweise liegen der App bei.")])
    }

    func applicationShouldHandleReopen(_ sender: NSApplication, hasVisibleWindows flag: Bool) -> Bool {
        showSettings()
        return true
    }

    func applicationDidBecomeActive(_ notification: Notification) { refreshWindow() }
    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { false }
    func windowWillClose(_ notification: Notification) { NSApp.setActivationPolicy(.accessory) }

    @objc private func quit() { NSApp.terminate(nil) }

    func applicationWillTerminate(_ notification: Notification) {
        permissionTimer?.invalidate()
        if let eventTap { CFMachPortInvalidate(eventTap) }
    }
}

MainActor.assumeIsolated {
    let application = NSApplication.shared
    let delegate = MailMarkdownApp()
    application.delegate = delegate
    withExtendedLifetime(delegate) { application.run() }
}
