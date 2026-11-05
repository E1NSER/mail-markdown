#!/usr/bin/env swift
import AppKit
import Foundation

// Original vector artwork; all sizes are rendered directly rather than resized.
let projectURL = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent()
let resourcesURL = projectURL.appendingPathComponent("Resources", isDirectory: true)
let temporaryURL = FileManager.default.temporaryDirectory.appendingPathComponent("mail-markdown-icon-\(UUID().uuidString)", isDirectory: true)
let iconsetURL = temporaryURL.appendingPathComponent("AppIcon.iconset", isDirectory: true)
try FileManager.default.createDirectory(at: resourcesURL, withIntermediateDirectories: true)
try FileManager.default.createDirectory(at: iconsetURL, withIntermediateDirectories: true)
defer { try? FileManager.default.removeItem(at: temporaryURL) }

func color(_ red: CGFloat, _ green: CGFloat, _ blue: CGFloat) -> NSColor {
    NSColor(srgbRed: red / 255, green: green / 255, blue: blue / 255, alpha: 1)
}

let ivory = color(249, 247, 239)
let paper = color(255, 254, 249)
let charcoal = color(43, 48, 46)
let orange = color(188, 81, 43)

func stroke(_ points: [NSPoint], color: NSColor, width: CGFloat) {
    let path = NSBezierPath()
    path.move(to: points[0])
    for point in points.dropFirst() { path.line(to: point) }
    path.lineWidth = width
    path.lineCapStyle = .round
    path.lineJoinStyle = .round
    color.setStroke()
    path.stroke()
}

func renderIcon(pixels: Int) throws -> Data {
    let bitmap = NSBitmapImageRep(
        bitmapDataPlanes: nil, pixelsWide: pixels, pixelsHigh: pixels,
        bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true,
        isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0
    )!
    NSGraphicsContext.saveGraphicsState()
    let context = NSGraphicsContext(bitmapImageRep: bitmap)!
    NSGraphicsContext.current = context
    context.cgContext.scaleBy(x: CGFloat(pixels) / 1024, y: CGFloat(pixels) / 1024)
    context.cgContext.setAllowsAntialiasing(true)
    context.cgContext.setShouldAntialias(true)

    // The inset canvas and transparent outer margin follow macOS app icon proportions.
    let tile = NSBezierPath(roundedRect: NSRect(x: 88, y: 88, width: 848, height: 848), xRadius: 188, yRadius: 188)
    NSGraphicsContext.saveGraphicsState()
    let shadow = NSShadow()
    shadow.shadowColor = NSColor.black.withAlphaComponent(0.18)
    shadow.shadowBlurRadius = 30
    shadow.shadowOffset = NSSize(width: 0, height: -12)
    shadow.set()
    ivory.setFill()
    tile.fill()
    NSGraphicsContext.restoreGraphicsState()

    // A restrained top highlight gives the warm tile depth without glossy decoration.
    NSGradient(starting: paper.withAlphaComponent(0.65), ending: ivory)!.draw(in: tile, angle: -90)
    color(222, 220, 211).withAlphaComponent(0.75).setStroke()
    tile.lineWidth = 2
    tile.stroke()

    let sheet = NSBezierPath(roundedRect: NSRect(x: 322, y: 516, width: 380, height: 298), xRadius: 29, yRadius: 29)
    paper.setFill()
    sheet.fill()
    charcoal.setStroke()
    sheet.lineWidth = 24
    sheet.stroke()

    // Draw the Markdown M and down arrow as paths, so no font is required.
    stroke([
        NSPoint(x: 378, y: 692), NSPoint(x: 378, y: 764),
        NSPoint(x: 421, y: 717), NSPoint(x: 464, y: 764),
        NSPoint(x: 464, y: 692)
    ], color: orange, width: 24)
    stroke([NSPoint(x: 574, y: 765), NSPoint(x: 574, y: 694)], color: orange, width: 24)
    stroke([NSPoint(x: 544, y: 720), NSPoint(x: 574, y: 690), NSPoint(x: 604, y: 720)], color: orange, width: 24)

    let envelope = NSBezierPath(roundedRect: NSRect(x: 222, y: 286, width: 580, height: 364), xRadius: 51, yRadius: 51)
    charcoal.setFill()
    envelope.fill()

    // The large single flap remains readable at 16 pixels.
    stroke([
        NSPoint(x: 253, y: 615), NSPoint(x: 486, y: 439),
        NSPoint(x: 512, y: 428), NSPoint(x: 538, y: 439),
        NSPoint(x: 771, y: 615)
    ], color: ivory, width: 27)
    NSGraphicsContext.restoreGraphicsState()
    guard let data = bitmap.representation(using: .png, properties: [:]) else {
        throw NSError(domain: "MailMarkdown.Icon", code: 1, userInfo: [NSLocalizedDescriptionKey: "Could not encode the icon."])
    }
    return data
}

let variants = [
    ("icon_16x16.png", 16), ("icon_16x16@2x.png", 32),
    ("icon_32x32.png", 32), ("icon_32x32@2x.png", 64),
    ("icon_128x128.png", 128), ("icon_128x128@2x.png", 256),
    ("icon_256x256.png", 256), ("icon_256x256@2x.png", 512),
    ("icon_512x512.png", 512), ("icon_512x512@2x.png", 1024)
]
for (name, pixels) in variants {
    try renderIcon(pixels: pixels).write(to: iconsetURL.appendingPathComponent(name))
}
try renderIcon(pixels: 1024).write(to: resourcesURL.appendingPathComponent("AppIcon.png"))

let iconutil = Process()
iconutil.executableURL = URL(fileURLWithPath: "/usr/bin/iconutil")
iconutil.arguments = ["-c", "icns", iconsetURL.path, "-o", resourcesURL.appendingPathComponent("AppIcon.icns").path]
try iconutil.run()
iconutil.waitUntilExit()
guard iconutil.terminationStatus == 0 else {
    throw NSError(domain: "MailMarkdown.Icon", code: Int(iconutil.terminationStatus), userInfo: [NSLocalizedDescriptionKey: "iconutil failed."])
}
print("Generated Resources/AppIcon.icns and Resources/AppIcon.png")
