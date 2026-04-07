import SwiftData
import SwiftUI

@main
struct CardPilotApp: App {
    private let container: ModelContainer = {
        let schema = Schema([Card.self, Benefit.self, EarningRule.self])
        let configuration = ModelConfiguration("CardPilot")
        return try! ModelContainer(for: schema, configurations: configuration)
    }()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .task {
                    try? SampleCards.seedIfNeeded(in: container.mainContext)
                }
        }
        .modelContainer(container)
    }
}
