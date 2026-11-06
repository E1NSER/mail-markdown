import Foundation

/// English is the initial language regardless of the macOS language. A person's
/// explicit app choice is the only setting that overrides it.
enum AppLanguage: String, CaseIterable {
    case english = "en"
    case german = "de"

    var displayName: String { self == .english ? "English" : "Deutsch" }
    @MainActor private(set) static var current: AppLanguage = .english
    private static let preferenceKey = "interfaceLanguage"

    @MainActor static func loadSavedPreference() {
        current = UserDefaults.standard.string(forKey: preferenceKey).flatMap(AppLanguage.init(rawValue:)) ?? .english
    }

    @MainActor static func select(_ language: AppLanguage, persist: Bool) {
        current = language
        if persist { UserDefaults.standard.set(language.rawValue, forKey: preferenceKey) }
    }

    @MainActor fileprivate static var bundle: Bundle {
        guard let path = Bundle.main.path(forResource: current.rawValue, ofType: "lproj"),
              let localized = Bundle(path: path) else { return Bundle.main }
        return localized
    }
}

/// Keys are English source strings, so a missing development resource still
/// produces readable English rather than a technical identifier.
@MainActor
func L(_ key: String, _ arguments: CVarArg...) -> String {
    let value = AppLanguage.bundle.localizedString(forKey: key, value: key, table: nil)
    return arguments.isEmpty ? value : String(format: value, locale: Locale(identifier: AppLanguage.current.rawValue), arguments: arguments)
}
