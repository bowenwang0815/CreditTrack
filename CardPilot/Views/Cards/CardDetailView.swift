import SwiftUI

struct CardDetailView: View {
    @Environment(\.modelContext) private var modelContext
    let card: Card

    var body: some View {
        ScrollView {
            VStack(spacing: 18) {
                header

                SectionCard(title: "Annual Fee") {
                    HStack {
                        VStack(alignment: .leading, spacing: 6) {
                            Text("$\(card.annualFee.formatted(.number.precision(.fractionLength(0))))")
                                .font(.title2.bold())
                            Text(card.annualFeeDueDate.formatted(date: .abbreviated, time: .omitted))
                                .foregroundStyle(.secondary)
                        }

                        Spacer()

                        Text(card.annualFeeDueCountdown)
                            .font(.subheadline.weight(.semibold))
                            .padding(.horizontal, 12)
                            .padding(.vertical, 8)
                            .background(Color.orange.opacity(0.12), in: Capsule())
                            .foregroundStyle(.orange)
                    }
                }

                SectionCard(title: "Earning Categories") {
                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                        ForEach(card.sortedEarningRules) { rule in
                            VStack(alignment: .leading, spacing: 6) {
                                Label(rule.category.title, systemImage: rule.category.symbolName)
                                    .font(.subheadline.weight(.semibold))
                                Text("\(rule.multiplier.formatted(.number.precision(.fractionLength(0...1))))x \(card.rewardCurrencyType.title)")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                                if let notes = rule.notes {
                                    Text(notes)
                                        .font(.caption2)
                                        .foregroundStyle(.secondary)
                                }
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(14)
                            .background(Color.black.opacity(0.04), in: RoundedRectangle(cornerRadius: 18, style: .continuous))
                        }
                    }
                }

                SectionCard(title: "Benefits") {
                    VStack(spacing: 12) {
                        ForEach(card.benefits) { benefit in
                            BenefitRowView(benefit: benefit) {
                                benefit.markUsed()
                                try? modelContext.save()
                            } onReset: {
                                benefit.resetForNextCycle()
                                try? modelContext.save()
                            }
                        }
                    }
                }

                if !card.notes.isEmpty {
                    SectionCard(title: "Notes") {
                        Text(card.notes)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .padding()
            .padding(.bottom, 32)
        }
        .background(Color(red: 0.95, green: 0.96, blue: 0.98))
        .navigationTitle(card.name)
        .navigationBarTitleDisplayMode(.inline)
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(spacing: 14) {
                CardThumbnailView(card: card)
                    .frame(width: 92, height: 60)

                VStack(alignment: .leading, spacing: 6) {
                    Text(card.displayName)
                        .font(.title2.bold())

                    Text(card.issuer)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)

                    if let last4 = card.last4 {
                        Text("•••• \(last4)")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }

                Spacer()
            }

            HStack(spacing: 10) {
                AnnualFeePillView(amount: card.annualFee)

                Text("\(card.unusedBenefitsCount) unused")
                    .font(.caption.weight(.semibold))
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(Color.blue.opacity(0.1), in: Capsule())
                    .foregroundStyle(.blue)
            }
        }
        .padding(20)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.white, in: RoundedRectangle(cornerRadius: 28, style: .continuous))
        .shadow(color: Color.black.opacity(0.06), radius: 20, y: 10)
    }
}

private struct BenefitRowView: View {
    let benefit: Benefit
    let onMarkUsed: () -> Void
    let onReset: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(benefit.name)
                        .font(.subheadline.weight(.semibold))

                    Text("\(benefit.type.title) • \(benefit.expirationRule)")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Spacer(minLength: 10)

                Text(benefit.statusText)
                    .font(.caption.weight(.semibold))
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(benefit.isUsed ? Color.green.opacity(0.12) : Color.orange.opacity(0.12), in: Capsule())
                    .foregroundStyle(benefit.isUsed ? Color.green : Color.orange)
            }

            ProgressView(value: benefit.progress)
                .tint(benefit.isUsed ? .green : .blue)

            HStack {
                Text("$\(benefit.valueAmount.formatted(.number.precision(.fractionLength(0...0)))) value")
                    .font(.caption)
                    .foregroundStyle(.secondary)

                Spacer()

                if benefit.isUsed {
                    Button("Reset", action: onReset)
                        .font(.caption.weight(.semibold))
                } else {
                    Button("Mark Used", action: onMarkUsed)
                        .font(.caption.weight(.semibold))
                }
            }
        }
        .padding(14)
        .background(Color.black.opacity(0.04), in: RoundedRectangle(cornerRadius: 18, style: .continuous))
    }
}

#Preview {
    NavigationStack {
        CardDetailView(card: SampleCards.makeCards().first!)
    }
    .modelContainer(PreviewContainer.shared.container)
}
