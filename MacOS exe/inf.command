#!/bin/zsh

cat > /tmp/screen_recording_check.swift <<'SWIFT'
import AppKit
import AVFoundation
import CoreMedia
import Foundation
import ScreenCaptureKit

final class StreamOutput: NSObject, SCStreamOutput {
    let imageView: NSImageView

    init(imageView: NSImageView) {
        self.imageView = imageView
    }

    func stream(_ stream: SCStream, didOutputSampleBuffer sampleBuffer: CMSampleBuffer, of outputType: SCStreamOutputType) {
        guard outputType == .screen,
              let pixelBuffer = sampleBuffer.imageBuffer else {
            return
        }

        let ciImage = CIImage(cvPixelBuffer: pixelBuffer)
        let context = CIContext()
        guard let cgImage = context.createCGImage(ciImage, from: ciImage.extent) else {
            return
        }

        DispatchQueue.main.async {
            self.imageView.image = NSImage(cgImage: cgImage, size: self.imageView.bounds.size)
        }
    }
}

final class ScreenRecordingCheck: NSObject, NSApplicationDelegate {
    private let imageView = NSImageView()
    private var stream: SCStream?
    private var streamOutput: StreamOutput?

    func applicationDidFinishLaunching(_ notification: Notification) {
        let previewWidth: CGFloat = 960
        let previewHeight: CGFloat = 600
        let window = NSWindow(
            contentRect: NSRect(x: 90, y: 90, width: previewWidth, height: previewHeight),
            styleMask: [.titled, .closable, .miniaturizable, .resizable],
            backing: .buffered,
            defer: false
        )
        window.title = "Screen Recording Check"
        window.level = .floating
        window.collectionBehavior = [.fullScreenPrimary]
        window.isReleasedWhenClosed = false

        imageView.frame = NSRect(x: 0, y: 0, width: previewWidth, height: previewHeight)
        imageView.imageScaling = .scaleProportionallyUpOrDown
        imageView.autoresizingMask = [.width, .height]
        imageView.wantsLayer = true
        imageView.layer?.magnificationFilter = .nearest
        imageView.layer?.borderColor = NSColor.systemBlue.cgColor
        imageView.layer?.borderWidth = 2

        let content = NSView(frame: NSRect(x: 0, y: 0, width: previewWidth, height: previewHeight))
        content.addSubview(imageView)
        window.contentView = content
        window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)

        Task {
            await startCapture()
        }
    }

    private func startCapture() async {
        do {
            let content = try await SCShareableContent.excludingDesktopWindows(false, onScreenWindowsOnly: true)
            guard let display = content.displays.first else {
                print("No display found")
                return
            }

            let filter = SCContentFilter(display: display, excludingWindows: [])
            let config = SCStreamConfiguration()
            config.width = Int(display.width)
            config.height = Int(display.height)
            config.minimumFrameInterval = CMTime(value: 1, timescale: 60)
            config.queueDepth = 3
            config.showsCursor = false

            let output = StreamOutput(imageView: imageView)
            let newStream = SCStream(filter: filter, configuration: config, delegate: nil)
            try newStream.addStreamOutput(output, type: .screen, sampleHandlerQueue: DispatchQueue(label: "dino.preview.frames"))

            streamOutput = output
            stream = newStream
            try await newStream.startCapture()
        } catch {
            print("Blocked: allow Terminal in Screen Recording")
        }
    }
}

let app = NSApplication.shared
let delegate = ScreenRecordingCheck()
app.delegate = delegate
app.setActivationPolicy(.regular)
app.run()
SWIFT

/usr/bin/swift /tmp/screen_recording_check.swift

echo
echo "Press Return to close this window."
read
