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
    private var navigation: [NSButton] = []
    private let enabledSwitch = NSSwitch()
    private let loginSwitch = NSSwitch()
    private let statusDot = NSTextField(labelWithString: "●")
    private let statusTitle = NSTextField(labelWithString: "Einrichten")
    private let statusDetail = NSTextField(wrappingLabelWithString: "")
    private let permissionButton = NSButton(title: "Bedienungshilfen öffnen …", target: nil, action: nil)
    private let permissionLabel = NSTextField(wrappingLabelWithString: "")
    private let loginLabel = NSTextField(wrappingLabelWithString: "")
    private let loginSettingsButton = NSButton(title: "Anmeldeobjekte öffnen …", target: nil, action: nil)
    private let restoreButton = NSButton(title: "Original-Zwischenablage wiederherstellen", target: nil, action: nil)
    private let versionLabel = NSTextField(labelWithString: "")
    private let sourceEditor = NSTextView()
    private let previewEditor = NSTextView()

    init(actions: AppActions) {
        self.actions = actions
        let window = NSWindow(contentRect: NSRect(x: 0, y: 0, width: 900, height: 680),
                              styleMask: [.titled, .closable, .miniaturizable, .resizable],
                              backing: .buffered, defer: false)
        window.title = "Mail Markdown"
        window.minSize = NSSize(width: 780, height: 600)
        window.isReleasedWhenClosed = false
        window.setFrameAutosaveName("MailMarkdownMainWindow")
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
        permissionButton.isHidden = state.permissionGranted
        permissionLabel.stringValue = state.permissionGranted
            ? "Freigegeben. Mail Markdown kann den Textstil deines Entwurfs übernehmen."
            : "Erlaube den Zugriff, damit Mail Markdown ⌘V in Mail erkennen und den Textstil übernehmen kann."
        loginLabel.stringValue = state.loginStatus
        loginSettingsButton.isHidden = !state.loginNeedsApproval
        restoreButton.isEnabled = state.canRestoreClipboard
        versionLabel.stringValue = "Version \(state.version)"
        if !state.enabled {
            statusDot.textColor = .secondaryLabelColor
            statusTitle.stringValue = "Pausiert"
        } else if state.ready {
            statusDot.textColor = .systemGreen
            statusTitle.stringValue = "Bereit für Apple Mail"
        } else {
            statusDot.textColor = .systemOrange
            statusTitle.stringValue = state.permissionGranted ? "Verbindung wird geprüft" : "Einmalige Freigabe erforderlich"
        }
        statusDetail.stringValue = state.status == "Bereit für Apple Mail"
            ? "⌘V formatiert Markdown im Textstil deines Entwurfs."
            : state.status
    }

    private func buildWindow(_ window: NSWindow) {
        let root = NSView()
        window.contentView = root
        let sidebar = NSVisualEffectView()
        sidebar.material = .sidebar
        sidebar.blendingMode = .withinWindow
        sidebar.state = .active
        let divider = NSBox()
        divider.boxType = .separator
        pages.tabViewType = .noTabsNoBorder
        for view in [sidebar, divider, pages] { view.translatesAutoresizingMaskIntoConstraints = false; root.addSubview(view) }
        NSLayoutConstraint.activate([
            sidebar.leadingAnchor.constraint(equalTo: root.leadingAnchor), sidebar.topAnchor.constraint(equalTo: root.topAnchor),
            sidebar.bottomAnchor.constraint(equalTo: root.bottomAnchor), sidebar.widthAnchor.constraint(equalToConstant: 190),
            divider.leadingAnchor.constraint(equalTo: sidebar.trailingAnchor), divider.widthAnchor.constraint(equalToConstant: 1),
            divider.topAnchor.constraint(equalTo: root.topAnchor), divider.bottomAnchor.constraint(equalTo: root.bottomAnchor),
            pages.leadingAnchor.constraint(equalTo: divider.trailingAnchor), pages.trailingAnchor.constraint(equalTo: root.trailingAnchor),
            pages.topAnchor.constraint(equalTo: root.topAnchor), pages.bottomAnchor.constraint(equalTo: root.bottomAnchor)
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
        icon.widthAnchor.constraint(equalToConstant: 76).isActive = true
        icon.heightAnchor.constraint(equalToConstant: 76).isActive = true
        let name = label("Mail Markdown", size: 16, weight: .semibold)
        let subtitle = label("Für Apple Mail", size: 12, color: .secondaryLabelColor)
        name.alignment = .center
        subtitle.alignment = .center
        let brand = vertical([icon, name, subtitle], spacing: 3)
        brand.alignment = .centerX
        let buttons = vertical([], spacing: 6)
        for (index, entry) in [("Allgemein", "slider.horizontal.3"), ("Vorschau", "text.alignleft"), ("Hilfe", "questionmark.circle")].enumerated() {
            let button = NSButton(title: entry.0, target: self, action: #selector(navigate(_:)))
            button.tag = index
            button.image = NSImage(systemSymbolName: entry.1, accessibilityDescription: nil)
            button.imagePosition = .imageLeading
            button.alignment = .left
            button.bezelStyle = .recessed
            button.setButtonType(.pushOnPushOff)
            button.font = .systemFont(ofSize: 13, weight: .medium)
            button.translatesAutoresizingMaskIntoConstraints = false
            button.heightAnchor.constraint(equalToConstant: 34).isActive = true
            button.setAccessibilityIdentifier("navigation-\(index)")
            buttons.addArrangedSubview(button)
            button.widthAnchor.constraint(equalTo: buttons.widthAnchor).isActive = true
            navigation.append(button)
        }
        let spacer = NSView()
        spacer.setContentHuggingPriority(.defaultLow, for: .vertical)
        versionLabel.font = .systemFont(ofSize: 11)
        versionLabel.textColor = .tertiaryLabelColor
        let footer = vertical([label("Lokal auf deinem Mac.", size: 11, color: .secondaryLabelColor), versionLabel], spacing: 4)
        let contents = vertical([brand, buttons, spacer, footer], spacing: 28)
        sidebar.addSubview(contents)
        pin(contents, to: sidebar, insets: NSEdgeInsets(top: 26, left: 16, bottom: 20, right: 16))
    }

    private func overviewPage() -> NSView {
        let title = label("Markdown direkt in Apple Mail.", size: 25, weight: .semibold)
        let intro = body("Füge Markdown wie gewohnt mit ⌘V ein. Mail Markdown wandelt ihn in formatierten Text um und übernimmt die Schrift deines Entwurfs.")
        statusDot.font = .systemFont(ofSize: 17)
        statusDot.setAccessibilityElement(false)
        statusTitle.font = .systemFont(ofSize: 15, weight: .semibold)
        statusDetail.font = .systemFont(ofSize: 12)
        statusDetail.textColor = .secondaryLabelColor
        let status = horizontal([statusDot, vertical([statusTitle, statusDetail], spacing: 5)], spacing: 10)
        status.alignment = .top
        let switchText = vertical([
            label("Beim Einfügen formatieren", size: 14, weight: .medium),
            body("Nur im Nachrichtentext von Apple Mail.", size: 12)
        ], spacing: 4)
        enabledSwitch.target = self
        enabledSwitch.action = #selector(changeEnabled)
        enabledSwitch.setAccessibilityLabel("Beim Einfügen formatieren")
        enabledSwitch.setAccessibilityIdentifier("formatting-enabled")
        let formattingRow = horizontal([switchText, enabledSwitch], spacing: 16)
        switchText.setContentHuggingPriority(.defaultLow, for: .horizontal)
        enabledSwitch.setContentHuggingPriority(.required, for: .horizontal)
        let settings = vertical([status, separator(), formattingRow], spacing: 18)
        let statusCard = card(settings)

        permissionButton.target = self
        permissionButton.action = #selector(openAccessibility)
        permissionLabel.font = .systemFont(ofSize: 12)
        permissionLabel.textColor = .secondaryLabelColor
        let permissions = vertical([label("Bedienungshilfen", size: 13, weight: .semibold), permissionLabel, permissionButton], spacing: 7)

        loginSwitch.target = self
        loginSwitch.action = #selector(changeLogin)
        loginSwitch.setAccessibilityLabel("Beim Anmelden starten")
        loginSwitch.setAccessibilityIdentifier("launch-at-login")
        loginLabel.font = .systemFont(ofSize: 12)
        loginLabel.textColor = .secondaryLabelColor
        loginSettingsButton.target = self
        loginSettingsButton.action = #selector(openLoginSettings)
        let loginText = vertical([label("Beim Anmelden starten", size: 13, weight: .semibold), loginLabel], spacing: 5)
        loginText.setContentHuggingPriority(.defaultLow, for: .horizontal)
        loginSwitch.setContentHuggingPriority(.required, for: .horizontal)
        let login = vertical([horizontal([loginText, loginSwitch], spacing: 16), loginSettingsButton], spacing: 7)

        restoreButton.target = self
        restoreButton.action = #selector(restoreClipboard)
        let clipboard = vertical([restoreButton,
                                  body("Nach dem Umwandeln bleibt die formatierte Fassung in der Zwischenablage. Das Original kannst du hier zurückholen, solange du nichts Neues kopiert hast.", size: 11)], spacing: 6)
        let contents = vertical([title, intro, statusCard, permissions, separator(), login, separator(), clipboard], spacing: 20)
        return scrollingPage(contents)
    }

    private func previewPage() -> NSView {
        sourceEditor.isRichText = false
        sourceEditor.font = .monospacedSystemFont(ofSize: 13, weight: .regular)
        sourceEditor.textColor = .textColor
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
        previewEditor.setAccessibilityLabel("Formatierte Vorschau")
        previewEditor.setAccessibilityIdentifier("markdown-preview")
        let editors = horizontal([
            vertical([label("MARKDOWN", size: 10, weight: .semibold, color: .secondaryLabelColor), editorScroll(sourceEditor)], spacing: 9),
            vertical([label("VORSCHAU", size: 10, weight: .semibold, color: .secondaryLabelColor), editorScroll(previewEditor)], spacing: 9)
        ], spacing: 14)
        editors.distribution = .fillEqually
        editors.heightAnchor.constraint(equalToConstant: 380).isActive = true
        for column in editors.arrangedSubviews { column.heightAnchor.constraint(equalTo: editors.heightAnchor).isActive = true }
        let contents = vertical([
            label("Aus Text wird Format.", size: 25, weight: .semibold),
            body("Probiere Markdown hier aus. In Apple Mail verwendet die App den Textstil an deiner Einfügestelle; diese Vorschau zeigt einen neutralen Beispielstil."),
            editors,
            body("Fett · Kursiv · Links · Listen · Überschriften · Zitate · Code", size: 11)
        ], spacing: 20)
        updatePreview()
        return scrollingPage(contents)
    }

    private func helpPage() -> NSView {
        let instructions = vertical([
            instruction("1", "In Programme ablegen", "Ziehe Mail Markdown aus dem Installationsfenster in den Ordner Programme und öffne die App von dort."),
            instruction("2", "Einmal freigeben", "Erlaube Mail Markdown unter Datenschutz & Sicherheit → Bedienungshilfen den Zugriff. Die App zeigt dir anschließend ihren Status an."),
            instruction("3", "In Mail einfügen", "Öffne einen Rich-Text-Entwurf, setze den Cursor in bereits formatierten Text und füge Markdown mit ⌘V ein.")
        ], spacing: 20)
        let contents = vertical([
            label("Einrichten. Einfügen. Fertig.", size: 25, weight: .semibold),
            body("Mail Markdown läuft in der Menüleiste und arbeitet mit deinem gewohnten Mail-Fenster."),
            card(instructions),
            label("Schon eingefügten Markdown umwandeln", size: 14, weight: .semibold),
            body("Markiere den Markdown-Text, drücke ⌘C und danach ⌘V. Die Auswahl wird durch die formatierte Fassung ersetzt."),
            label("Gut zu wissen", size: 14, weight: .semibold),
            body("Die automatische Umwandlung gilt für ⌘V. Menü- und Rechtsklick-Einfügen werden nicht erfasst. Ist der Stil nicht lesbar oder der Entwurf leer, wird normal eingefügt. Überschriften behalten die Schriftgröße, Code erhält eine gleich große Festbreitenschrift."),
            label("Deine Texte bleiben lokal", size: 14, weight: .semibold),
            body("Nachrichten- und Zwischenablageninhalte werden auf deinem Mac verarbeitet und weder gespeichert noch hochgeladen. Bilder im Markdown erscheinen als Alternativtext.")
        ], spacing: 18)
        return scrollingPage(contents)
    }

    private func instruction(_ number: String, _ title: String, _ detail: String) -> NSView {
        let badge = label(number, size: 18, weight: .semibold, color: .secondaryLabelColor)
        badge.widthAnchor.constraint(equalToConstant: 22).isActive = true
        let row = horizontal([badge, vertical([label(title, size: 14, weight: .semibold), body(detail, size: 12)], spacing: 5)], spacing: 12)
        row.alignment = .top
        return row
    }

    private func scrollingPage(_ contents: NSStackView) -> NSView {
        let scroll = NSScrollView()
        scroll.hasVerticalScroller = true
        scroll.drawsBackground = false
        let document = FlippedDocumentView()
        scroll.documentView = document
        document.translatesAutoresizingMaskIntoConstraints = false
        document.addSubview(contents)
        pin(contents, to: document, insets: NSEdgeInsets(top: 30, left: 30, bottom: 30, right: 30))
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

    private func label(_ text: String, size: CGFloat, weight: NSFont.Weight = .regular, color: NSColor = .labelColor) -> NSTextField {
        let field = NSTextField(wrappingLabelWithString: text)
        field.font = .systemFont(ofSize: size, weight: weight)
        field.textColor = color
        field.translatesAutoresizingMaskIntoConstraints = false
        return field
    }

    private func body(_ text: String, size: CGFloat = 13) -> NSTextField {
        label(text, size: size, color: .secondaryLabelColor)
    }

    private func vertical(_ views: [NSView], spacing: CGFloat) -> NSStackView {
        let stack = NSStackView(views: views)
        stack.orientation = .vertical
        stack.alignment = .leading
        stack.spacing = spacing
        stack.translatesAutoresizingMaskIntoConstraints = false
        for view in views { stretch(view, in: stack) }
        return stack
    }

    private func horizontal(_ views: [NSView], spacing: CGFloat) -> NSStackView {
        let stack = NSStackView(views: views)
        stack.orientation = .horizontal
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

    private func card(_ content: NSView) -> NSView {
        let box = CardBackgroundView()
        box.addSubview(content)
        pin(content, to: box, insets: NSEdgeInsets(top: 18, left: 18, bottom: 18, right: 18))
        return box
    }

    private func separator() -> NSView { let line = NSBox(); line.boxType = .separator; return line }

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
        let style = DraftStyle(font: .systemFont(ofSize: 14), foregroundColor: .labelColor, paragraphStyle: paragraph)
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
private final class FlippedDocumentView: NSView {
    override var isFlipped: Bool { true }
}

@MainActor
private final class CardBackgroundView: NSView {
    override func draw(_ dirtyRect: NSRect) {
        let path = NSBezierPath(roundedRect: bounds.insetBy(dx: 0.5, dy: 0.5), xRadius: 12, yRadius: 12)
        NSColor.controlBackgroundColor.setFill()
        path.fill()
        NSColor.separatorColor.setStroke()
        path.lineWidth = 1
        path.stroke()
    }
}
