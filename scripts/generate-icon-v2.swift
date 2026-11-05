#!/usr/bin/env swift
import AppKit
import Foundation

// Original companion artwork for Mail Markdown. Geometry is shared with the
// editable SVG below; no system artwork is copied into the resulting assets.
let projectURL = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent()
let resourcesURL = projectURL.appendingPathComponent("Resources", isDirectory: true)
let temporaryURL = FileManager.default.temporaryDirectory.appendingPathComponent("mail-markdown-icon-v2-\(UUID().uuidString)", isDirectory: true)
let iconsetURL = temporaryURL.appendingPathComponent("AppIcon-v2.iconset", isDirectory: true)
try FileManager.default.createDirectory(at: resourcesURL, withIntermediateDirectories: true)
try FileManager.default.createDirectory(at: iconsetURL, withIntermediateDirectories: true)
defer { try? FileManager.default.removeItem(at: temporaryURL) }

func color(_ hex: UInt32, _ alpha: CGFloat = 1) -> NSColor {
    NSColor(srgbRed: CGFloat((hex >> 16) & 255) / 255,
            green: CGFloat((hex >> 8) & 255) / 255,
            blue: CGFloat(hex & 255) / 255, alpha: alpha)
}

func path(_ points: [NSPoint], closed: Bool = false) -> NSBezierPath {
    let p = NSBezierPath()
    p.move(to: points[0])
    for point in points.dropFirst() { p.line(to: point) }
    if closed { p.close() }
    return p
}

func gradient(_ shape: NSBezierPath, top: UInt32, bottom: UInt32) {
    NSGradient(starting: color(top), ending: color(bottom))!.draw(in: shape, angle: -90)
}

func stroke(_ shape: NSBezierPath, _ hex: UInt32, width: CGFloat, alpha: CGFloat = 1) {
    shape.lineWidth = width
    shape.lineJoinStyle = .round
    shape.lineCapStyle = .round
    color(hex, alpha).setStroke()
    shape.stroke()
}

func renderIcon(pixels: Int) throws -> Data {
    let bitmap = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: pixels, pixelsHigh: pixels,
        bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
        colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
    NSGraphicsContext.saveGraphicsState()
    let context = NSGraphicsContext(bitmapImageRep: bitmap)!
    NSGraphicsContext.current = context
    context.cgContext.scaleBy(x: CGFloat(pixels) / 1024, y: CGFloat(pixels) / 1024)
    context.cgContext.setAllowsAntialiasing(true)
    context.cgContext.setShouldAntialias(true)

    let tile = NSBezierPath(roundedRect: NSRect(x: 88, y: 88, width: 848, height: 848), xRadius: 188, yRadius: 188)
    NSGraphicsContext.saveGraphicsState()
    let tileShadow = NSShadow()
    tileShadow.shadowColor = color(0x244A79, 0.18)
    tileShadow.shadowBlurRadius = 26
    tileShadow.shadowOffset = NSSize(width: 0, height: -12)
    tileShadow.set()
    color(0xE5F0FF).setFill()
    tile.fill()
    NSGraphicsContext.restoreGraphicsState()
    gradient(tile, top: 0xF4F9FF, bottom: 0xDCEBFF)
    stroke(tile, 0xAFCBEA, width: 2, alpha: 0.7)

    let envelope = NSBezierPath(roundedRect: NSRect(x: 226, y: 286, width: 572, height: 360), xRadius: 58, yRadius: 58)
    NSGraphicsContext.saveGraphicsState()
    let envelopeShadow = NSShadow()
    envelopeShadow.shadowColor = color(0x235A9B, 0.24)
    envelopeShadow.shadowBlurRadius = 28
    envelopeShadow.shadowOffset = NSSize(width: 0, height: -18)
    envelopeShadow.set()
    color(0x2282E6).setFill()
    envelope.fill()
    NSGraphicsContext.restoreGraphicsState()
    gradient(envelope, top: 0x49A7F5, bottom: 0x1B7ADA)

    let sheet = NSBezierPath(roundedRect: NSRect(x: 334, y: 460, width: 356, height: 350), xRadius: 30, yRadius: 30)
    NSGraphicsContext.saveGraphicsState()
    let paperShadow = NSShadow()
    paperShadow.shadowColor = color(0x245A91, 0.14)
    paperShadow.shadowBlurRadius = 16
    paperShadow.shadowOffset = NSSize(width: 0, height: -7)
    paperShadow.set()
    color(0xFFFFFF).setFill()
    sheet.fill()
    NSGraphicsContext.restoreGraphicsState()
    gradient(sheet, top: 0xFFFFFF, bottom: 0xF0F7FF)
    stroke(sheet, 0xB8D4F0, width: 2)

    // A compact, integrated Markdown mark leaves the envelope as the main read.
    stroke(path([NSPoint(x: 420, y: 696), NSPoint(x: 420, y: 760), NSPoint(x: 452, y: 724), NSPoint(x: 484, y: 760), NSPoint(x: 484, y: 696)]), 0x4D7BB3, width: 15)
    stroke(path([NSPoint(x: 578, y: 760), NSPoint(x: 578, y: 699)]), 0x4D7BB3, width: 15)
    stroke(path([NSPoint(x: 556, y: 721), NSPoint(x: 578, y: 699), NSPoint(x: 600, y: 721)]), 0x4D7BB3, width: 15)
    stroke(path([NSPoint(x: 404, y: 672), NSPoint(x: 620, y: 672)]), 0xC8DCF1, width: 9)

    let leftFold = path([NSPoint(x: 226, y: 610), NSPoint(x: 512, y: 414), NSPoint(x: 226, y: 344)], closed: true)
    let rightFold = path([NSPoint(x: 798, y: 610), NSPoint(x: 512, y: 414), NSPoint(x: 798, y: 344)], closed: true)
    gradient(leftFold, top: 0x79C5FF, bottom: 0x3197F0)
    gradient(rightFold, top: 0x63B6F8, bottom: 0x268AE6)

    let front = NSBezierPath()
    front.move(to: NSPoint(x: 226, y: 344))
    front.line(to: NSPoint(x: 468, y: 486))
    front.curve(to: NSPoint(x: 556, y: 486), controlPoint1: NSPoint(x: 496, y: 506), controlPoint2: NSPoint(x: 528, y: 506))
    front.line(to: NSPoint(x: 798, y: 344))
    front.curve(to: NSPoint(x: 740, y: 286), controlPoint1: NSPoint(x: 798, y: 312), controlPoint2: NSPoint(x: 772, y: 286))
    front.line(to: NSPoint(x: 284, y: 286))
    front.curve(to: NSPoint(x: 226, y: 344), controlPoint1: NSPoint(x: 252, y: 286), controlPoint2: NSPoint(x: 226, y: 312))
    front.close()
    gradient(front, top: 0x379FF3, bottom: 0x1375DB)
    let leftCrease = path([NSPoint(x: 242, y: 610), NSPoint(x: 474, y: 451)])
    let rightCrease = path([NSPoint(x: 782, y: 610), NSPoint(x: 550, y: 451)])
    stroke(leftCrease, 0xFFFFFF, width: 3, alpha: 0.38)
    stroke(rightCrease, 0xFFFFFF, width: 3, alpha: 0.28)
    NSGraphicsContext.restoreGraphicsState()

    guard let data = bitmap.representation(using: .png, properties: [:]) else {
        throw NSError(domain: "MailMarkdown.Icon", code: 1, userInfo: [NSLocalizedDescriptionKey: "Could not encode icon."])
    }
    return data
}

let svg = """
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <title>Mail Markdown — companion icon</title>
  <desc>Original blue envelope and white Markdown letter on a cool macOS tile. All elements are editable vector paths.</desc>
  <defs>
    <linearGradient id="tile" x1="0" y1="1" x2="0" y2="0"><stop stop-color="#F4F9FF"/><stop offset="1" stop-color="#DCEBFF"/></linearGradient>
    <linearGradient id="back" x1="0" y1="1" x2="0" y2="0"><stop stop-color="#49A7F5"/><stop offset="1" stop-color="#1B7ADA"/></linearGradient>
    <linearGradient id="paper" x1="0" y1="1" x2="0" y2="0"><stop stop-color="#FFFFFF"/><stop offset="1" stop-color="#F0F7FF"/></linearGradient>
    <linearGradient id="left" x1="0" y1="1" x2="0" y2="0"><stop stop-color="#79C5FF"/><stop offset="1" stop-color="#3197F0"/></linearGradient>
    <linearGradient id="right" x1="0" y1="1" x2="0" y2="0"><stop stop-color="#63B6F8"/><stop offset="1" stop-color="#268AE6"/></linearGradient>
    <linearGradient id="front" x1="0" y1="1" x2="0" y2="0"><stop stop-color="#379FF3"/><stop offset="1" stop-color="#1375DB"/></linearGradient>
    <filter id="tileShadow" x="-15%" y="-15%" width="130%" height="140%"><feDropShadow dx="0" dy="-12" stdDeviation="13" flood-color="#244A79" flood-opacity=".18"/></filter>
    <filter id="envelopeShadow" x="-20%" y="-25%" width="140%" height="160%"><feDropShadow dx="0" dy="-18" stdDeviation="14" flood-color="#235A9B" flood-opacity=".24"/></filter>
    <filter id="paperShadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="-7" stdDeviation="8" flood-color="#245A91" flood-opacity=".14"/></filter>
  </defs>
  <g transform="translate(0 1024) scale(1 -1)">
    <rect id="macOS-tile" x="88" y="88" width="848" height="848" rx="188" fill="url(#tile)" stroke="#AFCBEA" stroke-opacity=".7" stroke-width="2" filter="url(#tileShadow)"/>
    <rect id="envelope-back" x="226" y="286" width="572" height="360" rx="58" fill="url(#back)" filter="url(#envelopeShadow)"/>
    <rect id="letter" x="334" y="460" width="356" height="350" rx="30" fill="url(#paper)" stroke="#B8D4F0" stroke-width="2" filter="url(#paperShadow)"/>
    <g id="markdown-mark" fill="none" stroke="#4D7BB3" stroke-width="15" stroke-linecap="round" stroke-linejoin="round">
      <path d="M420 696V760L452 724L484 760V696"/>
      <path d="M578 760V699M556 721L578 699L600 721"/>
    </g>
    <path id="letter-line" d="M404 672H620" fill="none" stroke="#C8DCF1" stroke-width="9" stroke-linecap="round"/>
    <path id="left-fold" d="M226 610L512 414L226 344Z" fill="url(#left)"/>
    <path id="right-fold" d="M798 610L512 414L798 344Z" fill="url(#right)"/>
    <path id="envelope-front" d="M226 344L468 486C496 506 528 506 556 486L798 344C798 312 772 286 740 286H284C252 286 226 312 226 344Z" fill="url(#front)"/>
    <path id="left-crease" d="M242 610L474 451" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-opacity=".38" stroke-linecap="round"/>
    <path id="right-crease" d="M782 610L550 451" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-opacity=".28" stroke-linecap="round"/>
  </g>
</svg>
"""
try svg.write(to: resourcesURL.appendingPathComponent("AppIcon-v2.svg"), atomically: true, encoding: .utf8)
for size in [16, 32, 128, 256, 512] {
    try renderIcon(pixels: size).write(to: iconsetURL.appendingPathComponent("icon_\(size)x\(size).png"))
    try renderIcon(pixels: size * 2).write(to: iconsetURL.appendingPathComponent("icon_\(size)x\(size)@2x.png"))
}
try renderIcon(pixels: 1024).write(to: resourcesURL.appendingPathComponent("AppIcon-v2.png"))
let converter = Process()
converter.executableURL = URL(fileURLWithPath: "/usr/bin/iconutil")
converter.arguments = ["-c", "icns", iconsetURL.path, "-o", resourcesURL.appendingPathComponent("AppIcon-v2.icns").path]
try converter.run()
converter.waitUntilExit()
guard converter.terminationStatus == 0 else {
    throw NSError(domain: "MailMarkdown.Icon", code: Int(converter.terminationStatus))
}
print("Generated editable Resources/AppIcon-v2.svg, .png, .icns")
