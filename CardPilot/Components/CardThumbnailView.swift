import SwiftUI

struct CardThumbnailView: View {
    let card: Card

    var body: some View {
        RoundedRectangle(cornerRadius: 16, style: .continuous)
            .fill(
                LinearGradient(
                    colors: [Color(hex: card.colorHex), Color(hex: card.colorHex).opacity(0.65)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
            .overlay(alignment: .topLeading) {
                VStack(alignment: .leading, spacing: 8) {
                    Text(card.issuer.uppercased())
                        .font(.caption2.weight(.semibold))
                        .foregroundStyle(.white.opacity(0.75))

                    Spacer()

                    Image(systemName: "creditcard.fill")
                        .font(.title3.weight(.semibold))
                        .foregroundStyle(.white)

                    if let last4 = card.last4 {
                        Text("•••• \(last4)")
                            .font(.caption.weight(.medium))
                            .foregroundStyle(.white.opacity(0.9))
                    }
                }
                .padding(10)
            }
            .frame(width: 68, height: 44)
            .shadow(color: Color.black.opacity(0.12), radius: 10, y: 6)
    }
}
