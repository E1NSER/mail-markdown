import AppKit
import XCTest
@testable import MailMarkdownCore

final class MarkdownRendererTests: XCTestCase {
    @MainActor
    private func draftStyle() -> DraftStyle {
        let paragraph = NSMutableParagraphStyle()
        paragraph.lineSpacing = 3
        paragraph.paragraphSpacing = 7
        paragraph.alignment = .right
        return DraftStyle(
            font: NSFont(name: "Georgia", size: 17)!,
            foregroundColor: NSColor(srgbRed: 0.2, green: 0.3, blue: 0.4, alpha: 1),
            paragraphStyle: paragraph
        )
    }

    @MainActor
    func testPreservesDraftFontColorAndParagraphStyle() async {
        let style = draftStyle()
        let result = MarkdownRenderer().render("Normal **fett** und *kursiv*.", style: style)
        XCTAssertEqual(result.string, "Normal fett und kursiv.")
        result.enumerateAttributes(in: NSRange(location: 0, length: result.length)) { attrs, _, _ in
            let font = attrs[.font] as! NSFont
            XCTAssertEqual(font.familyName, style.font.familyName)
            XCTAssertEqual(font.pointSize, 17)
            XCTAssertEqual(attrs[.foregroundColor] as? NSColor, style.foregroundColor)
            let paragraph = attrs[.paragraphStyle] as! NSParagraphStyle
            XCTAssertEqual(paragraph.lineSpacing, 3)
            XCTAssertEqual(paragraph.paragraphSpacing, 7)
            XCTAssertEqual(paragraph.alignment, .right)
        }
    }

    @MainActor
    func testNestedEmphasisKeepsBothTraits() async {
        let result = MarkdownRenderer().render("**fett und *beides***", style: draftStyle())
        let offset = (result.string as NSString).range(of: "beides").location
        let font = result.attribute(.font, at: offset, effectiveRange: nil) as! NSFont
        let traits = NSFontManager.shared.traits(of: font)
        XCTAssertTrue(traits.contains(.boldFontMask))
        XCTAssertTrue(traits.contains(.italicFontMask))
    }

    @MainActor
    func testHeadingsUseDraftFontSize() async {
        let result = MarkdownRenderer().render("# Überschrift\n\nText", style: draftStyle())
        XCTAssertEqual(result.string, "Überschrift\n\nText")
        let headingFont = result.attribute(.font, at: 0, effectiveRange: nil) as! NSFont
        XCTAssertEqual(headingFont.pointSize, 17)
        XCTAssertEqual(headingFont.familyName, "Georgia")
        XCTAssertTrue(NSFontManager.shared.traits(of: headingFont).contains(.boldFontMask))
    }

    @MainActor
    func testListsKeepOrderNestingAndTaskState() async {
        let renderer = MarkdownRenderer()
        let result = renderer.render("3. Drei\n4. Vier\n   - Unterpunkt\n\n- [x] Fertig\n- [ ] Offen", style: draftStyle())
        XCTAssertEqual(result.string, "3.\tDrei\n4.\tVier\n•\tUnterpunkt\n\n☑\tFertig\n☐\tOffen")
        let nestedOffset = (result.string as NSString).range(of: "Unterpunkt").location
        let nestedParagraph = result.attribute(.paragraphStyle, at: nestedOffset, effectiveRange: nil) as! NSParagraphStyle
        XCTAssertGreaterThan(nestedParagraph.headIndent, 17 * 1.8)
    }

    @MainActor
    func testSoftBreaksBlankParagraphsAndTrailingNewline() async {
        let result = MarkdownRenderer().render("Zeile eins\nZeile **zwei**\n\nAbsatz\n", style: draftStyle())
        XCTAssertEqual(result.string, "Zeile eins\nZeile zwei\n\nAbsatz\n")
    }

    @MainActor
    func testTablesKeepCellAndRowBoundariesAsTabbedText() async {
        let source = "| Name | Wert |\n| --- | --- |\n| **A** | 12 |\n| B | 34 |"
        let renderer = MarkdownRenderer()
        XCTAssertTrue(renderer.containsMarkdown(source))
        let result = renderer.render(source, style: draftStyle())
        XCTAssertEqual(result.string, "Name\tWert\nA\t12\nB\t34")
    }

    @MainActor
    func testAllowsWebAndMailLinksButRemovesUnsafeTargets() async {
        let result = MarkdownRenderer().render("[Web](https://example.org) [Mail](mailto:a@example.org) [Datei](file:///etc/passwd) [Skript](javascript:alert)", style: draftStyle())
        XCTAssertEqual(result.string, "Web Mail Datei Skript")
        XCTAssertEqual((result.attribute(.link, at: 0, effectiveRange: nil) as? URL)?.scheme, "https")
        XCTAssertEqual((result.attribute(.link, at: 4, effectiveRange: nil) as? URL)?.scheme, "mailto")
        XCTAssertNil(result.attribute(.link, at: 9, effectiveRange: nil))
        XCTAssertNil(result.attribute(.link, at: 15, effectiveRange: nil))
    }

    @MainActor
    func testHTMLIsLiteralAndImagesBecomeAltText() async {
        let result = MarkdownRenderer().render("**Text** <img src=\"https://example.org/pixel\">\n\n![Beschreibung](https://example.org/image.png)", style: draftStyle())
        XCTAssertEqual(result.string, "Text <img src=\"https://example.org/pixel\">\n\nBeschreibung")
        result.enumerateAttribute(.attachment, in: NSRange(location: 0, length: result.length)) { value, _, _ in
            XCTAssertNil(value)
        }
        result.enumerateAttribute(.link, in: NSRange(location: 0, length: result.length)) { value, _, _ in
            XCTAssertNil(value)
        }
    }

    @MainActor
    func testDetectionAvoidsOrdinaryTextAndBareURLs() async {
        let renderer = MarkdownRenderer()
        for plain in ["Hallo Welt", "rechnung_2026_final.pdf", "2 * 3 = 6", "a@example.org", "https://example.org", "<https://example.org>", "<b>Hallo</b>", "#hashtag"] {
            XCTAssertFalse(renderer.containsMarkdown(plain), plain)
        }
        for markdown in ["**fett**", "*kursiv*", "# Titel", "- Punkt", "> Zitat", "`code`", "[Link](https://example.org)", "~~alt~~"] {
            XCTAssertTrue(renderer.containsMarkdown(markdown), markdown)
        }
    }

    @MainActor
    func testRTFRoundTripKeepsDraftFontAndMarkdownTraits() async throws {
        let rendered = MarkdownRenderer().render("Normal **fett** [Link](https://example.org)", style: draftStyle())
        let data = try rendered.data(from: NSRange(location: 0, length: rendered.length), documentAttributes: [.documentType: NSAttributedString.DocumentType.rtf])
        let imported = try NSAttributedString(data: data, options: [.documentType: NSAttributedString.DocumentType.rtf], documentAttributes: nil)
        XCTAssertEqual(imported.string, "Normal fett Link")
        let font = imported.attribute(.font, at: 7, effectiveRange: nil) as! NSFont
        XCTAssertEqual(font.familyName, "Georgia")
        XCTAssertEqual(font.pointSize, 17)
        XCTAssertTrue(NSFontManager.shared.traits(of: font).contains(.boldFontMask))
        XCTAssertEqual((imported.attribute(.link, at: 12, effectiveRange: nil) as? URL)?.absoluteString, "https://example.org")
        let color = (imported.attribute(.foregroundColor, at: 0, effectiveRange: nil) as! NSColor).usingColorSpace(.sRGB)!
        XCTAssertEqual(color.redComponent, 0.2, accuracy: 1 / 255)
        XCTAssertEqual(color.greenComponent, 0.3, accuracy: 1 / 255)
        XCTAssertEqual(color.blueComponent, 0.4, accuracy: 1 / 255)
    }

    @MainActor
    func testRTFRoundTripKeepsRawHTMLLiteralAndContainsNoAttachments() async throws {
        let rendered = MarkdownRenderer().render("Normal **fett** [Link](https://example.org)\n\n![Bild](https://example.org/pixel) <img src=\"https://example.org/pixel\">", style: draftStyle())
        let data = try rendered.data(from: NSRange(location: 0, length: rendered.length), documentAttributes: [.documentType: NSAttributedString.DocumentType.rtf])
        let imported = try NSAttributedString(data: data, options: [.documentType: NSAttributedString.DocumentType.rtf], documentAttributes: nil)
        XCTAssertEqual(imported.string, rendered.string)
        XCTAssertTrue(imported.string.contains("Bild <img src="))
        imported.enumerateAttribute(.attachment, in: NSRange(location: 0, length: imported.length)) { value, _, _ in
            XCTAssertNil(value)
        }
    }
}
