import SwiftData

@MainActor
enum PreviewContainer {
    static let shared = PreviewContainerProvider()
}

@MainActor
final class PreviewContainerProvider {
    let container: ModelContainer

    init() {
        let schema = Schema([Card.self, Benefit.self, EarningRule.self])
        let configuration = ModelConfiguration(isStoredInMemoryOnly: true)
        container = try! ModelContainer(for: schema, configurations: configuration)
        try? SampleCards.seedIfNeeded(in: container.mainContext)
    }
}
