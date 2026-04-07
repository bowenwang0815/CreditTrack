import Foundation
import SwiftData

enum BenefitType: String, Codable, CaseIterable, Identifiable {
    case monthly
    case quarterly
    case semiannual
    case annual
    case oneTime = "one_time"

    var id: String { rawValue }

    var title: String {
        switch self {
        case .monthly: "Monthly"
        case .quarterly: "Quarterly"
        case .semiannual: "Semiannual"
        case .annual: "Annual"
        case .oneTime: "One-Time"
        }
    }
}

@Model
final class Benefit {
    @Attribute(.unique) var id: UUID
    var name: String
    var type: BenefitType
    var valueAmount: Double
    var category: SpendingCategory?
    var expirationRule: String
    var lastUsedDate: Date?
    var amountUsedThisPeriod: Double
    var amountTotalThisPeriod: Double
    var isUsed: Bool
    var reminderDaysBefore: Int
    var card: Card?

    init(
        id: UUID = UUID(),
        name: String,
        type: BenefitType,
        valueAmount: Double,
        category: SpendingCategory? = nil,
        expirationRule: String,
        lastUsedDate: Date? = nil,
        amountUsedThisPeriod: Double = 0,
        amountTotalThisPeriod: Double,
        isUsed: Bool = false,
        reminderDaysBefore: Int = 7,
        card: Card? = nil
    ) {
        self.id = id
        self.name = name
        self.type = type
        self.valueAmount = valueAmount
        self.category = category
        self.expirationRule = expirationRule
        self.lastUsedDate = lastUsedDate
        self.amountUsedThisPeriod = amountUsedThisPeriod
        self.amountTotalThisPeriod = amountTotalThisPeriod
        self.isUsed = isUsed
        self.reminderDaysBefore = reminderDaysBefore
        self.card = card
    }
}

extension Benefit {
    var progress: Double {
        guard amountTotalThisPeriod > 0 else { return isUsed ? 1 : 0 }
        return min(max(amountUsedThisPeriod / amountTotalThisPeriod, 0), 1)
    }

    var remainingValue: Double {
        max(amountTotalThisPeriod - amountUsedThisPeriod, 0)
    }

    var statusText: String {
        if isUsed || progress >= 1 {
            return "Used"
        }

        if amountUsedThisPeriod > 0 {
            return "$\(amountUsedThisPeriod.formatted(.number.precision(.fractionLength(0...2)))) of $\(amountTotalThisPeriod.formatted(.number.precision(.fractionLength(0...2))))"
        }

        return "Unused"
    }

    func markUsed() {
        lastUsedDate = .now
        amountUsedThisPeriod = amountTotalThisPeriod
        isUsed = true
    }

    func resetForNextCycle() {
        lastUsedDate = nil
        amountUsedThisPeriod = 0
        isUsed = false
    }
}
