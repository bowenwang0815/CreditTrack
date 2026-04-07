import Foundation
import SwiftData

@Model
final class EarningRule {
    @Attribute(.unique) var id: UUID
    var category: SpendingCategory
    var multiplier: Double
    var notes: String?
    var card: Card?

    init(
        id: UUID = UUID(),
        category: SpendingCategory,
        multiplier: Double,
        notes: String? = nil,
        card: Card? = nil
    ) {
        self.id = id
        self.category = category
        self.multiplier = multiplier
        self.notes = notes
        self.card = card
    }
}
