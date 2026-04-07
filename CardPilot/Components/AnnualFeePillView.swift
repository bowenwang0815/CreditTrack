import SwiftUI

struct AnnualFeePillView: View {
    let amount: Double

    var body: some View {
        Text(amount == 0 ? "No fee" : "$\(amount.formatted(.number.precision(.fractionLength(0)))) AF")
            .font(.caption.weight(.semibold))
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(amount == 0 ? Color.green.opacity(0.12) : Color.orange.opacity(0.12), in: Capsule())
            .foregroundStyle(amount == 0 ? Color.green : Color.orange)
    }
}
