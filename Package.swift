// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "MailMarkdown",
    platforms: [.macOS(.v13)],
    products: [
        .library(name: "MailMarkdownCore", targets: ["MailMarkdownCore"]),
        .executable(name: "MailMarkdown", targets: ["MailMarkdown"])
    ],
    dependencies: [
        .package(url: "https://github.com/swiftlang/swift-markdown.git", exact: "0.9.0")
    ],
    targets: [
        .target(name: "MailMarkdownCore", dependencies: [.product(name: "Markdown", package: "swift-markdown")]),
        .executableTarget(name: "MailMarkdown", dependencies: ["MailMarkdownCore"]),
        .testTarget(name: "MailMarkdownCoreTests", dependencies: ["MailMarkdownCore"])
    ]
)
