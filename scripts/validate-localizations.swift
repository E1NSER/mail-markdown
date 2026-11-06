import Foundation

// Validate the shipped catalogs as a pair: missing keys or changed printf
// placeholders must fail packaging rather than leaking untranslated text.
let root = URL(fileURLWithPath: CommandLine.arguments[1], isDirectory: true)
func catalog(_ language: String) throws -> [String: String] {
    let data = try Data(contentsOf: root.appendingPathComponent("\(language).lproj/Localizable.strings"))
    guard let value = try PropertyListSerialization.propertyList(from: data, format: nil) as? [String: String] else {
        throw NSError(domain: "LocalizationCatalog", code: 1)
    }
    return value
}
let english = try catalog("en")
let german = try catalog("de")
guard Set(english.keys) == Set(german.keys), !english.isEmpty else {
    fatalError("English and German localization catalogs must contain the same nonempty key set.")
}
let placeholders = try NSRegularExpression(pattern: #"%(?:[0-9]+\$)?[-+0 #]*(?:[0-9]+|\*)?(?:\.(?:[0-9]+|\*))?[hlLzjt]*[@diuoxXfFeEgGcCsSpaA%]"#)
func formats(_ value: String) -> [String] {
    placeholders.matches(in: value, range: NSRange(value.startIndex..., in: value)).map { (value as NSString).substring(with: $0.range) }.sorted()
}
for (key, value) in english {
    guard let translated = german[key], !translated.isEmpty, formats(value) == formats(translated) else {
        fatalError("Missing translation or incompatible format placeholders for: \(key)")
    }
}
print("Validated \(english.count) English/German localization keys.")
