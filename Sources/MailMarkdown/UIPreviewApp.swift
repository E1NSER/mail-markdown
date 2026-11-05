import AppKit

/// An isolated development presentation of the real window controller.
/// No Accessibility queries, event taps, clipboard access, login registration,
/// persisted settings, or network requests run through this delegate.
@MainActor
final class UIPreviewApp: NSObject, NSApplicationDelegate {
    private var controller: AppWindowController?
    private var enabled = true
    private var permissionGranted = true
    private var launchAtLogin = false
    private var clipboardAvailable = false

    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.regular)
        NSApp.appearance = NSAppearance(named: .aqua)
        configureMenu()
        let actions = AppActions(
            setEnabled: { [weak self] value in self?.enabled = value; self?.refresh() },
            openAccessibility: { [weak self] in self?.permissionGranted = true; self?.refresh() },
            setLaunchAtLogin: { [weak self] value in self?.launchAtLogin = value; self?.refresh() },
            openLoginItems: {},
            restoreClipboard: { [weak self] in self?.clipboardAvailable = false; self?.refresh() }
        )
        controller = AppWindowController(actions: actions, persistWindowFrame: false)
        refresh()
        controller?.present()
    }

    private func refresh() {
        controller?.update(AppViewState(
            enabled: enabled, permissionGranted: permissionGranted,
            ready: permissionGranted,
            status: permissionGranted ? (enabled ? "Bereit für Apple Mail" : "Pausiert") : "Bedienungshilfen erforderlich",
            canRestoreClipboard: clipboardAvailable,
            launchAtLogin: launchAtLogin, loginNeedsApproval: false,
            loginStatus: launchAtLogin ? "Mail Markdown startet bei der Anmeldung." : "Der automatische Start ist ausgeschaltet.",
            version: Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "Development"
        ))
    }

    private func configureMenu() {
        let menu = NSMenu()
        let appItem = NSMenuItem()
        let appMenu = NSMenu()
        appMenu.addItem(NSMenuItem(title: "UI-Vorschau beenden", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q"))
        appItem.submenu = appMenu
        menu.addItem(appItem)
        let editItem = NSMenuItem()
        let editMenu = NSMenu(title: "Bearbeiten")
        for (title, action, key) in [
            ("Widerrufen", Selector(("undo:")), "z"),
            ("Ausschneiden", #selector(NSText.cut(_:)), "x"),
            ("Kopieren", #selector(NSText.copy(_:)), "c"),
            ("Einfügen", #selector(NSText.paste(_:)), "v"),
            ("Alles auswählen", #selector(NSText.selectAll(_:)), "a")
        ] { editMenu.addItem(NSMenuItem(title: title, action: action, keyEquivalent: key)) }
        editItem.submenu = editMenu
        menu.addItem(editItem)
        let appearanceItem = NSMenuItem()
        let appearanceMenu = NSMenu(title: "Vorschau")
        for (title, action) in [
            ("Helle Darstellung", #selector(showLight)),
            ("Dunkle Darstellung", #selector(showDark)),
            ("Status: Bereit", #selector(showReady)),
            ("Status: Freigabe erforderlich", #selector(showPermissionRequired)),
            ("Zwischenablage: Beispiel verfügbar", #selector(showClipboardAvailable))
        ] {
            let item = NSMenuItem(title: title, action: action, keyEquivalent: "")
            item.target = self
            appearanceMenu.addItem(item)
        }
        appearanceItem.submenu = appearanceMenu
        menu.addItem(appearanceItem)
        NSApp.mainMenu = menu
    }

    @objc private func showLight() { NSApp.appearance = NSAppearance(named: .aqua) }
    @objc private func showDark() { NSApp.appearance = NSAppearance(named: .darkAqua) }
    @objc private func showReady() { enabled = true; permissionGranted = true; refresh() }
    @objc private func showPermissionRequired() { permissionGranted = false; refresh() }
    @objc private func showClipboardAvailable() { clipboardAvailable = true; refresh() }
    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { true }
}
