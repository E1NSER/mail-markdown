import ServiceManagement

/// Reads the system's current login-item state. Registration happens only when
/// the person changes the setting; creating this controller has no side effects.
@MainActor
final class LoginItemController {
    private let service = SMAppService.mainApp

    var status: SMAppService.Status { service.status }

    /// Whether macOS currently permits the app to launch at login.
    var isEnabled: Bool { status == .enabled }

    /// A registered item may still be blocked by the person's system setting.
    var requiresApproval: Bool { status == .requiresApproval }

    /// Use for a toggle that should remain selected while approval is pending.
    var isRegistered: Bool {
        let current = status
        return current == .enabled || current == .requiresApproval
    }

    var statusDescription: String {
        switch status {
        case .enabled:
            return "Mail Markdown startet bei der Anmeldung."
        case .requiresApproval:
            return "Erlaube den automatischen Start noch in den Systemeinstellungen."
        case .notRegistered:
            return "Der automatische Start ist ausgeschaltet."
        case .notFound:
            return "Lege die App für den Autostart im Ordner Programme ab."
        @unknown default:
            return "Der Status des automatischen Starts ist unbekannt."
        }
    }

    func setEnabled(_ enabled: Bool) throws {
        if enabled {
            // Re-registering an already registered item throws. A pending item
            // needs a separate, explicit visit to Login Items in System Settings.
            guard !isRegistered else { return }
            try service.register()
        } else {
            let current = status
            guard current != .notRegistered && current != .notFound else { return }
            try service.unregister()
        }
    }

    func openLoginItemsSettings() {
        SMAppService.openSystemSettingsLoginItems()
    }
}
