import SwiftUI

struct AddCardView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext

    @State private var selectedCardName = SampleCards.makeCards().first?.name ?? ""
    @State private var last4 = ""
    @State private var openDate = Date.now
    @State private var annualFeeDate = Date.now

    private var templates: [Card] {
        SampleCards.makeCards()
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Template") {
                    Picker("Card", selection: $selectedCardName) {
                        ForEach(templates, id: \.name) { template in
                            Text(template.name).tag(template.name)
                        }
                    }
                }

                Section("Details") {
                    TextField("Last 4 digits", text: $last4)
                        .keyboardType(.numberPad)

                    DatePicker("Open Date", selection: $openDate, displayedComponents: .date)
                    DatePicker("Annual Fee Date", selection: $annualFeeDate, displayedComponents: .date)
                }
            }
            .navigationTitle("Add Card")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }

                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        saveCard()
                    }
                }
            }
        }
    }

    private func saveCard() {
        guard let template = templates.first(where: { $0.name == selectedCardName }) else { return }

        let card = Card(
            issuer: template.issuer,
            name: template.name,
            nickname: template.nickname,
            last4: last4.isEmpty ? template.last4 : String(last4.prefix(4)),
            annualFee: template.annualFee,
            annualFeeDueDate: annualFeeDate,
            openDate: openDate,
            colorHex: template.colorHex,
            imageName: template.imageName,
            isActive: true,
            rewardCurrencyType: template.rewardCurrencyType,
            notes: template.notes
        )

        card.earningRules = template.earningRules.map {
            EarningRule(category: $0.category, multiplier: $0.multiplier, notes: $0.notes, card: card)
        }

        card.benefits = template.benefits.map {
            Benefit(
                name: $0.name,
                type: $0.type,
                valueAmount: $0.valueAmount,
                category: $0.category,
                expirationRule: $0.expirationRule,
                amountUsedThisPeriod: 0,
                amountTotalThisPeriod: $0.amountTotalThisPeriod,
                isUsed: false,
                reminderDaysBefore: $0.reminderDaysBefore,
                card: card
            )
        }

        modelContext.insert(card)
        try? modelContext.save()
        dismiss()
    }
}
