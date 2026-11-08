import AppKit
import Markdown

/// The attributes read from the insertion point in the existing Mail draft.
@MainActor
public struct DraftStyle {
    public let font: NSFont
    public let foregroundColor: NSColor
    public let paragraphStyle: NSParagraphStyle

    public init(font: NSFont, foregroundColor: NSColor, paragraphStyle: NSParagraphStyle) {
        self.font = font
        self.foregroundColor = foregroundColor
        self.paragraphStyle = paragraphStyle.copy() as! NSParagraphStyle
    }
}

/// Converts parsed Markdown directly to attributed text, without an HTML engine or network access.
@MainActor
public struct MarkdownRenderer {
    public init() {}

    public func containsMarkdown(_ text: String) -> Bool {
        let document = Document(parsing: text)
        // A bare URL or email address should keep the user's ordinary paste behavior.
        let hasExplicitLink = text.range(of: #"!?\[[^\]\n]*\]\([^\n]+\)"#, options: .regularExpression) != nil
        func containsFormatting(_ node: any Markup) -> Bool {
            switch node {
            case is Strong, is Emphasis, is Strikethrough, is Heading,
                 is UnorderedList, is OrderedList, is BlockQuote,
                 is CodeBlock, is InlineCode, is ThematicBreak, is Image, is Table:
                return true
            case is Link where hasExplicitLink:
                return true
            default:
                return node.children.contains(where: containsFormatting)
            }
        }
        return containsFormatting(document)
    }

    public func render(_ markdown: String, style: DraftStyle) -> NSAttributedString {
        let document = Document(parsing: markdown)
        let context = Context(style: style)
        let output = renderBlocks(document.children, context: context)
        // A copied trailing return should remain a return after formatting.
        if markdown.hasSuffix("\n"), !output.string.hasSuffix("\n") {
            output.append(attributed("\n", context: context))
        }
        // RTF requires a paragraph's terminating return to carry that paragraph's
        // style too. Otherwise transitions out of a nested list can be lost.
        let source = output.string as NSString
        var location = 0
        while location < source.length {
            let range = source.paragraphRange(for: NSRange(location: location, length: 0))
            if let paragraph = output.attribute(.paragraphStyle, at: location, effectiveRange: nil) {
                output.addAttribute(.paragraphStyle, value: paragraph, range: range)
            }
            location = NSMaxRange(range)
        }
        return output
    }

    /// TextKit 2 stores list markers as paragraph metadata on recent macOS versions.
    /// Supply readable markers for clients that can only paste plain text as well.
    public func plainText(from rendered: NSAttributedString) -> String {
        let source = rendered.string as NSString
        var result = ""
        var location = 0
        var numbers: [ObjectIdentifier: Int] = [:]
        while location < source.length {
            let range = source.paragraphRange(for: NSRange(location: location, length: 0))
            let paragraph = rendered.attribute(.paragraphStyle, at: location, effectiveRange: nil) as? NSParagraphStyle
            var content = source.substring(with: range)
            if let list = paragraph?.textLists.last {
                let identity = ObjectIdentifier(list)
                let number = numbers[identity] ?? list.startingItemNumber
                numbers[identity] = number + 1
                result += String(repeating: "\t", count: max(0, (paragraph?.textLists.count ?? 1) - 1))
                let marker = list.marker(forItemNumber: number)
                let legacyPrefix = "\t" + marker + "\t"
                if includesListMarkers, content.hasPrefix(legacyPrefix) {
                    content.removeFirst(legacyPrefix.count)
                }
                result += marker + "\t"
            }
            result += content
            location = NSMaxRange(range)
        }
        return result.replacingOccurrences(of: "\u{2028}", with: "\n")
    }

    private var includesListMarkers: Bool {
        if #available(macOS 26.0, *) { return NSTextList.includesTextListMarkers }
        return true
    }

    private struct Context {
        var style: DraftStyle
        var bold = false
        var italic = false
        var strike = false
        var code = false
        var listDepth = 0
        var textLists: [NSTextList] = []
        var quoteDepth = 0
    }

    private func attributes(_ context: Context) -> [NSAttributedString.Key: Any] {
        var font = context.code
            ? NSFont.monospacedSystemFont(ofSize: context.style.font.pointSize, weight: .regular)
            : context.style.font
        if context.bold { font = NSFontManager.shared.convert(font, toHaveTrait: .boldFontMask) }
        if context.italic { font = NSFontManager.shared.convert(font, toHaveTrait: .italicFontMask) }
        let paragraph = context.style.paragraphStyle.mutableCopy() as! NSMutableParagraphStyle
        paragraph.textLists += context.textLists
        if context.listDepth > 0 || context.quoteDepth > 0 {
            let level = context.style.font.pointSize * 1.8
            paragraph.headIndent += level * CGFloat(context.listDepth + context.quoteDepth)
            paragraph.firstLineHeadIndent = paragraph.headIndent
            if context.listDepth > 0 {
                paragraph.firstLineHeadIndent -= level
                paragraph.tabStops = [NSTextTab(textAlignment: .left, location: paragraph.headIndent)]
            }
        }
        var result: [NSAttributedString.Key: Any] = [
            .font: font,
            .foregroundColor: context.style.foregroundColor,
            .paragraphStyle: paragraph
        ]
        if context.strike { result[.strikethroughStyle] = NSUnderlineStyle.single.rawValue }
        if context.code { result[.ligature] = 0 }
        return result
    }

    private func attributed(_ text: String, context: Context) -> NSAttributedString {
        NSAttributedString(string: text, attributes: attributes(context))
    }

    private func renderBlocks(_ nodes: some Sequence<any Markup>, context: Context, separator: String = "\n\n") -> NSMutableAttributedString {
        let output = NSMutableAttributedString()
        for node in nodes {
            let block = renderNode(node, context: context)
            if output.length > 0 { output.append(attributed(separator, context: context)) }
            output.append(block)
        }
        return output
    }

    private func renderInlines(_ node: any Markup, context: Context) -> NSMutableAttributedString {
        let output = NSMutableAttributedString()
        for child in node.children { output.append(renderNode(child, context: context)) }
        return output
    }

    private func renderNode(_ node: any Markup, context: Context) -> NSAttributedString {
        switch node {
        case let text as Markdown.Text:
            return attributed(text.string, context: context)
        case is SoftBreak, is LineBreak:
            return attributed(context.listDepth > 0 ? "\u{2028}" : "\n", context: context)
        case is Strong:
            var child = context
            child.bold = true
            return renderInlines(node, context: child)
        case is Emphasis:
            var child = context
            child.italic = true
            return renderInlines(node, context: child)
        case is Strikethrough:
            var child = context
            child.strike = true
            return renderInlines(node, context: child)
        case is Heading:
            var child = context
            child.bold = true
            // The draft's typography controls headings too; do not introduce a foreign font size.
            return renderInlines(node, context: child)
        case is Paragraph:
            return renderInlines(node, context: context)
        case let code as InlineCode:
            var child = context
            child.code = true
            return attributed(code.code, context: child)
        case let code as CodeBlock:
            var child = context
            child.code = true
            let content = code.code.hasSuffix("\n") ? String(code.code.dropLast()) : code.code
            return attributed(context.listDepth > 0 ? content.replacingOccurrences(of: "\n", with: "\u{2028}") : content, context: child)
        case let link as Link:
            let output = renderInlines(node, context: context)
            if let destination = link.destination,
               let url = URL(string: destination),
               let scheme = url.scheme?.lowercased(),
               ["https", "http", "mailto"].contains(scheme), output.length > 0 {
                output.addAttribute(.link, value: url, range: NSRange(location: 0, length: output.length))
            }
            return output
        case let image as Image:
            // The alt text is useful; remote images and tracking pixels are never fetched.
            return attributed(image.plainText, context: context)
        case let html as InlineHTML:
            // Literal text remains literal; raw HTML never becomes executable or loaded content.
            return attributed(html.rawHTML, context: context)
        case let html as HTMLBlock:
            return attributed(html.rawHTML.trimmingCharacters(in: .newlines), context: context)
        case let list as OrderedList:
            return renderList(list.children, context: context, start: list.startIndex)
        case let list as UnorderedList:
            return renderList(list.children, context: context, start: nil)
        case is BlockQuote:
            // A list item has one paragraph style. Soft breaks keep the quote
            // in the current item, with the indent selected by renderList.
            if context.listDepth > 0 {
                return renderItemBlocks(node.children, context: context)
            }
            var child = context
            child.quoteDepth += 1
            return renderBlocks(node.children, context: child)
        case let table as Table:
            // Keep table content legible in the draft's typography. Native table
            // layout differs between email clients, so this prototype uses tabs.
            var heading = context
            heading.bold = true
            let output = renderBlocks(table.head.children, context: heading, separator: "\t")
            for row in table.body.rows {
                output.append(attributed("\n", context: context))
                output.append(renderBlocks(row.children, context: context, separator: "\t"))
            }
            return output
        case is ThematicBreak:
            return attributed("────────", context: context)
        default:
            return renderInlines(node, context: context)
        }
    }

    private func renderList(_ nodes: some Sequence<any Markup>, context: Context, start: UInt?) -> NSAttributedString {
        let output = NSMutableAttributedString()
        var child = context
        child.listDepth += 1
        // Siblings share the same list identity. Nested items carry the complete
        // outer-to-inner stack, which AppKit preserves in the RTF list tables.
        let list = NSTextList(
            markerFormat: start == nil ? .disc : NSTextList.MarkerFormat(rawValue: "{decimal}."),
            options: [], startingItemNumber: start.map { Int($0) } ?? 1
        )
        child.textLists.append(list)
        for (offset, node) in nodes.enumerated() {
            if output.length > 0 { output.append(attributed("\n", context: child)) }
            var itemContext = child
            var leadingBlock = node.child(at: 0)
            while let quote = leadingBlock as? BlockQuote {
                itemContext.quoteDepth += 1
                leadingBlock = quote.child(at: 0)
            }
            if includesListMarkers {
                output.append(attributed("\t" + list.marker(forItemNumber: list.startingItemNumber + offset) + "\t", context: itemContext))
            }
            if let item = node as? ListItem, let checkbox = item.checkbox {
                output.append(attributed(checkbox == .checked ? "☑ " : "☐ ", context: itemContext))
            }
            output.append(renderItemBlocks(node.children, context: itemContext))
        }
        return output
    }

    private func renderItemBlocks(_ nodes: some Sequence<any Markup>, context: Context) -> NSAttributedString {
        let output = NSMutableAttributedString()
        var followsList = false
        for block in nodes {
            let isList = block is OrderedList || block is UnorderedList
            if output.length > 0 {
                let separator = isList || followsList ? "\n" : "\u{2028}\u{2028}"
                output.append(attributed(separator, context: context))
            }
            output.append(renderNode(block, context: context))
            followsList = isList
        }
        return output
    }
}
