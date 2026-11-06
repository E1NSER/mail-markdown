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
        AppLanguage.select(.english, persist: false)
        NSApp.setActivationPolicy(.regular)
        NSApp.appearance = NSAppearance(named: .aqua)
        configureMenu()
        let actions = AppActions(
            setEnabled: { [weak self] value in self?.enabled = value; self?.refresh() },
            openAccessibility: { [weak self] in self?.permissionGranted = true; self?.refresh() },
            setLaunchAtLogin: { [weak self] value in self?.launchAtLogin = value; self?.refresh() },
            openLoginItems: {},
            restoreClipboard: { [weak self] in self?.clipboardAvailable = false; self?.refresh() },
            setLanguage: { [weak self] in self?.setLanguage($0) }
        )
        controller = AppWindowController(actions: actions, persistWindowFrame: false)
        refresh()
        controller?.present()
    }

    private func setLanguage(_ language: AppLanguage) {
        guard language != AppLanguage.current else { return }
        AppLanguage.select(language, persist: false)
        configureMenu()
        if let previous = controller {
            let replacement = previous.localizedReplacement()
            controller = replacement
            refresh()
            replacement.present()
            previous.close()
        }
    }

    private func refresh() {
        controller?.update(AppViewState(
            enabled: enabled, permissionGranted: permissionGranted,
            ready: permissionGranted,
            status: permissionGranted ? (enabled ? L("Ready for Apple Mail") : L("Paused")) : L("Accessibility permission required"),
            canRestoreClipboard: clipboardAvailable,
            launchAtLogin: launchAtLogin, loginNeedsApproval: false,
            loginStatus: launchAtLogin ? L("Mail Markdown opens at login.") : L("Launch at login is off."),
            version: Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "Development"
        ))
    }

    private func configureMenu() {
        let menu = NSMenu()
        let appItem = NSMenuItem()
        let appMenu = NSMenu()
        appMenu.addItem(NSMenuItem(title: L("Quit UI Preview"), action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q"))
        appItem.submenu = appMenu
        menu.addItem(appItem)
        let editItem = NSMenuItem()
        let editMenu = NSMenu(title: L("Edit"))
        for (title, action, key) in [
            (L("Undo"), Selector(("undo:")), "z"),
            (L("Cut"), #selector(NSText.cut(_:)), "x"),
            (L("Copy"), #selector(NSText.copy(_:)), "c"),
            (L("Paste"), #selector(NSText.paste(_:)), "v"),
            (L("Select All"), #selector(NSText.selectAll(_:)), "a")
        ] { editMenu.addItem(NSMenuItem(title: title, action: action, keyEquivalent: key)) }
        editItem.submenu = editMenu
        menu.addItem(editItem)
        let appearanceItem = NSMenuItem()
        let appearanceMenu = NSMenu(title: L("Preview"))
        for (title, action) in [
            (L("Light appearance"), #selector(showLight)),
            (L("Dark appearance"), #selector(showDark)),
            (L("Status: Ready"), #selector(showReady)),
            (L("Status: Permission required"), #selector(showPermissionRequired)),
            (L("Clipboard: Example available"), #selector(showClipboardAvailable))
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
