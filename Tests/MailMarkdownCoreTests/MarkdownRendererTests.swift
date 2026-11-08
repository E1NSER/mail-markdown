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
        XCTAssertEqual(renderer.plainText(from: result), "3.\tDrei\n4.\tVier\n\t•\tUnterpunkt\n\n•\t☑ Fertig\n•\t☐ Offen")
        let nestedOffset = (result.string as NSString).range(of: "Unterpunkt").location
        let nestedParagraph = result.attribute(.paragraphStyle, at: nestedOffset, effectiveRange: nil) as! NSParagraphStyle
        XCTAssertGreaterThan(nestedParagraph.headIndent, 17 * 1.8)
        XCTAssertEqual(nestedParagraph.textLists.count, 2)
        XCTAssertTrue(nestedParagraph.textLists[0].isOrdered)
        XCTAssertFalse(nestedParagraph.textLists[1].isOrdered)
    }

    @MainActor
    private func rtfRoundTrip(_ text: NSAttributedString) throws -> NSAttributedString {
        let data = try text.data(from: NSRange(location: 0, length: text.length), documentAttributes: [.documentType: NSAttributedString.DocumentType.rtf])
        return try NSAttributedString(data: data, options: [.documentType: NSAttributedString.DocumentType.rtf], documentAttributes: nil)
    }

    @MainActor
    private func paragraph(in text: NSAttributedString, containing word: String) -> NSParagraphStyle {
        let offset = (text.string as NSString).range(of: word).location
        return text.attribute(.paragraphStyle, at: offset, effectiveRange: nil) as! NSParagraphStyle
    }

    @MainActor
    func testRTFRoundTripPreservesNativeListsAndStartNumber() async throws {
        let rendered = MarkdownRenderer().render("3. **Drei**\n4. Vier\n   - Unterpunkt\n5. Fünf\n\nNormal\n\n- Eins\n- Zwei", style: draftStyle())
        let result = try rtfRoundTrip(rendered)
        let outer = paragraph(in: result, containing: "Drei").textLists
        let second = paragraph(in: result, containing: "Vier").textLists
        let nested = paragraph(in: result, containing: "Unterpunkt").textLists
        let last = paragraph(in: result, containing: "Fünf").textLists
        XCTAssertEqual(outer.count, 1)
        XCTAssertTrue(outer[0].isOrdered)
        XCTAssertEqual(outer[0].startingItemNumber, 3)
        XCTAssertTrue(outer[0] === second[0])
        XCTAssertTrue(outer[0] === last[0])
        XCTAssertEqual(nested.count, 2)
        XCTAssertTrue(nested[0] === outer[0])
        XCTAssertFalse(nested[1].isOrdered)
        XCTAssertEqual(MarkdownRenderer().plainText(from: result), "3.\tDrei\n4.\tVier\n\t•\tUnterpunkt\n5.\tFünf\n\nNormal\n\n•\tEins\n•\tZwei")
        XCTAssertTrue(paragraph(in: result, containing: "Normal").textLists.isEmpty)
        let bullets = paragraph(in: result, containing: "Eins").textLists
        XCTAssertEqual(bullets.count, 1)
        XCTAssertFalse(bullets[0].isOrdered)
        XCTAssertTrue(bullets[0] === paragraph(in: result, containing: "Zwei").textLists[0])
        let boldOffset = (result.string as NSString).range(of: "Drei").location
        let font = result.attribute(.font, at: boldOffset, effectiveRange: nil) as! NSFont
        XCTAssertEqual(font.familyName, "Georgia")
        XCTAssertEqual(font.pointSize, 17)
        XCTAssertTrue(NSFontManager.shared.traits(of: font).contains(.boldFontMask))
        let color = (result.attribute(.foregroundColor, at: boldOffset, effectiveRange: nil) as! NSColor).usingColorSpace(.sRGB)!
        XCTAssertEqual(color.redComponent, 0.2, accuracy: 1 / 255)
        XCTAssertEqual(color.greenComponent, 0.3, accuracy: 1 / 255)
        XCTAssertEqual(color.blueComponent, 0.4, accuracy: 1 / 255)
    }

    @MainActor
    func testListContinuationLinesDoNotCreateExtraNumberedItems() async throws {
        let rendered = MarkdownRenderer().render("3. Drei\n   Fortsetzung\n\n   Weiterer Absatz\n\n4. Vier", style: draftStyle())
        let imported = try rtfRoundTrip(rendered)
        let list = paragraph(in: imported, containing: "Drei").textLists[0]
        for word in ["Drei", "Fortsetzung", "Weiterer Absatz"] {
            let offset = (imported.string as NSString).range(of: word).location
            XCTAssertEqual(imported.itemNumber(in: list, at: offset), 1, word)
        }
        let secondOffset = (imported.string as NSString).range(of: "Vier").location
        XCTAssertEqual(imported.itemNumber(in: list, at: secondOffset), 2)
        XCTAssertEqual(list.startingItemNumber, 3)
    }

    @MainActor
    func testNativeListsExportAsSemanticHTMLWithoutDuplicatedMarkers() async throws {
        let rendered = MarkdownRenderer().render("- **Eins**\n- Zwei\n\n1. Drei\n2. Vier", style: draftStyle())
        let htmlData = try rendered.data(from: NSRange(location: 0, length: rendered.length), documentAttributes: [.documentType: NSAttributedString.DocumentType.html])
        let html = String(decoding: htmlData, as: UTF8.self)
        XCTAssertTrue(html.contains("<ul"))
        XCTAssertTrue(html.contains("<ol"))
        XCTAssertEqual(html.components(separatedBy: "<li ").count - 1, 4)
        XCTAssertFalse(html.contains("•"))
        XCTAssertFalse(html.contains(">1."))
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
    func testListInsideQuoteHangsItsMarkerAtTheQuoteIndent() async {
        let result = MarkdownRenderer().render("> - Punkt", style: draftStyle())
        XCTAssertEqual(MarkdownRenderer().plainText(from: result), "•\tPunkt")
        let item = indents(ofParagraphContaining: "Punkt", in: result)
        XCTAssertEqual(item.first, level, accuracy: 0.01)
        XCTAssertEqual(item.head, 2 * level, accuracy: 0.01)
    }

    @MainActor
    func testQuoteFirstItemKeepsBothLinesAtTheSameIndentAndContinuesTheNativeList() async throws {
        let renderer = MarkdownRenderer()
        for (source, ordered) in [
            ("- > Erste Zitatzeile\n  > Zweite Zitatzeile\n- Nächster Punkt", false),
            ("3. > Erste Zitatzeile\n   > Zweite Zitatzeile\n4. Nächster Punkt", true),
        ] {
            let imported = try rtfRoundTrip(renderer.render(source, style: draftStyle()))
            let first = paragraph(in: imported, containing: "Erste Zitatzeile")
            let second = paragraph(in: imported, containing: "Zweite Zitatzeile")
            let next = paragraph(in: imported, containing: "Nächster Punkt")
            let list = try XCTUnwrap(first.textLists.last)
            XCTAssertEqual(list.isOrdered, ordered)
            XCTAssertEqual(first.tabStops.first?.location ?? -1, 2 * level, accuracy: 0.5)
            XCTAssertEqual(second.headIndent, first.headIndent, accuracy: 0.5)
            XCTAssertEqual(next.headIndent, level, accuracy: 0.5)
            XCTAssertTrue(second.textLists.last === list)
            XCTAssertTrue(next.textLists.last === list)
            let string = imported.string as NSString
            XCTAssertEqual(imported.itemNumber(in: list, at: string.range(of: "Zweite Zitatzeile").location), 1)
            XCTAssertEqual(imported.itemNumber(in: list, at: string.range(of: "Nächster Punkt").location), 2)
        }
    }

    @MainActor
    func testQuoteAfterListTextStaysInOneItemAcrossQuoteParagraphs() async throws {
        let source = "1. Einleitung\n   > Erste Zeile\n   > Zweite Zeile\n   >\n   > Weiterer Absatz\n2. Nächster Punkt\n\nNormal"
        let imported = try rtfRoundTrip(MarkdownRenderer().render(source, style: draftStyle()))
        let body = paragraph(in: imported, containing: "Einleitung")
        let list = try XCTUnwrap(body.textLists.last)
        let string = imported.string as NSString
        for text in ["Erste Zeile", "Zweite Zeile", "Weiterer Absatz"] {
            let quote = paragraph(in: imported, containing: text)
            XCTAssertEqual(quote.headIndent, body.headIndent, accuracy: 0.5)
            XCTAssertEqual(imported.itemNumber(in: list, at: string.range(of: text).location), 1)
        }
        XCTAssertEqual(imported.itemNumber(in: list, at: string.range(of: "Nächster Punkt").location), 2)
        XCTAssertTrue(paragraph(in: imported, containing: "Normal").textLists.isEmpty)
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
