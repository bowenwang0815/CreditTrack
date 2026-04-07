import SwiftData
import SwiftUI

struct BestCardView: View {
    @Query(filter: #Predicate<Card> { $0.isActive }, sort: \Card.name) private var cards: [Card]

    private let categories: [SpendingCategory] = [.dining, .grocery, .gas, .travel, .flights, .hotels, .drugstores, .transit, .everythingElse]

    var body: some View {
        NavigationStack {
            ZStack {
                Color(red: 0.95, green: 0.96, blue: 0.98)
                    .ignoresSafeArea()

                List {
                    Section {
                        ForEach(categories) { category in
                            let recommendation = bestCard(for: category)
                            HStack(spacing: 12) {
                                Image(systemName: category.symbolName)
                                    .font(.headline)
                                    .foregroundStyle(.blue)
                                    .frame(width: 28)

                                VStack(alignment: .leading, spacing: 4) {
                                    Text(category.title)
                                        .font(.headline)

                                    if let card = recommendation.card {
                                        Text("\(card.name) • \(recommendation.multiplier.formatted(.number.precision(.fractionLength(0...1))))x")
                                            .font(.subheadline)
                                            .foregroundStyle(.secondary)
                                    } else {
                                        Text("No active card found")
                                            .font(.subheadline)
                                            .foregroundStyle(.secondary)
                                    }
                                }
                            }
                            .listRowBackground(Color.white)
                        }
                    } header: {
                        Text("Highest multiplier by category")
                    }
                }
                .scrollContentBackground(.hidden)
            }
            .navigationTitle("Best Card")
        }
    }

    private func bestCard(for category: SpendingCategory) -> (card: Card?, multiplier: Double) {
        let candidates = cards.compactMap { card -> (Card, Double)? in
            guard let rule = card.earningRules.first(where: { $0.category == category }) ?? card.earningRules.first(where: { $0.category == .everythingElse }) else {
                return nil
            }
            return (card, rule.multiplier)
        }

        return candidates.max { lhs, rhs in
            if lhs.1 == rhs.1 {
                return lhs.0.unusedBenefitsCount < rhs.0.unusedBenefitsCount
            }
            return lhs.1 < rhs.1
        } ?? (nil, 0)
    }
}

#Preview {
    BestCardView()
        .modelContainer(PreviewContainer.shared.container)
}
