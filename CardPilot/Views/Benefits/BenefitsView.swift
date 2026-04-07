import SwiftData
import SwiftUI

struct BenefitsView: View {
    @Query(sort: \Benefit.name) private var benefits: [Benefit]

    var body: some View {
        NavigationStack {
            List {
                Section {
                    ForEach(benefits.filter { !$0.isUsed }) { benefit in
                        VStack(alignment: .leading, spacing: 4) {
                            Text(benefit.name)
                                .font(.headline)
                            Text(benefit.card?.name ?? "Unknown Card")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                            Text("\(benefit.type.title) • \(benefit.expirationRule)")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                        .listRowBackground(Color.white)
                    }
                } header: {
                    Text("Unused Benefits")
                }
            }
            .scrollContentBackground(.hidden)
            .background(Color(red: 0.95, green: 0.96, blue: 0.98))
            .navigationTitle("Benefits")
        }
    }
}
