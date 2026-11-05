#!/usr/bin/env swift
import Foundation

// Legacy entry point: the canonical SVG now drives every icon output.
FileHandle.standardError.write(Data("Legacy icon generator disabled. Use Node.js 24: node scripts/generate-icon.mjs\n".utf8))
exit(EXIT_FAILURE)
