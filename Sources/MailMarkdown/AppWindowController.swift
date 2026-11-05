import AppKit
import MailMarkdownCore

@MainActor
struct AppViewState {
    let enabled: Bool
    let permissionGranted: Bool
    let ready: Bool
    let status: String
    let canRestoreClipboard: Bool
    let launchAtLogin: Bool
    let loginNeedsApproval: Bool
    let loginStatus: String
    let version: String
}

@MainActor
struct AppActions {
    let setEnabled: (Bool) -> Void
    let openAccessibility: () -> Void
    let setLaunchAtLogin: (Bool) -> Void
    let openLoginItems: () -> Void
    let restoreClipboard: () -> Void
}

@MainActor
final class AppWindowController: NSWindowController, NSTextViewDelegate {
    private let actions: AppActions
    private let pages = NSTabView()
    private var navigation: [NativeNavigationButton] = []
    private let enabledSwitch = NSSwitch()
    private let loginSwitch = NSSwitch()
    private let statusDot = NativeStatusDot()
    private let statusTitle = NSTextField(labelWithString: "")
    private let statusDetail = NSTextField(wrappingLabelWithString: "")
    private let permissionDot = NativeStatusDot()
    private let permissionStatus = NSTextField(labelWithString: "")
    private let permissionButton = NSButton(title: "Bedienungshilfen öffnen …", target: nil, action: nil)
    private let permissionLabel = NSTextField(wrappingLabelWithString: "")
    private let permissionDetails = NSStackView()
    private let loginLabel = NSTextField(wrappingLabelWithString: "")
    private let loginSettingsButton = NSButton(title: "Anmeldeobjekte öffnen …", target: nil, action: nil)
    private let loginDetails = NSStackView()
    private let restoreButton = NSButton(title: "Original wiederherstellen", target: nil, action: nil)
    private let clipboardLabel = NSTextField(wrappingLabelWithString: "")
    private let versionLabel = NSTextField(labelWithString: "")
    private let sourceEditor = NSTextView()
    private let previewEditor = NSTextView()

    init(actions: AppActions, persistWindowFrame: Bool = true) {
        self.actions = actions
        let window = NSWindow(contentRect: NSRect(x: 0, y: 0, width: 900, height: 638),
                              styleMask: [.titled, .closable, .miniaturizable, .resizable, .fullSizeContentView],
                              backing: .buffered, defer: false)
        window.title = "Mail Markdown"
        window.titlebarAppearsTransparent = true
        window.backgroundColor = NativePalette.background
        window.minSize = NSSize(width: 780, height: 600)
        window.isReleasedWhenClosed = false
        window.setFrame(NSRect(x: 0, y: 0, width: 900, height: 680), display: false)
        if persistWindowFrame { window.setFrameAutosaveName("MailMarkdownMainWindow") }
        super.init(window: window)
        buildWindow(window)
        window.center()
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) has not been implemented") }

    func present() {
        showWindow(nil)
        window?.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
    }

    func showHelpPage() { selectPage(2); present() }

    func update(_ state: AppViewState) {
        enabledSwitch.state = state.enabled ? .on : .off
        loginSwitch.state = state.launchAtLogin ? .on : .off
        permissionDetails.isHidden = state.permissionGranted
        permissionStatus.stringValue = state.permissionGranted ? "Freigegeben" : "Nicht freigegeben"
        permissionStatus.textColor = state.permissionGranted ? NativePalette.success : .systemOrange
        permissionDot.color = state.permissionGranted ? NativePalette.success : .systemOrange
        permissionLabel.stringValue = "Erlaube den Zugriff, damit Mail Markdown ⌘V in Apple Mail erkennen und den Textstil deines Entwurfs übernehmen kann."
        loginLabel.stringValue = state.loginStatus
        loginSettingsButton.isHidden = !state.loginNeedsApproval
        let ordinaryLoginStates = ["Mail Markdown startet bei der Anmeldung.", "Der automatische Start ist ausgeschaltet."]
        loginDetails.isHidden = !state.loginNeedsApproval && ordinaryLoginStates.contains(state.loginStatus)
        restoreButton.isEnabled = state.canRestoreClipboard
        clipboardLabel.stringValue = state.canRestoreClipboard
            ? "Das Original bleibt verfügbar, solange du nichts Neues kopierst oder die App beendest."
            : "Nach der nächsten Markdown-Umwandlung verfügbar."
        versionLabel.stringValue = "Version \(state.version)"
        if !state.enabled {
            statusDot.color = NativePalette.secondary
            statusTitle.textColor = NativePalette.secondary
            statusTitle.stringValue = "Pausiert"
        } else if !state.permissionGranted {
            statusDot.color = .systemOrange
            statusTitle.textColor = .systemOrange
            statusTitle.stringValue = "Freigabe erforderlich"
        } else if state.ready {
            statusDot.color = NativePalette.success
            statusTitle.textColor = NativePalette.success
            statusTitle.stringValue = "Bereit für Apple Mail"
        } else {
            statusDot.color = .systemOrange
            statusTitle.textColor = .systemOrange
            statusTitle.stringValue = "Verbindung wird geprüft"
        }
        let ordinaryStatus = ["", "Bereit für Apple Mail", "Pausiert", "Bedienungshilfen erforderlich", "Wird gestartet …", "Markdown bereitgestellt · Stil aus dem Entwurf"]
        statusDetail.stringValue = state.status
        statusDetail.isHidden = ordinaryStatus.contains(state.status)
    }

    private func buildWindow(_ window: NSWindow) {
        let root = NativeBackgroundView(color: NativePalette.background)
        window.contentView = root
        let sidebar = NativeBackgroundView(color: NativePalette.sidebar)
        pages.tabViewType = .noTabsNoBorder
        pages.drawsBackground = false
        for view in [sidebar, pages] { view.translatesAutoresizingMaskIntoConstraints = false; root.addSubview(view) }
        // Reserve the design's 42pt titlebar while retaining the actual native
        // window controls, title, keyboard behavior and resize affordances.
        NSLayoutConstraint.activate([
            sidebar.leadingAnchor.constraint(equalTo: root.leadingAnchor),
            sidebar.topAnchor.constraint(equalTo: root.topAnchor, constant: 42),
            sidebar.bottomAnchor.constraint(equalTo: root.bottomAnchor),
            sidebar.widthAnchor.constraint(equalToConstant: 180),
            pages.leadingAnchor.constraint(equalTo: sidebar.trailingAnchor),
            pages.trailingAnchor.constraint(equalTo: root.trailingAnchor),
            pages.topAnchor.constraint(equalTo: sidebar.topAnchor),
            pages.bottomAnchor.constraint(equalTo: root.bottomAnchor)
        ])
        buildSidebar(sidebar)
        for (identifier, page) in [("general", overviewPage()), ("preview", previewPage()), ("help", helpPage())] {
            let tab = NSTabViewItem(identifier: identifier)
            tab.view = page
            pages.addTabViewItem(tab)
        }
        selectPage(0)
    }

    private func buildSidebar(_ sidebar: NSView) {
        let icon = NSImageView()
        icon.image = NSApp.applicationIconImage
        icon.imageScaling = .scaleProportionallyUpOrDown
        icon.setAccessibilityElement(false)
        icon.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            icon.widthAnchor.constraint(equalToConstant: 32),
            icon.heightAnchor.constraint(equalToConstant: 32)
        ])
        let name = label("Mail Markdown", size: 13, weight: .semibold)
        name.maximumNumberOfLines = 1
        name.lineBreakMode = .byTruncatingTail
        let brand = horizontal([icon, name], spacing: 10)
        let buttons = vertical([], spacing: 4)
        for (index, entry) in [("Allgemein", "slider.horizontal.3"),
                               ("Vorschau", "doc.richtext"),
                               ("Hilfe", "questionmark.circle")].enumerated() {
            let button = NativeNavigationButton(title: entry.0, symbolName: entry.1)
            button.tag = index
            button.target = self
            button.action = #selector(navigate(_:))
            button.setAccessibilityIdentifier("navigation-\(index)")
            buttons.addArrangedSubview(button)
            button.widthAnchor.constraint(equalTo: buttons.widthAnchor).isActive = true
            button.heightAnchor.constraint(equalToConstant: 34).isActive = true
            navigation.append(button)
        }
        versionLabel.font = .systemFont(ofSize: 12)
        versionLabel.textColor = NativePalette.subtle
        let footer = vertical([body("Lokal auf deinem Mac.", size: 12), versionLabel], spacing: 4)
        for view in [brand, buttons, footer] { sidebar.addSubview(view) }
        NSLayoutConstraint.activate([
            brand.leadingAnchor.constraint(equalTo: sidebar.leadingAnchor, constant: 20),
            brand.trailingAnchor.constraint(equalTo: sidebar.trailingAnchor, constant: -20),
            brand.topAnchor.constraint(equalTo: sidebar.topAnchor, constant: 20),
            brand.heightAnchor.constraint(equalToConstant: 36),
            buttons.leadingAnchor.constraint(equalTo: brand.leadingAnchor),
            buttons.trailingAnchor.constraint(equalTo: brand.trailingAnchor),
            buttons.topAnchor.constraint(equalTo: brand.bottomAnchor, constant: 28),
            footer.leadingAnchor.constraint(equalTo: brand.leadingAnchor),
            footer.trailingAnchor.constraint(equalTo: brand.trailingAnchor),
            footer.bottomAnchor.constraint(equalTo: sidebar.bottomAnchor, constant: -20),
            footer.topAnchor.constraint(greaterThanOrEqualTo: buttons.bottomAnchor, constant: 24)
        ])
    }

    private func overviewPage() -> NSView {
        statusTitle.font = .systemFont(ofSize: 12)
        statusTitle.setContentCompressionResistancePriority(.required, for: .horizontal)
        let status = horizontal([statusDot, statusTitle], spacing: 8)
        status.setContentHuggingPriority(.required, for: .horizontal)
        statusDetail.font = .systemFont(ofSize: 12)
        statusDetail.textColor = NativePalette.secondary
        statusDetail.isHidden = true

        enabledSwitch.target = self
        enabledSwitch.action = #selector(changeEnabled)
        enabledSwitch.setAccessibilityLabel("Beim Einfügen formatieren")
        enabledSwitch.setAccessibilityIdentifier("formatting-enabled")
        let switchText = vertical([
            label("Beim Einfügen formatieren", size: 13, weight: .medium),
            body("Nur im Nachrichtentext von Apple Mail.", size: 12)
        ], spacing: 3)
        let keycap = NativeKeycapView()
        let formatting = section("Formatierung", views: [
            row(switchText, trailing: enabledSwitch, height: 52),
            separator(),
            row(label("Tastenkürzel", size: 13, weight: .medium), trailing: keycap, height: 42),
            separator(),
            row(label("Schrift, Größe und Farbe", size: 13, weight: .medium),
                trailing: body("Aus dem Mail-Entwurf", size: 12), height: 42)
        ])

        permissionStatus.font = .systemFont(ofSize: 12)
        let permissionBadge = horizontal([permissionDot, permissionStatus], spacing: 8)
        permissionLabel.font = .systemFont(ofSize: 12)
        permissionLabel.textColor = NativePalette.secondary
        permissionButton.target = self
        permissionButton.action = #selector(openAccessibility)
        configureButton(permissionButton)
        configureDetails(permissionDetails, views: [permissionLabel, permissionButton])

        loginSwitch.target = self
        loginSwitch.action = #selector(changeLogin)
        loginSwitch.setAccessibilityLabel("Beim Anmelden starten")
        loginSwitch.setAccessibilityIdentifier("launch-at-login")
        loginLabel.font = .systemFont(ofSize: 12)
        loginLabel.textColor = NativePalette.secondary
        loginSettingsButton.target = self
        loginSettingsButton.action = #selector(openLoginSettings)
        configureButton(loginSettingsButton)
        configureDetails(loginDetails, views: [loginLabel, loginSettingsButton])
        let system = section("System", views: [
            row(label("Bedienungshilfen", size: 13, weight: .medium), trailing: permissionBadge, height: 46),
            permissionDetails,
            separator(),
            row(label("Beim Anmelden starten", size: 13, weight: .medium), trailing: loginSwitch, height: 46),
            loginDetails
        ])

        restoreButton.target = self
        restoreButton.action = #selector(restoreClipboard)
        restoreButton.setAccessibilityLabel("Original-Zwischenablage wiederherstellen")
        configureButton(restoreButton)
        clipboardLabel.font = .systemFont(ofSize: 12)
        clipboardLabel.textColor = NativePalette.secondary
        let clipboard = section("Zwischenablage", views: [restoreButton, clipboardLabel])
        return scrollingPage(vertical([pageHeader("Allgemein", trailing: status), statusDetail, formatting, system, clipboard], spacing: 20))
    }

    private func previewPage() -> NSView {
        sourceEditor.isRichText = false
        sourceEditor.font = .monospacedSystemFont(ofSize: 13, weight: .regular)
        sourceEditor.textColor = NativePalette.ink
        sourceEditor.backgroundColor = NativePalette.background
        sourceEditor.isAutomaticQuoteSubstitutionEnabled = false
        sourceEditor.isAutomaticDashSubstitutionEnabled = false
        sourceEditor.isAutomaticTextReplacementEnabled = false
        sourceEditor.isAutomaticSpellingCorrectionEnabled = false
        sourceEditor.allowsUndo = true
        sourceEditor.delegate = self
        sourceEditor.setAccessibilityLabel("Markdown eingeben")
        sourceEditor.setAccessibilityIdentifier("markdown-source")
        sourceEditor.string = "# Hallo!\n\n**Fett**, *kursiv* und [ein Link](https://example.com).\n\n- Erster Punkt\n- Zweiter Punkt\n\n> Ein kurzes Zitat."
        previewEditor.isEditable = false
        previewEditor.isSelectable = true
        previewEditor.backgroundColor = NativePalette.background
        previewEditor.setAccessibilityLabel("Formatierte Vorschau")
        previewEditor.setAccessibilityIdentifier("markdown-preview")
        let editors = horizontal([
            vertical([sectionLabel("Markdown"), editorScroll(sourceEditor)], spacing: 8),
            vertical([sectionLabel("Formatierte Vorschau"), editorScroll(previewEditor)], spacing: 8)
        ], spacing: 16)
        editors.distribution = .fillEqually
        editors.heightAnchor.constraint(equalToConstant: 380).isActive = true
        for column in editors.arrangedSubviews { column.heightAnchor.constraint(equalTo: editors.heightAnchor).isActive = true }
        let contents = vertical([
            pageHeader("Vorschau"),
            body("Probiere Markdown hier aus. In Apple Mail verwendet die App den Textstil an deiner Einfügestelle; diese Vorschau zeigt einen neutralen Beispielstil."),
            editors,
            body("Fett · Kursiv · Links · Listen · Überschriften · Zitate · Code", size: 12)
        ], spacing: 20)
        updatePreview()
        return scrollingPage(contents)
    }

    private func helpPage() -> NSView {
        let instructions = vertical([
            instruction("1", "In Programme ablegen", "Ziehe Mail Markdown aus dem Installationsfenster in den Ordner Programme und öffne die App von dort."),
            instruction("2", "Einmal freigeben", "Erlaube Mail Markdown unter Datenschutz & Sicherheit → Bedienungshilfen den Zugriff. Die App zeigt dir anschließend ihren Status an."),
            instruction("3", "In Mail einfügen", "Öffne einen Rich-Text-Entwurf, setze den Cursor in bereits formatierten Text und füge Markdown mit ⌘V ein.")
        ], spacing: 18)
        let contents = vertical([
            pageHeader("Hilfe"),
            body("Mail Markdown läuft in der Menüleiste und arbeitet mit deinem gewohnten Mail-Fenster."),
            section("Erste Schritte", views: [instructions]),
            separator(),
            vertical([label("Bereits eingefügten Markdown umwandeln", size: 13, weight: .medium),
                      body("Markiere den Markdown-Text, drücke ⌘C und danach ⌘V. Die Auswahl wird durch die formatierte Fassung ersetzt.", size: 12)], spacing: 6),
            vertical([label("Gut zu wissen", size: 13, weight: .medium),
                      body("Die automatische Umwandlung gilt für ⌘V. Menü- und Rechtsklick-Einfügen werden nicht erfasst. Ist der Stil nicht lesbar oder der Entwurf leer, wird normal eingefügt. Überschriften behalten die Schriftgröße, Code erhält eine gleich große Festbreitenschrift.", size: 12)], spacing: 6),
            vertical([label("Deine Texte bleiben lokal", size: 13, weight: .medium),
                      body("Nachrichten- und Zwischenablageninhalte werden auf deinem Mac verarbeitet und weder gespeichert noch hochgeladen. Bilder im Markdown erscheinen als Alternativtext.", size: 12)], spacing: 6)
        ], spacing: 20)
        return scrollingPage(contents)
    }

    private func pageHeader(_ title: String, trailing: NSView? = nil) -> NSView {
        let heading = label(title, size: 20, weight: .semibold)
        let header = horizontal(trailing.map { [heading, $0] } ?? [heading], spacing: 16)
        heading.setContentHuggingPriority(.defaultLow, for: .horizontal)
        header.heightAnchor.constraint(equalToConstant: 30).isActive = true
        return header
    }

    private func sectionLabel(_ text: String) -> NSTextField {
        let field = label(text, size: 12, weight: .medium, color: NativePalette.secondary)
        field.heightAnchor.constraint(equalToConstant: 18).isActive = true
        return field
    }

    private func section(_ title: String, views: [NSView]) -> NSStackView {
        vertical([sectionLabel(title)] + views, spacing: 8)
    }

    private func row(_ leading: NSView, trailing: NSView, height: CGFloat) -> NSView {
        leading.setContentHuggingPriority(.defaultLow, for: .horizontal)
        leading.setContentCompressionResistancePriority(.defaultLow, for: .horizontal)
        trailing.setContentHuggingPriority(.required, for: .horizontal)
        trailing.setContentCompressionResistancePriority(.required, for: .horizontal)
        let result = horizontal([leading, trailing], spacing: 12)
        result.heightAnchor.constraint(equalToConstant: height).isActive = true
        return result
    }

    private func configureButton(_ button: NSButton) {
        button.bezelStyle = .rounded
        button.controlSize = .regular
        button.font = .systemFont(ofSize: 13, weight: .medium)
        button.translatesAutoresizingMaskIntoConstraints = false
        button.heightAnchor.constraint(equalToConstant: 34).isActive = true
    }

    private func configureDetails(_ details: NSStackView, views: [NSView]) {
        details.orientation = .vertical
        details.alignment = .leading
        details.spacing = 8
        details.detachesHiddenViews = true
        details.translatesAutoresizingMaskIntoConstraints = false
        for view in views { details.addArrangedSubview(view); stretch(view, in: details) }
        details.isHidden = true
    }

    private func instruction(_ number: String, _ title: String, _ detail: String) -> NSView {
        let badge = label(number, size: 13, weight: .semibold, color: NativePalette.secondary)
        badge.widthAnchor.constraint(equalToConstant: 22).isActive = true
        let text = vertical([label(title, size: 13, weight: .medium), body(detail, size: 12)], spacing: 5)
        let result = horizontal([badge, text], spacing: 12)
        result.alignment = .top
        return result
    }

    private func scrollingPage(_ contents: NSStackView) -> NSView {
        let scroll = NSScrollView()
        scroll.hasVerticalScroller = true
        scroll.autohidesScrollers = true
        scroll.drawsBackground = false
        scroll.automaticallyAdjustsContentInsets = false
        let document = FlippedDocumentView()
        scroll.documentView = document
        document.translatesAutoresizingMaskIntoConstraints = false
        document.addSubview(contents)
        pin(contents, to: document, insets: NSEdgeInsets(top: 28, left: 28, bottom: 28, right: 28))
        document.widthAnchor.constraint(equalTo: scroll.contentView.widthAnchor).isActive = true
        document.leadingAnchor.constraint(equalTo: scroll.contentView.leadingAnchor).isActive = true
        document.topAnchor.constraint(equalTo: scroll.contentView.topAnchor).isActive = true
        return scroll
    }

    private func editorScroll(_ editor: NSTextView) -> NSScrollView {
        let scroll = NSScrollView(frame: NSRect(x: 0, y: 0, width: 260, height: 350))
        scroll.borderType = .bezelBorder
        scroll.hasVerticalScroller = true
        scroll.autohidesScrollers = true
        scroll.documentView = editor
        editor.frame = scroll.contentView.bounds
        editor.minSize = NSSize(width: 0, height: 0)
        editor.maxSize = NSSize(width: CGFloat.greatestFiniteMagnitude, height: CGFloat.greatestFiniteMagnitude)
        editor.isVerticallyResizable = true
        editor.isHorizontallyResizable = false
        editor.autoresizingMask = [.width]
        editor.textContainer?.widthTracksTextView = true
        editor.textContainer?.containerSize = NSSize(width: 200, height: CGFloat.greatestFiniteMagnitude)
        editor.textContainerInset = NSSize(width: 12, height: 14)
        return scroll
    }

    private func label(_ text: String, size: CGFloat, weight: NSFont.Weight = .regular, color: NSColor? = nil) -> NSTextField {
        let field = NSTextField(wrappingLabelWithString: text)
        field.font = .systemFont(ofSize: size, weight: weight)
        field.textColor = color ?? NativePalette.ink
        field.translatesAutoresizingMaskIntoConstraints = false
        return field
    }

    private func body(_ text: String, size: CGFloat = 13) -> NSTextField {
        label(text, size: size, color: NativePalette.secondary)
    }

    private func vertical(_ views: [NSView], spacing: CGFloat) -> NSStackView {
        let stack = NSStackView(views: views)
        stack.orientation = .vertical
        stack.alignment = .leading
        stack.spacing = spacing
        stack.detachesHiddenViews = true
        stack.translatesAutoresizingMaskIntoConstraints = false
        for view in views { stretch(view, in: stack) }
        return stack
    }

    private func horizontal(_ views: [NSView], spacing: CGFloat) -> NSStackView {
        let stack = NSStackView(views: views)
        stack.orientation = .horizontal
        stack.distribution = .fill
        stack.alignment = .centerY
        stack.spacing = spacing
        stack.translatesAutoresizingMaskIntoConstraints = false
        return stack
    }

    private func stretch(_ view: NSView, in stack: NSStackView) {
        if !(view is NSButton), !(view is NSImageView) {
            view.widthAnchor.constraint(equalTo: stack.widthAnchor).isActive = true
        }
    }

    private func separator() -> NSView {
        let line = NativeBackgroundView(color: NativePalette.border)
        line.translatesAutoresizingMaskIntoConstraints = false
        line.heightAnchor.constraint(equalToConstant: 1).isActive = true
        return line
    }

    private func pin(_ child: NSView, to parent: NSView, insets: NSEdgeInsets) {
        child.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            child.leadingAnchor.constraint(equalTo: parent.leadingAnchor, constant: insets.left),
            child.trailingAnchor.constraint(equalTo: parent.trailingAnchor, constant: -insets.right),
            child.topAnchor.constraint(equalTo: parent.topAnchor, constant: insets.top),
            child.bottomAnchor.constraint(equalTo: parent.bottomAnchor, constant: -insets.bottom)
        ])
    }

    private func selectPage(_ index: Int) {
        pages.selectTabViewItem(at: index)
        for button in navigation { button.state = button.tag == index ? .on : .off }
    }

    private func updatePreview() {
        let paragraph = NSMutableParagraphStyle()
        paragraph.paragraphSpacing = 5
        let style = DraftStyle(font: .systemFont(ofSize: 14), foregroundColor: NativePalette.ink, paragraphStyle: paragraph)
        previewEditor.textStorage?.setAttributedString(MarkdownRenderer().render(sourceEditor.string, style: style))
    }

    func textDidChange(_ notification: Notification) { updatePreview() }
    @objc private func navigate(_ sender: NSButton) { selectPage(sender.tag) }
    @objc private func changeEnabled() { actions.setEnabled(enabledSwitch.state == .on) }
    @objc private func changeLogin() { actions.setLaunchAtLogin(loginSwitch.state == .on) }
    @objc private func openAccessibility() { actions.openAccessibility() }
    @objc private func openLoginSettings() { actions.openLoginItems() }
    @objc private func restoreClipboard() { actions.restoreClipboard() }
}

@MainActor
private enum NativePalette {
    static let background = adaptive("background", light: 0xffffff, dark: 0x232326)
    static let sidebar = adaptive("sidebar", light: 0xf5f5f7, dark: 0x1d1d20)
    static let ink = adaptive("ink", light: 0x1d1d1f, dark: 0xf5f5f7)
    static let secondary = adaptive("secondary", light: 0x6e6e73, dark: 0xa1a1a6)
    static let subtle = adaptive("subtle", light: 0x707075, dark: 0x96969d)
    static let border = adaptive("border", light: 0xe5e5ea, dark: 0x3a3a3c)
    static let mutedSurface = adaptive("mutedSurface", light: 0xf2f2f7, dark: 0x353538)
    static let accentTint = adaptive("accentTint", light: 0xe6f1ff, dark: 0x173553)
    static let accentText = adaptive("accentText", light: 0x005ec4, dark: 0x64b2ff)
    static let success = adaptive("success", light: 0x217b37, dark: 0x32d74b)

    private static func adaptive(_ name: String, light: Int, dark: Int) -> NSColor {
        NSColor(name: NSColor.Name("MailMarkdown.\(name)")) { appearance in
            let value = appearance.bestMatch(from: [.darkAqua, .aqua]) == .darkAqua ? dark : light
            return NSColor(srgbRed: CGFloat((value >> 16) & 255) / 255,
                           green: CGFloat((value >> 8) & 255) / 255,
                           blue: CGFloat(value & 255) / 255, alpha: 1)
        }
    }
}

@MainActor
private final class FlippedDocumentView: NSView {
    override var isFlipped: Bool { true }
}

@MainActor
private class NativeBackgroundView: NSView {
    private let color: NSColor
    init(color: NSColor) { self.color = color; super.init(frame: .zero) }
    required init?(coder: NSCoder) { fatalError("init(coder:) has not been implemented") }
    override func draw(_ dirtyRect: NSRect) { color.setFill(); bounds.fill() }
    override func viewDidChangeEffectiveAppearance() { super.viewDidChangeEffectiveAppearance(); needsDisplay = true }
}

@MainActor
private final class NativeStatusDot: NSView {
    var color: NSColor = NativePalette.success { didSet { needsDisplay = true } }
    override init(frame frameRect: NSRect) {
        super.init(frame: frameRect)
        translatesAutoresizingMaskIntoConstraints = false
        widthAnchor.constraint(equalToConstant: 6).isActive = true
        heightAnchor.constraint(equalToConstant: 6).isActive = true
        setAccessibilityElement(false)
    }
    convenience init() { self.init(frame: .zero) }
    required init?(coder: NSCoder) { fatalError("init(coder:) has not been implemented") }
    override func draw(_ dirtyRect: NSRect) { color.setFill(); NSBezierPath(ovalIn: bounds).fill() }
    override func viewDidChangeEffectiveAppearance() { super.viewDidChangeEffectiveAppearance(); needsDisplay = true }
}

@MainActor
private final class NativeKeycapView: NSView {
    override init(frame frameRect: NSRect) {
        super.init(frame: frameRect)
        translatesAutoresizingMaskIntoConstraints = false
        widthAnchor.constraint(equalToConstant: 36).isActive = true
        heightAnchor.constraint(equalToConstant: 24).isActive = true
        let label = NSTextField(labelWithString: "⌘V")
        label.font = .systemFont(ofSize: 13, weight: .medium)
        label.textColor = NativePalette.ink
        label.translatesAutoresizingMaskIntoConstraints = false
        addSubview(label)
        NSLayoutConstraint.activate([label.centerXAnchor.constraint(equalTo: centerXAnchor), label.centerYAnchor.constraint(equalTo: centerYAnchor)])
        setAccessibilityLabel("Tastenkürzel Befehl V")
    }
    convenience init() { self.init(frame: .zero) }
    required init?(coder: NSCoder) { fatalError("init(coder:) has not been implemented") }
    override func draw(_ dirtyRect: NSRect) {
        let path = NSBezierPath(roundedRect: bounds.insetBy(dx: 0.5, dy: 0.5), xRadius: 6, yRadius: 6)
        NativePalette.mutedSurface.setFill(); path.fill()
        NativePalette.border.setStroke(); path.lineWidth = 1; path.stroke()
    }
    override func viewDidChangeEffectiveAppearance() { super.viewDidChangeEffectiveAppearance(); needsDisplay = true }
}

@MainActor
private final class NativeNavigationButton: NSButton {
    private let icon = NSImageView()
    private let titleLabel: NSTextField
    init(title: String, symbolName: String) {
        titleLabel = NSTextField(labelWithString: title)
        super.init(frame: .zero)
        self.title = ""
        isBordered = false
        setButtonType(.pushOnPushOff)
        setAccessibilityLabel(title)
        translatesAutoresizingMaskIntoConstraints = false
        icon.image = NSImage(systemSymbolName: symbolName, accessibilityDescription: nil)
        icon.image?.isTemplate = true
        icon.imageScaling = .scaleProportionallyUpOrDown
        icon.setAccessibilityElement(false)
        titleLabel.font = .systemFont(ofSize: 13, weight: .medium)
        titleLabel.setAccessibilityElement(false)
        for view in [icon, titleLabel] { view.translatesAutoresizingMaskIntoConstraints = false; addSubview(view) }
        NSLayoutConstraint.activate([
            icon.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 10),
            icon.centerYAnchor.constraint(equalTo: centerYAnchor),
            icon.widthAnchor.constraint(equalToConstant: 16), icon.heightAnchor.constraint(equalToConstant: 16),
            titleLabel.leadingAnchor.constraint(equalTo: icon.trailingAnchor, constant: 8),
            titleLabel.trailingAnchor.constraint(lessThanOrEqualTo: trailingAnchor, constant: -10),
            titleLabel.centerYAnchor.constraint(equalTo: centerYAnchor)
        ])
        updateTint()
    }
    required init?(coder: NSCoder) { fatalError("init(coder:) has not been implemented") }
    override var state: NSControl.StateValue { didSet { updateTint(); needsDisplay = true } }
    override func hitTest(_ point: NSPoint) -> NSView? {
        super.hitTest(point) == nil ? nil : self
    }
    private func updateTint() {
        let color = state == .on ? NativePalette.accentText : NativePalette.ink
        titleLabel.textColor = color
        icon.contentTintColor = color
    }
    override func draw(_ dirtyRect: NSRect) {
        if state == .on || cell?.isHighlighted == true {
            (state == .on ? NativePalette.accentTint : NativePalette.mutedSurface).setFill()
            NSBezierPath(roundedRect: bounds, xRadius: 6, yRadius: 6).fill()
        }
    }
    override var focusRingMaskBounds: NSRect { bounds }
    override func drawFocusRingMask() { NSBezierPath(roundedRect: bounds, xRadius: 6, yRadius: 6).fill() }
    override func viewDidChangeEffectiveAppearance() { super.viewDidChangeEffectiveAppearance(); updateTint(); needsDisplay = true }
}
