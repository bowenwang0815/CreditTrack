import SwiftData
import SwiftUI

struct CardsView: View {
    @Query(sort: [SortDescriptor(\Card.isActive, order: .reverse), SortDescriptor(\Card.name)]) private var cards: [Card]

    @State private var isPresentingAddCard = false

    var body: some View {
        NavigationStack {
            ZStack {
                Color(red: 0.95, green: 0.96, blue: 0.98)
                    .ignoresSafeArea()

                ScrollView {
                    VStack(alignment: .leading, spacing: 20) {
                        VStack(alignment: .leading, spacing: 6) {
                            Text("CardPilot")
                                .font(.largeTitle.bold())
                            Text("See every card, key benefit, and annual fee at a glance.")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }
                        .padding(.horizontal)

                        ForEach(cards) { card in
                            NavigationLink {
                                CardDetailView(card: card)
                            } label: {
                                CardRowView(card: card)
                            }
                            .buttonStyle(.plain)
                            .padding(.horizontal)
                        }

                        if cards.isEmpty {
                            ContentUnavailableView(
                                "No Cards Yet",
                                systemImage: "creditcard.trianglebadge.exclamationmark",
                                description: Text("Add a built-in template to start tracking benefits and annual fees.")
                            )
                            .padding(.top, 60)
                        }
                    }
                    .padding(.vertical)
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        isPresentingAddCard = true
                    } label: {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $isPresentingAddCard) {
                AddCardView()
            }
        }
    }
}

#Preview {
    CardsView()
        .modelContainer(PreviewContainer.shared.container)
}
