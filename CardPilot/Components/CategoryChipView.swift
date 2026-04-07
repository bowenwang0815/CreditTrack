import SwiftUI

struct CategoryChipView: View {
    let rule: EarningRule

    var body: some View {
        HStack(spacing: 6) {
            Image(systemName: rule.category.symbolName)
                .font(.caption2)
            Text("\(rule.multiplier.formatted(.number.precision(.fractionLength(0...1))))x \(rule.category.title)")
                .lineLimit(1)
                .font(.caption.weight(.medium))
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .background(Color.primary.opacity(0.06), in: Capsule())
        .foregroundStyle(.secondary)
    }
}
