import Foundation
import SwiftData
import SwiftUI

enum SpendingCategory: String, Codable, CaseIterable, Identifiable {
    case dining
    case grocery
    case gas
    case travel
    case flights
    case hotels
    case transit
    case drugstores
    case onlineShopping = "online_shopping"
    case streaming
    case mobileWallet = "mobile_wallet"
    case everythingElse = "everything_else"

    var id: String { rawValue }

    var title: String {
        switch self {
        case .dining: "Dining"
        case .grocery: "Grocery"
        case .gas: "Gas"
        case .travel: "Travel"
        case .flights: "Flights"
        case .hotels: "Hotels"
        case .transit: "Transit"
        case .drugstores: "Drugstores"
        case .onlineShopping: "Online Shopping"
        case .streaming: "Streaming"
        case .mobileWallet: "Mobile Wallet"
        case .everythingElse: "Everyday Spend"
        }
    }

    var symbolName: String {
        switch self {
        case .dining: "fork.knife"
        case .grocery: "cart"
        case .gas: "fuelpump"
        case .travel: "suitcase.rolling"
        case .flights: "airplane"
        case .hotels: "bed.double"
        case .transit: "tram"
        case .drugstores: "cross.case"
        case .onlineShopping: "bag"
        case .streaming: "play.rectangle"
        case .mobileWallet: "iphone.gen3"
        case .everythingElse: "creditcard"
        }
    }
}

enum RewardCurrencyType: String, Codable, CaseIterable {
    case points
    case miles
    case cashBack = "cash_back"
    case hotelPoints = "hotel_points"

    var title: String {
        switch self {
        case .points: "Points"
        case .miles: "Miles"
        case .cashBack: "Cash Back"
        case .hotelPoints: "Hotel Points"
        }
    }
}

@Model
final class Card {
    @Attribute(.unique) var id: UUID
    var issuer: String
    var name: String
    var nickname: String?
    var last4: String?
    var annualFee: Double
    var annualFeeDueDate: Date
    var openDate: Date?
    var colorHex: String
    var imageName: String?
    var isActive: Bool
    var rewardCurrencyType: RewardCurrencyType
    var notes: String

    @Relationship(deleteRule: .cascade, inverse: \EarningRule.card)
    var earningRules: [EarningRule]

    @Relationship(deleteRule: .cascade, inverse: \Benefit.card)
    var benefits: [Benefit]

    init(
        id: UUID = UUID(),
        issuer: String,
        name: String,
        nickname: String? = nil,
        last4: String? = nil,
        annualFee: Double,
        annualFeeDueDate: Date,
        openDate: Date? = nil,
        colorHex: String,
        imageName: String? = nil,
        isActive: Bool = true,
        rewardCurrencyType: RewardCurrencyType,
        notes: String = "",
        earningRules: [EarningRule] = [],
        benefits: [Benefit] = []
    ) {
        self.id = id
        self.issuer = issuer
        self.name = name
        self.nickname = nickname
        self.last4 = last4
        self.annualFee = annualFee
        self.annualFeeDueDate = annualFeeDueDate
        self.openDate = openDate
        self.colorHex = colorHex
        self.imageName = imageName
        self.isActive = isActive
        self.rewardCurrencyType = rewardCurrencyType
        self.notes = notes
        self.earningRules = earningRules
        self.benefits = benefits
    }
}

extension Card {
    var displayName: String {
        if let nickname, !nickname.isEmpty {
            return nickname
        }
        return name
    }

    var sortedEarningRules: [EarningRule] {
        earningRules.sorted {
            if $0.multiplier == $1.multiplier {
                return $0.category.title < $1.category.title
            }
            return $0.multiplier > $1.multiplier
        }
    }

    var keyEarningRules: [EarningRule] {
        Array(sortedEarningRules.prefix(5))
    }

    var totalBenefitsRedeemedThisPeriod: Double {
        benefits.reduce(0) { $0 + $1.amountUsedThisPeriod }
    }

    var unusedBenefitsCount: Int {
        benefits.filter { !$0.isUsed }.count
    }

    var annualFeeDueCountdown: String {
        let calendar = Calendar.current
        let startOfToday = calendar.startOfDay(for: .now)
        let startOfDue = calendar.startOfDay(for: annualFeeDueDate)
        let days = calendar.dateComponents([.day], from: startOfToday, to: startOfDue).day ?? 0

        switch days {
        case ..<0:
            return "Past due"
        case 0:
            return "Due today"
        case 1:
            return "Due tomorrow"
        default:
            return "\(days)d left"
        }
    }
}

extension Color {
    init(hex: String) {
        let cleaned = hex.replacingOccurrences(of: "#", with: "")
        let value = UInt64(cleaned, radix: 16) ?? 0xD1D5DB
        let red = Double((value >> 16) & 0xFF) / 255.0
        let green = Double((value >> 8) & 0xFF) / 255.0
        let blue = Double(value & 0xFF) / 255.0
        self.init(red: red, green: green, blue: blue)
    }
}
