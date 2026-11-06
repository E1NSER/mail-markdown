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

    /// One indentation level: 1.8 em of the 17 pt test font.
    private let level: CGFloat = 17 * 1.8

    /// Returns the indents of the paragraph containing `needle` and checks that the
    /// whole paragraph shares one paragraph style, as AppKit and RTF lay it out.
    @MainActor
    private func indents(ofParagraphContaining needle: String, in result: NSAttributedString, file: StaticString = #filePath, line: UInt = #line) -> (first: CGFloat, head: CGFloat) {
        let string = result.string as NSString
        let match = string.range(of: needle)
        guard match.location != NSNotFound else {
            XCTFail("Missing \(needle)", file: file, line: line)
            return (-1, -1)
        }
        let paragraph = string.paragraphRange(for: match)
        let style = result.attribute(.paragraphStyle, at: paragraph.location, effectiveRange: nil) as! NSParagraphStyle
        result.enumerateAttribute(.paragraphStyle, in: paragraph) { value, _, _ in
            let run = value as! NSParagraphStyle
            XCTAssertEqual(run.firstLineHeadIndent, style.firstLineHeadIndent, "Mixed first-line indent in \(needle)", file: file, line: line)
            XCTAssertEqual(run.headIndent, style.headIndent, "Mixed head indent in \(needle)", file: file, line: line)
        }
        return (style.firstLineHeadIndent, style.headIndent)
    }

    @MainActor
    func testOneLineQuoteIndentsItsFirstLine() async {
        let result = MarkdownRenderer().render("> Danke für das Feedback!", style: draftStyle())
        XCTAssertEqual(result.string, "Danke für das Feedback!")
        let quote = indents(ofParagraphContaining: "Danke", in: result)
        XCTAssertEqual(quote.first, level, accuracy: 0.01)
        XCTAssertEqual(quote.head, level, accuracy: 0.01)
    }

    @MainActor
    func testEveryQuoteLineIsIndentedPerNestingLevel() async {
        let result = MarkdownRenderer().render("Davor\n\n> Zeile eins\n> Zeile zwei\n>\n> > Tiefer\n\nDanach", style: draftStyle())
        XCTAssertEqual(result.string, "Davor\n\nZeile eins\nZeile zwei\n\nTiefer\n\nDanach")
        for line in ["Zeile eins", "Zeile zwei"] {
            let quote = indents(ofParagraphContaining: line, in: result)
            XCTAssertEqual(quote.first, level, accuracy: 0.01, line)
            XCTAssertEqual(quote.head, level, accuracy: 0.01, line)
        }
        let nested = indents(ofParagraphContaining: "Tiefer", in: result)
        XCTAssertEqual(nested.first, 2 * level, accuracy: 0.01)
        XCTAssertEqual(nested.head, 2 * level, accuracy: 0.01)
        for text in ["Davor", "Danach"] {
            let plain = indents(ofParagraphContaining: text, in: result)
            XCTAssertEqual(plain.first, 0, text)
            XCTAssertEqual(plain.head, 0, text)
        }
    }

    @MainActor
    func testQuoteInsideListIsIndentedPastTheItemText() async {
        let result = MarkdownRenderer().render("- Punkt\n  > Zitat\n- Nächster", style: draftStyle())
        XCTAssertEqual(result.string, "•\tPunkt\nZitat\n•\tNächster")
        let item = indents(ofParagraphContaining: "Punkt", in: result)
        XCTAssertEqual(item.first, 0)
        XCTAssertEqual(item.head, level, accuracy: 0.01)
        let quote = indents(ofParagraphContaining: "Zitat", in: result)
        XCTAssertEqual(quote.first, 2 * level, accuracy: 0.01)
        XCTAssertEqual(quote.head, 2 * level, accuracy: 0.01)
    }

    @MainActor
    func testListInsideQuoteHangsItsMarkerAtTheQuoteIndent() async {
        let result = MarkdownRenderer().render("> - Punkt", style: draftStyle())
        XCTAssertEqual(result.string, "•\tPunkt")
        let item = indents(ofParagraphContaining: "Punkt", in: result)
        XCTAssertEqual(item.first, level, accuracy: 0.01)
        XCTAssertEqual(item.head, 2 * level, accuracy: 0.01)
    }

    @MainActor
    func testListContinuationLinesAlignWithTheItemText() async {
        let result = MarkdownRenderer().render("- Zeile eins\n  Zeile zwei\n\n1. Schritt\n\n   Erklärung", style: draftStyle())
        XCTAssertEqual(result.string, "•\tZeile eins\nZeile zwei\n\n1.\tSchritt\nErklärung")
        for marker in ["Zeile eins", "Schritt"] {
            let item = indents(ofParagraphContaining: marker, in: result)
            XCTAssertEqual(item.first, 0, marker)
            XCTAssertEqual(item.head, level, accuracy: 0.01, marker)
        }
        for continuation in ["Zeile zwei", "Erklärung"] {
            let line = indents(ofParagraphContaining: continuation, in: result)
            XCTAssertEqual(line.first, level, accuracy: 0.01, continuation)
            XCTAssertEqual(line.head, level, accuracy: 0.01, continuation)
        }
    }

    @MainActor
    func testRTFRoundTripKeepsQuoteAndListIndents() async throws {
        let rendered = MarkdownRenderer().render("> Zitat\n\n- Punkt\n  Weiter\n\nText", style: draftStyle())
        let data = try rendered.data(from: NSRange(location: 0, length: rendered.length), documentAttributes: [.documentType: NSAttributedString.DocumentType.rtf])
        let imported = try NSAttributedString(data: data, options: [.documentType: NSAttributedString.DocumentType.rtf], documentAttributes: nil)
        XCTAssertEqual(imported.string, "Zitat\n\n•\tPunkt\nWeiter\n\nText")
        let quote = indents(ofParagraphContaining: "Zitat", in: imported)
        XCTAssertEqual(quote.first, level, accuracy: 0.5)
        XCTAssertEqual(quote.head, level, accuracy: 0.5)
        let item = indents(ofParagraphContaining: "Punkt", in: imported)
        XCTAssertEqual(item.first, 0, accuracy: 0.5)
        XCTAssertEqual(item.head, level, accuracy: 0.5)
        let continuation = indents(ofParagraphContaining: "Weiter", in: imported)
        XCTAssertEqual(continuation.first, level, accuracy: 0.5)
        XCTAssertEqual(continuation.head, level, accuracy: 0.5)
        let text = indents(ofParagraphContaining: "Text", in: imported)
        XCTAssertEqual(text.first, 0, accuracy: 0.5)
        XCTAssertEqual(text.head, 0, accuracy: 0.5)
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
