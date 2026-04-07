import SwiftUI

struct ContentView: View {
    var body: some View {
        TabView {
            CardsView()
                .tabItem {
                    Label("Cards", systemImage: "creditcard")
                }

            BestCardView()
                .tabItem {
                    Label("Best Card", systemImage: "star.circle")
                }

            BenefitsView()
                .tabItem {
                    Label("Benefits", systemImage: "gift")
                }

            SettingsView()
                .tabItem {
                    Label("Settings", systemImage: "gearshape")
                }
        }
        .tint(.blue)
    }
}

#Preview {
    ContentView()
        .modelContainer(PreviewContainer.shared.container)
}
