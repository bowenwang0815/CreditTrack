import SwiftUI

struct SettingsView: View {
    var body: some View {
        NavigationStack {
            List {
                Section("Storage") {
                    Label("Local-only data", systemImage: "internaldrive")
                    Label("SwiftData powered", systemImage: "cylinder.split.1x2")
                }

                Section("Next Up") {
                    Label("Notifications for fee reminders", systemImage: "bell.badge")
                    Label("AI card assistant", systemImage: "sparkles")
                }
            }
            .navigationTitle("Settings")
        }
    }
}
