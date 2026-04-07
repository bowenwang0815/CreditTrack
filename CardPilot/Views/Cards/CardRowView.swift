import SwiftUI

struct CardRowView: View {
    let card: Card

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(alignment: .top, spacing: 14) {
                CardThumbnailView(card: card)

                VStack(alignment: .leading, spacing: 6) {
                    HStack(alignment: .top) {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(card.displayName)
                                .font(.headline)
                                .foregroundStyle(.primary)

                            Text(card.issuer)
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }

                        Spacer(minLength: 8)

                        AnnualFeePillView(amount: card.annualFee)
                    }

                    if let last4 = card.last4 {
                        Text("Ending in \(last4)")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }

                    Text("$\(card.totalBenefitsRedeemedThisPeriod.formatted(.number.precision(.fractionLength(0...0)))) redeemed this cycle")
                        .font(.subheadline.weight(.medium))
                        .foregroundStyle(.primary)

                    Text("\(card.annualFeeDueCountdown) • \(card.unusedBenefitsCount) unused benefit\(card.unusedBenefitsCount == 1 ? "" : "s")")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }
            }

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(card.keyEarningRules) { rule in
                        CategoryChipView(rule: rule)
                    }
                }
            }
        }
        .padding(18)
        .background(.white, in: RoundedRectangle(cornerRadius: 26, style: .continuous))
        .shadow(color: Color.black.opacity(0.06), radius: 18, y: 8)
    }
}
