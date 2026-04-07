import Foundation
import SwiftData

enum SampleCards {
    static func seedIfNeeded(in context: ModelContext) throws {
        let descriptor = FetchDescriptor<Card>()
        let existing = try context.fetchCount(descriptor)
        guard existing == 0 else { return }

        for card in makeCards() {
            context.insert(card)
        }

        try context.save()
    }

    static func makeCards(referenceDate: Date = .now) -> [Card] {
        [
            chaseSapphireReserve(referenceDate: referenceDate),
            amexPlatinum(referenceDate: referenceDate),
            amexGold(referenceDate: referenceDate),
            chaseFreedomFlex(referenceDate: referenceDate),
            hiltonAspire(referenceDate: referenceDate),
            robinhoodGoldCard(referenceDate: referenceDate)
        ]
    }

    private static func chaseSapphireReserve(referenceDate: Date) -> Card {
        let card = Card(
            issuer: "Chase",
            name: "Sapphire Reserve",
            last4: "4821",
            annualFee: 550,
            annualFeeDueDate: shiftedDate(month: 7, day: 18, referenceDate: referenceDate),
            openDate: shiftedDate(year: 2022, month: 7, day: 18, referenceDate: referenceDate),
            colorHex: "#1F335A",
            rewardCurrencyType: .points,
            notes: "Primary travel card for premium travel and dining."
        )

        card.earningRules = [
            EarningRule(category: .travel, multiplier: 3),
            EarningRule(category: .dining, multiplier: 3),
            EarningRule(category: .flights, multiplier: 3),
            EarningRule(category: .hotels, multiplier: 3),
            EarningRule(category: .everythingElse, multiplier: 1)
        ]

        card.benefits = [
            Benefit(name: "Annual Travel Credit", type: .annual, valueAmount: 300, category: .travel, expirationRule: "Resets every cardmember year", amountUsedThisPeriod: 300, amountTotalThisPeriod: 300, isUsed: true),
            Benefit(name: "DoorDash Monthly Credit", type: .monthly, valueAmount: 5, category: .dining, expirationRule: "Expires each month", amountUsedThisPeriod: 0, amountTotalThisPeriod: 5),
            Benefit(name: "Global Entry / TSA PreCheck", type: .annual, valueAmount: 120, expirationRule: "Eligible every 4 years", amountUsedThisPeriod: 0, amountTotalThisPeriod: 120)
        ]

        link(card)
        return card
    }

    private static func amexPlatinum(referenceDate: Date) -> Card {
        let card = Card(
            issuer: "American Express",
            name: "Platinum Card",
            last4: "1029",
            annualFee: 695,
            annualFeeDueDate: shiftedDate(month: 11, day: 5, referenceDate: referenceDate),
            openDate: shiftedDate(year: 2023, month: 11, day: 5, referenceDate: referenceDate),
            colorHex: "#D6DBE2",
            rewardCurrencyType: .points,
            notes: "Best for flights, lounges, and stacked statement credits."
        )

        card.earningRules = [
            EarningRule(category: .flights, multiplier: 5),
            EarningRule(category: .hotels, multiplier: 5, notes: "Prepaid Fine Hotels + Resorts and Hotel Collection"),
            EarningRule(category: .travel, multiplier: 5),
            EarningRule(category: .everythingElse, multiplier: 1)
        ]

        card.benefits = [
            Benefit(name: "Airline Fee Credit", type: .annual, valueAmount: 200, category: .travel, expirationRule: "Calendar year", amountUsedThisPeriod: 0, amountTotalThisPeriod: 200),
            Benefit(name: "Uber Cash", type: .monthly, valueAmount: 15, category: .dining, expirationRule: "Monthly, December gets extra", amountUsedThisPeriod: 15, amountTotalThisPeriod: 15, isUsed: true),
            Benefit(name: "Digital Entertainment Credit", type: .monthly, valueAmount: 20, category: .streaming, expirationRule: "Expires monthly", amountUsedThisPeriod: 0, amountTotalThisPeriod: 20),
            Benefit(name: "Saks Credit", type: .semiannual, valueAmount: 50, expirationRule: "Twice per calendar year", amountUsedThisPeriod: 0, amountTotalThisPeriod: 50)
        ]

        link(card)
        return card
    }

    private static func amexGold(referenceDate: Date) -> Card {
        let card = Card(
            issuer: "American Express",
            name: "Gold Card",
            last4: "8844",
            annualFee: 325,
            annualFeeDueDate: shiftedDate(month: 2, day: 14, referenceDate: referenceDate),
            openDate: shiftedDate(year: 2024, month: 2, day: 14, referenceDate: referenceDate),
            colorHex: "#C9A44C",
            rewardCurrencyType: .points,
            notes: "Daily driver for dining and U.S. supermarkets."
        )

        card.earningRules = [
            EarningRule(category: .dining, multiplier: 4),
            EarningRule(category: .grocery, multiplier: 4),
            EarningRule(category: .flights, multiplier: 3),
            EarningRule(category: .everythingElse, multiplier: 1)
        ]

        card.benefits = [
            Benefit(name: "Dining Credit", type: .monthly, valueAmount: 10, category: .dining, expirationRule: "Expires monthly", amountUsedThisPeriod: 10, amountTotalThisPeriod: 10, isUsed: true),
            Benefit(name: "Uber Cash", type: .monthly, valueAmount: 10, category: .dining, expirationRule: "Expires monthly", amountUsedThisPeriod: 0, amountTotalThisPeriod: 10),
            Benefit(name: "Resy Credit", type: .monthly, valueAmount: 10, category: .dining, expirationRule: "Expires monthly", amountUsedThisPeriod: 0, amountTotalThisPeriod: 10)
        ]

        link(card)
        return card
    }

    private static func chaseFreedomFlex(referenceDate: Date) -> Card {
        let card = Card(
            issuer: "Chase",
            name: "Freedom Flex",
            last4: "2701",
            annualFee: 0,
            annualFeeDueDate: shiftedDate(month: 8, day: 10, referenceDate: referenceDate),
            openDate: shiftedDate(year: 2021, month: 8, day: 10, referenceDate: referenceDate),
            colorHex: "#546A90",
            rewardCurrencyType: .cashBack,
            notes: "Keep an eye on rotating quarterly categories."
        )

        card.earningRules = [
            EarningRule(category: .travel, multiplier: 5, notes: "Booked through Chase Travel"),
            EarningRule(category: .drugstores, multiplier: 3),
            EarningRule(category: .dining, multiplier: 3),
            EarningRule(category: .everythingElse, multiplier: 1)
        ]

        card.benefits = [
            Benefit(name: "Quarterly Bonus Category", type: .quarterly, valueAmount: 75, expirationRule: "Rotates every quarter", amountUsedThisPeriod: 25, amountTotalThisPeriod: 75),
            Benefit(name: "Lyft Benefit", type: .annual, valueAmount: 0, expirationRule: "Track promo availability", amountUsedThisPeriod: 0, amountTotalThisPeriod: 1)
        ]

        link(card)
        return card
    }

    private static func hiltonAspire(referenceDate: Date) -> Card {
        let card = Card(
            issuer: "American Express",
            name: "Hilton Aspire",
            last4: "6319",
            annualFee: 550,
            annualFeeDueDate: shiftedDate(month: 9, day: 1, referenceDate: referenceDate),
            openDate: shiftedDate(year: 2022, month: 9, day: 1, referenceDate: referenceDate),
            colorHex: "#212121",
            rewardCurrencyType: .hotelPoints,
            notes: "Hotel-first card with strong Hilton perks."
        )

        card.earningRules = [
            EarningRule(category: .hotels, multiplier: 14),
            EarningRule(category: .flights, multiplier: 7),
            EarningRule(category: .travel, multiplier: 7),
            EarningRule(category: .dining, multiplier: 7),
            EarningRule(category: .everythingElse, multiplier: 3)
        ]

        card.benefits = [
            Benefit(name: "Hilton Resort Credit", type: .semiannual, valueAmount: 200, category: .hotels, expirationRule: "Twice per calendar year", amountUsedThisPeriod: 0, amountTotalThisPeriod: 200),
            Benefit(name: "Flight Credit", type: .quarterly, valueAmount: 50, category: .flights, expirationRule: "Quarterly", amountUsedThisPeriod: 0, amountTotalThisPeriod: 50),
            Benefit(name: "Free Night Reward", type: .annual, valueAmount: 300, category: .hotels, expirationRule: "Issued yearly", amountUsedThisPeriod: 0, amountTotalThisPeriod: 300)
        ]

        link(card)
        return card
    }

    private static func robinhoodGoldCard(referenceDate: Date) -> Card {
        let card = Card(
            issuer: "Robinhood",
            name: "Gold Card",
            last4: "5510",
            annualFee: 50,
            annualFeeDueDate: shiftedDate(month: 5, day: 30, referenceDate: referenceDate),
            openDate: shiftedDate(year: 2025, month: 5, day: 30, referenceDate: referenceDate),
            colorHex: "#3F7D3C",
            rewardCurrencyType: .cashBack,
            notes: "Simple catch-all for uncategorized spending."
        )

        card.earningRules = [
            EarningRule(category: .everythingElse, multiplier: 3),
            EarningRule(category: .mobileWallet, multiplier: 3),
            EarningRule(category: .onlineShopping, multiplier: 3)
        ]

        card.benefits = [
            Benefit(name: "Gold Membership Offset", type: .annual, valueAmount: 50, expirationRule: "Track whether rewards outpace fee", amountUsedThisPeriod: 0, amountTotalThisPeriod: 50)
        ]

        link(card)
        return card
    }

    private static func shiftedDate(year: Int, month: Int, day: Int, referenceDate: Date) -> Date {
        var components = Calendar.current.dateComponents([.hour, .minute, .second], from: referenceDate)
        components.year = year
        components.month = month
        components.day = day
        return Calendar.current.date(from: components) ?? referenceDate
    }

    private static func shiftedDate(month: Int, day: Int, referenceDate: Date) -> Date {
        let currentYear = Calendar.current.component(.year, from: referenceDate)
        let candidate = shiftedDate(year: currentYear, month: month, day: day, referenceDate: referenceDate)
        if candidate >= Calendar.current.startOfDay(for: referenceDate) {
            return candidate
        }

        return shiftedDate(year: currentYear + 1, month: month, day: day, referenceDate: referenceDate)
    }

    private static func link(_ card: Card) {
        for rule in card.earningRules {
            rule.card = card
        }

        for benefit in card.benefits {
            benefit.card = card
        }
    }
}
