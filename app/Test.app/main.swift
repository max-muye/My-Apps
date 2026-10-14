import Cocoa

class AppDelegate: NSObject, NSApplicationDelegate {
    var window: NSWindow!

    func applicationDidFinishLaunching(_ notification: Notification) {
        // Create window
        window = NSWindow(
            contentRect: NSRect(
                x: 100,
                y: 100,
                width: 500,
                height: 300
            ),
            styleMask: [
                .titled,
                .closable,
                .miniaturizable,
                .resizable
            ],
            backing: .buffered,
            defer: false
        )

        window.title = "Test"
        window.center()

        // Create button
        let button = NSButton(
            title: "Click Me!",
            target: self,
            action: #selector(buttonClicked)
        )

        button.frame = NSRect(
            x: 150,
            y: 120,
            width: 200,
            height: 40
        )

        window.contentView?.addSubview(button)

        // Show window
        window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
    }

    @objc func buttonClicked() {
        let alert = NSAlert()

        alert.messageText = "Hello, World!"
        alert.informativeText = "You clicked the button!"
        alert.alertStyle = .informational
        alert.addButton(withTitle: "OK")

        alert.runModal()
    }

    func applicationShouldTerminateAfterLastWindowClosed(
        _ sender: NSApplication
    ) -> Bool {
        return true
    }
}

// Application entry point
let app = NSApplication.shared
let delegate = AppDelegate()

app.delegate = delegate
app.setActivationPolicy(.regular)
app.run()