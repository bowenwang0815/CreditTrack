import { TrackerCard } from "../types";

const thisYear = new Date().getFullYear();
const today = new Date();

function nextAnnualDate(monthIndex: number, day: number) {
  const candidate = new Date(thisYear, monthIndex, day);
  if (candidate >= new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
    return candidate.toISOString();
  }
  return new Date(thisYear + 1, monthIndex, day).toISOString();
}

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export const cardTemplates: TrackerCard[] = [
  {
    id: "chase-sapphire-reserve",
    issuer: "Chase",
    name: "Sapphire Reserve",
    last4: "4821",
    annualFee: 550,
    annualFeeDueDate: nextAnnualDate(6, 18),
    openDate: "2022-07-18T00:00:00.000Z",
    colorHex: "#203457",
    isActive: true,
    rewardCurrencyType: "points",
    notes: "Primary travel card for premium travel and dining.",
    earningRules: [
      { id: makeId("rule"), category: "travel", multiplier: 3 },
      { id: makeId("rule"), category: "dining", multiplier: 3 },
      { id: makeId("rule"), category: "flights", multiplier: 3 },
      { id: makeId("rule"), category: "hotels", multiplier: 3 },
      { id: makeId("rule"), category: "everything_else", multiplier: 1 }
    ],
    benefits: [
      {
        id: makeId("benefit"),
        name: "Annual Travel Credit",
        type: "annual",
        valueAmount: 300,
        category: "travel",
        expirationRule: "Resets every cardmember year",
        lastUsedDate: new Date().toISOString(),
        amountUsedThisPeriod: 300,
        amountTotalThisPeriod: 300,
        isUsed: true,
        reminderDaysBefore: 30
      },
      {
        id: makeId("benefit"),
        name: "DoorDash Monthly Credit",
        type: "monthly",
        valueAmount: 5,
        category: "dining",
        expirationRule: "Expires each month",
        amountUsedThisPeriod: 0,
        amountTotalThisPeriod: 5,
        isUsed: false,
        reminderDaysBefore: 5
      }
    ]
  },
  {
    id: "amex-platinum",
    issuer: "American Express",
    name: "Platinum Card",
    last4: "1029",
    annualFee: 695,
    annualFeeDueDate: nextAnnualDate(10, 5),
    openDate: "2023-11-05T00:00:00.000Z",
    colorHex: "#D6DBE2",
    isActive: true,
    rewardCurrencyType: "points",
    notes: "Best for flights, lounge access, and stacked statement credits.",
    earningRules: [
      { id: makeId("rule"), category: "flights", multiplier: 5 },
      { id: makeId("rule"), category: "hotels", multiplier: 5, notes: "Prepaid Amex Travel hotels" },
      { id: makeId("rule"), category: "travel", multiplier: 5 },
      { id: makeId("rule"), category: "everything_else", multiplier: 1 }
    ],
    benefits: [
      {
        id: makeId("benefit"),
        name: "Airline Fee Credit",
        type: "annual",
        valueAmount: 200,
        category: "travel",
        expirationRule: "Calendar year",
        amountUsedThisPeriod: 0,
        amountTotalThisPeriod: 200,
        isUsed: false,
        reminderDaysBefore: 21
      },
      {
        id: makeId("benefit"),
        name: "Digital Entertainment Credit",
        type: "monthly",
        valueAmount: 20,
        category: "streaming",
        expirationRule: "Expires monthly",
        amountUsedThisPeriod: 0,
        amountTotalThisPeriod: 20,
        isUsed: false,
        reminderDaysBefore: 5
      },
      {
        id: makeId("benefit"),
        name: "Uber Cash",
        type: "monthly",
        valueAmount: 15,
        category: "dining",
        expirationRule: "Monthly, December gets extra",
        amountUsedThisPeriod: 15,
        amountTotalThisPeriod: 15,
        isUsed: true,
        reminderDaysBefore: 3
      }
    ]
  },
  {
    id: "amex-gold",
    issuer: "American Express",
    name: "Gold Card",
    last4: "8844",
    annualFee: 325,
    annualFeeDueDate: nextAnnualDate(1, 14),
    openDate: "2024-02-14T00:00:00.000Z",
    colorHex: "#CAA14A",
    isActive: true,
    rewardCurrencyType: "points",
    notes: "Daily driver for dining and U.S. supermarkets.",
    earningRules: [
      { id: makeId("rule"), category: "dining", multiplier: 4 },
      { id: makeId("rule"), category: "grocery", multiplier: 4 },
      { id: makeId("rule"), category: "flights", multiplier: 3 },
      { id: makeId("rule"), category: "everything_else", multiplier: 1 }
    ],
    benefits: [
      {
        id: makeId("benefit"),
        name: "Dining Credit",
        type: "monthly",
        valueAmount: 10,
        category: "dining",
        expirationRule: "Expires monthly",
        amountUsedThisPeriod: 10,
        amountTotalThisPeriod: 10,
        isUsed: true,
        reminderDaysBefore: 5
      },
      {
        id: makeId("benefit"),
        name: "Uber Cash",
        type: "monthly",
        valueAmount: 10,
        category: "dining",
        expirationRule: "Expires monthly",
        amountUsedThisPeriod: 0,
        amountTotalThisPeriod: 10,
        isUsed: false,
        reminderDaysBefore: 5
      },
      {
        id: makeId("benefit"),
        name: "Resy Credit",
        type: "monthly",
        valueAmount: 10,
        category: "dining",
        expirationRule: "Expires monthly",
        amountUsedThisPeriod: 0,
        amountTotalThisPeriod: 10,
        isUsed: false,
        reminderDaysBefore: 5
      }
    ]
  },
  {
    id: "chase-freedom-flex",
    issuer: "Chase",
    name: "Freedom Flex",
    last4: "2701",
    annualFee: 0,
    annualFeeDueDate: nextAnnualDate(7, 10),
    openDate: "2021-08-10T00:00:00.000Z",
    colorHex: "#556B92",
    isActive: true,
    rewardCurrencyType: "cash_back",
    notes: "Keep an eye on rotating quarterly categories.",
    earningRules: [
      { id: makeId("rule"), category: "travel", multiplier: 5, notes: "Booked through Chase Travel" },
      { id: makeId("rule"), category: "drugstores", multiplier: 3 },
      { id: makeId("rule"), category: "dining", multiplier: 3 },
      { id: makeId("rule"), category: "everything_else", multiplier: 1 }
    ],
    benefits: [
      {
        id: makeId("benefit"),
        name: "Quarterly Bonus Category",
        type: "quarterly",
        valueAmount: 75,
        expirationRule: "Rotates every quarter",
        amountUsedThisPeriod: 25,
        amountTotalThisPeriod: 75,
        isUsed: false,
        reminderDaysBefore: 10
      }
    ]
  },
  {
    id: "hilton-aspire",
    issuer: "American Express",
    name: "Hilton Aspire",
    last4: "6319",
    annualFee: 550,
    annualFeeDueDate: nextAnnualDate(8, 1),
    openDate: "2022-09-01T00:00:00.000Z",
    colorHex: "#202020",
    isActive: true,
    rewardCurrencyType: "hotel_points",
    notes: "Hotel-first card with strong Hilton perks.",
    earningRules: [
      { id: makeId("rule"), category: "hotels", multiplier: 14 },
      { id: makeId("rule"), category: "flights", multiplier: 7 },
      { id: makeId("rule"), category: "travel", multiplier: 7 },
      { id: makeId("rule"), category: "dining", multiplier: 7 },
      { id: makeId("rule"), category: "everything_else", multiplier: 3 }
    ],
    benefits: [
      {
        id: makeId("benefit"),
        name: "Hilton Resort Credit",
        type: "semiannual",
        valueAmount: 200,
        category: "hotels",
        expirationRule: "Twice per calendar year",
        amountUsedThisPeriod: 0,
        amountTotalThisPeriod: 200,
        isUsed: false,
        reminderDaysBefore: 14
      },
      {
        id: makeId("benefit"),
        name: "Flight Credit",
        type: "quarterly",
        valueAmount: 50,
        category: "flights",
        expirationRule: "Quarterly",
        amountUsedThisPeriod: 0,
        amountTotalThisPeriod: 50,
        isUsed: false,
        reminderDaysBefore: 10
      }
    ]
  },
  {
    id: "robinhood-gold-card",
    issuer: "Robinhood",
    name: "Gold Card",
    last4: "5510",
    annualFee: 50,
    annualFeeDueDate: nextAnnualDate(4, 30),
    openDate: "2025-05-30T00:00:00.000Z",
    colorHex: "#3D7A3B",
    isActive: true,
    rewardCurrencyType: "cash_back",
    notes: "Simple catch-all for uncategorized spending.",
    earningRules: [
      { id: makeId("rule"), category: "everything_else", multiplier: 3 },
      { id: makeId("rule"), category: "mobile_wallet", multiplier: 3 },
      { id: makeId("rule"), category: "online_shopping", multiplier: 3 }
    ],
    benefits: [
      {
        id: makeId("benefit"),
        name: "Gold Membership Offset",
        type: "annual",
        valueAmount: 50,
        expirationRule: "Track whether rewards outpace fee",
        amountUsedThisPeriod: 0,
        amountTotalThisPeriod: 50,
        isUsed: false,
        reminderDaysBefore: 20
      }
    ]
  }
];

export function makeInitialCards() {
  return cardTemplates.map((card) => ({
    ...card,
    earningRules: card.earningRules.map((rule) => ({ ...rule })),
    benefits: card.benefits.map((benefit) => ({ ...benefit }))
  }));
}
