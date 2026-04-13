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

function cloneCard(card: TrackerCard) {
  return {
    ...card,
    earningRules: card.earningRules.map((rule) => ({ ...rule })),
    benefits: card.benefits.map((benefit) => ({ ...benefit }))
  };
}

function template(card: TrackerCard): TrackerCard {
  return cloneCard(card);
}

const featuredTemplates: TrackerCard[] = [
  template({
    id: "chase-sapphire-reserve",
    issuer: "Chase",
    name: "Sapphire Reserve",
    last4: "4821",
    annualFee: 550,
    annualFeeDueDate: nextAnnualDate(6, 18),
    openDate: "2022-07-18T00:00:00.000Z",
    colorHex: "#203457",
    imageAssetKey: "chase-sapphire-reserve",
    isActive: true,
    rewardCurrencyType: "points",
    notes: "Primary travel card for premium travel and dining.",
    earningRules: [
      { id: makeId("rule"), category: "flights", multiplier: 8, notes: "Flights booked through Chase Travel" },
      { id: makeId("rule"), category: "hotels", multiplier: 8, notes: "Hotels booked through Chase Travel" },
      { id: makeId("rule"), category: "travel", multiplier: 4, notes: "Direct airline and hotel bookings" },
      { id: makeId("rule"), category: "dining", multiplier: 3 },
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
        name: "The Edit Hotel Credit",
        type: "annual",
        valueAmount: 500,
        category: "hotels",
        expirationRule: "Annual prepaid bookings through The Edit",
        amountUsedThisPeriod: 0,
        amountTotalThisPeriod: 500,
        isUsed: false,
        reminderDaysBefore: 30
      },
      {
        id: makeId("benefit"),
        name: "Global Entry / TSA PreCheck / NEXUS Credit",
        type: "one_time",
        valueAmount: 120,
        category: "travel",
        expirationRule: "Every 4 years",
        amountUsedThisPeriod: 0,
        amountTotalThisPeriod: 120,
        isUsed: false,
        reminderDaysBefore: 45
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
  }),
  template({
    id: "amex-platinum",
    issuer: "American Express",
    name: "Platinum Card",
    last4: "1029",
    annualFee: 695,
    annualFeeDueDate: nextAnnualDate(10, 5),
    openDate: "2023-11-05T00:00:00.000Z",
    colorHex: "#D6DBE2",
    imageAssetKey: "amex-platinum",
    isActive: true,
    rewardCurrencyType: "points",
    notes: "Best for flights, lounge access, and stacked statement credits.",
    earningRules: [
      { id: makeId("rule"), category: "flights", multiplier: 5 },
      { id: makeId("rule"), category: "hotels", multiplier: 5, notes: "Prepaid Amex Travel hotels" },
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
        name: "Hotel Credit",
        type: "semiannual",
        valueAmount: 300,
        category: "hotels",
        expirationRule: "Up to $300 semiannually on eligible prepaid Amex Travel hotel bookings",
        amountUsedThisPeriod: 0,
        amountTotalThisPeriod: 300,
        isUsed: false,
        reminderDaysBefore: 21
      },
      {
        id: makeId("benefit"),
        name: "Digital Entertainment Credit",
        type: "monthly",
        valueAmount: 25,
        category: "streaming",
        expirationRule: "Expires monthly",
        amountUsedThisPeriod: 0,
        amountTotalThisPeriod: 25,
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
      },
      {
        id: makeId("benefit"),
        name: "Uber One Credit",
        type: "monthly",
        valueAmount: 10,
        category: "travel",
        expirationRule: "Monthly with eligible auto-renewing membership",
        amountUsedThisPeriod: 0,
        amountTotalThisPeriod: 10,
        isUsed: false,
        reminderDaysBefore: 5
      },
      {
        id: makeId("benefit"),
        name: "Resy Credit",
        type: "quarterly",
        valueAmount: 100,
        category: "dining",
        expirationRule: "Up to $100 per quarter at eligible U.S. Resy restaurants",
        amountUsedThisPeriod: 0,
        amountTotalThisPeriod: 100,
        isUsed: false,
        reminderDaysBefore: 14
      },
      {
        id: makeId("benefit"),
        name: "Saks Fifth Avenue Credit",
        type: "semiannual",
        valueAmount: 50,
        expirationRule: "Up to $50 January to June and $50 July to December",
        amountUsedThisPeriod: 0,
        amountTotalThisPeriod: 50,
        isUsed: false,
        reminderDaysBefore: 14
      }
    ]
  }),
  template({
    id: "amex-gold",
    issuer: "American Express",
    name: "Gold Card",
    last4: "8844",
    annualFee: 325,
    annualFeeDueDate: nextAnnualDate(1, 14),
    openDate: "2024-02-14T00:00:00.000Z",
    colorHex: "#CAA14A",
    imageAssetKey: "amex-gold",
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
        expirationRule: "Up to $10 monthly at eligible dining partners",
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
        name: "Dunkin' Credit",
        type: "monthly",
        valueAmount: 7,
        category: "dining",
        expirationRule: "Up to $7 monthly at U.S. Dunkin' locations",
        amountUsedThisPeriod: 0,
        amountTotalThisPeriod: 7,
        isUsed: false,
        reminderDaysBefore: 5
      },
      {
        id: makeId("benefit"),
        name: "Resy Credit",
        type: "semiannual",
        valueAmount: 50,
        category: "dining",
        expirationRule: "Up to $50 January to June and $50 July to December at eligible U.S. Resy restaurants",
        amountUsedThisPeriod: 0,
        amountTotalThisPeriod: 50,
        isUsed: false,
        reminderDaysBefore: 14
      }
    ]
  }),
  template({
    id: "chase-freedom-flex",
    issuer: "Chase",
    name: "Freedom Flex",
    last4: "2701",
    annualFee: 0,
    annualFeeDueDate: nextAnnualDate(7, 10),
    openDate: "2021-08-10T00:00:00.000Z",
    colorHex: "#556B92",
    imageAssetKey: "chase-freedom-flex",
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
      },
      {
        id: makeId("benefit"),
        name: "Lyft Credit",
        type: "monthly",
        valueAmount: 10,
        category: "transit",
        expirationRule: "Monthly when eligible Lyft benefit is active",
        amountUsedThisPeriod: 0,
        amountTotalThisPeriod: 10,
        isUsed: false,
        reminderDaysBefore: 5
      }
    ]
  }),
  template({
    id: "hilton-aspire",
    issuer: "American Express",
    name: "Hilton Aspire",
    last4: "6319",
    annualFee: 550,
    annualFeeDueDate: nextAnnualDate(8, 1),
    openDate: "2022-09-01T00:00:00.000Z",
    colorHex: "#202020",
    imageAssetKey: "hilton-aspire",
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
        expirationRule: "Up to $200 January to June and $200 July to December at participating Hilton Resorts",
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
        expirationRule: "Up to $50 per quarter on flights booked directly with airlines or through Amex Travel",
        amountUsedThisPeriod: 0,
        amountTotalThisPeriod: 50,
        isUsed: false,
        reminderDaysBefore: 10
      },
      {
        id: makeId("benefit"),
        name: "CLEAR Plus Credit",
        type: "annual",
        valueAmount: 209,
        category: "travel",
        expirationRule: "Calendar year",
        amountUsedThisPeriod: 0,
        amountTotalThisPeriod: 209,
        isUsed: false,
        reminderDaysBefore: 30
      },
      {
        id: makeId("benefit"),
        name: "Waldorf Astoria / Conrad Property Credit",
        type: "annual",
        valueAmount: 100,
        category: "hotels",
        expirationRule: "Qualifying two-night minimum booking at eligible properties",
        amountUsedThisPeriod: 0,
        amountTotalThisPeriod: 100,
        isUsed: false,
        reminderDaysBefore: 30
      }
    ]
  }),
  template({
    id: "robinhood-gold-card",
    issuer: "Robinhood",
    name: "Gold Card",
    last4: "5510",
    annualFee: 50,
    annualFeeDueDate: nextAnnualDate(4, 30),
    openDate: "2025-05-30T00:00:00.000Z",
    colorHex: "#3D7A3B",
    imageAssetKey: "robinhood-gold-card",
    isActive: true,
    rewardCurrencyType: "cash_back",
    notes: "Simple catch-all for uncategorized spending.",
    earningRules: [
      { id: makeId("rule"), category: "everything_else", multiplier: 3 },
      { id: makeId("rule"), category: "travel", multiplier: 5, notes: "Travel booked through the Robinhood travel portal" }
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
  })
];

const expandedTemplates: TrackerCard[] = [
  template({
    id: "amazon-prime-visa",
    issuer: "Chase",
    name: "Prime Visa",
    annualFee: 0,
    annualFeeDueDate: nextAnnualDate(3, 12),
    colorHex: "#505050",
    imageAssetKey: "amazon-prime-visa",
    isActive: true,
    rewardCurrencyType: "cash_back",
    notes: "Useful for Amazon and Whole Foods spend.",
    earningRules: [
      { id: makeId("rule"), category: "grocery", multiplier: 5 },
      { id: makeId("rule"), category: "everything_else", multiplier: 1 }
    ],
    benefits: []
  }),
  template({
    id: "bank-of-america-customized-cash",
    issuer: "Bank of America",
    name: "Customized Cash Rewards",
    annualFee: 0,
    annualFeeDueDate: nextAnnualDate(5, 3),
    colorHex: "#AF101F",
    imageAssetKey: "bank-of-america-customized-cash",
    isActive: true,
    rewardCurrencyType: "cash_back",
    notes: "Flexible category cash back card.",
    earningRules: [
      { id: makeId("rule"), category: "online_shopping", multiplier: 3 },
      { id: makeId("rule"), category: "grocery", multiplier: 2 },
      { id: makeId("rule"), category: "everything_else", multiplier: 1 }
    ],
    benefits: []
  }),
  template({
    id: "bank-of-america-premium-rewards",
    issuer: "Bank of America",
    name: "Premium Rewards",
    annualFee: 95,
    annualFeeDueDate: nextAnnualDate(9, 7),
    colorHex: "#B7B9BD",
    imageAssetKey: "bank-of-america-premium-rewards",
    isActive: true,
    rewardCurrencyType: "points",
    notes: "Travel-friendly Bank of America card with airline incidental credit.",
    earningRules: [
      { id: makeId("rule"), category: "travel", multiplier: 2 },
      { id: makeId("rule"), category: "dining", multiplier: 2 },
      { id: makeId("rule"), category: "everything_else", multiplier: 1.5 }
    ],
    benefits: [
      {
        id: makeId("benefit"),
        name: "Airline Incidental Credit",
        type: "annual",
        valueAmount: 100,
        category: "travel",
        expirationRule: "Calendar year",
        amountUsedThisPeriod: 0,
        amountTotalThisPeriod: 100,
        isUsed: false,
        reminderDaysBefore: 20
      },
      {
        id: makeId("benefit"),
        name: "Global Entry / TSA PreCheck Credit",
        type: "annual",
        valueAmount: 100,
        expirationRule: "Every 4 years",
        amountUsedThisPeriod: 0,
        amountTotalThisPeriod: 100,
        isUsed: false,
        reminderDaysBefore: 30
      }
    ]
  }),
  template({
    id: "bank-of-america-travel-rewards",
    issuer: "Bank of America",
    name: "Travel Rewards",
    annualFee: 0,
    annualFeeDueDate: nextAnnualDate(10, 3),
    colorHex: "#C7322F",
    imageAssetKey: "bank-of-america-travel-rewards",
    isActive: true,
    rewardCurrencyType: "points",
    notes: "No annual fee travel rewards card.",
    earningRules: [
      { id: makeId("rule"), category: "travel", multiplier: 1.5 },
      { id: makeId("rule"), category: "everything_else", multiplier: 1.5 }
    ],
    benefits: []
  }),
  template({
    id: "bank-of-america-unlimited-cash",
    issuer: "Bank of America",
    name: "Unlimited Cash Rewards",
    annualFee: 0,
    annualFeeDueDate: nextAnnualDate(2, 21),
    colorHex: "#A51E25",
    imageAssetKey: "bank-of-america-unlimited-cash",
    isActive: true,
    rewardCurrencyType: "cash_back",
    notes: "Flat-rate cash back card from Bank of America.",
    earningRules: [
      { id: makeId("rule"), category: "everything_else", multiplier: 1.5 }
    ],
    benefits: []
  }),
  template({
    id: "bank-of-america-bankamericard",
    issuer: "Bank of America",
    name: "BankAmericard",
    annualFee: 0,
    annualFeeDueDate: nextAnnualDate(6, 15),
    colorHex: "#8D959F",
    imageAssetKey: "bank-of-america-bankamericard",
    isActive: true,
    rewardCurrencyType: "cash_back",
    notes: "Simple no-annual-fee Bank of America card.",
    earningRules: [{ id: makeId("rule"), category: "everything_else", multiplier: 1 }],
    benefits: []
  }),
  template({
    id: "bank-of-america-premium-rewards-elite",
    issuer: "Bank of America",
    name: "Premium Rewards Elite",
    annualFee: 550,
    annualFeeDueDate: nextAnnualDate(0, 28),
    colorHex: "#4E535D",
    imageAssetKey: "bank-of-america-premium-rewards-elite",
    isActive: true,
    rewardCurrencyType: "points",
    notes: "Premium Bank of America travel card with stronger credits and lounge access.",
    earningRules: [
      { id: makeId("rule"), category: "travel", multiplier: 2 },
      { id: makeId("rule"), category: "dining", multiplier: 2 },
      { id: makeId("rule"), category: "everything_else", multiplier: 1.5 }
    ],
    benefits: [
      {
        id: makeId("benefit"),
        name: "Airline Incidental Credit",
        type: "annual",
        valueAmount: 300,
        category: "travel",
        expirationRule: "Calendar year",
        amountUsedThisPeriod: 0,
        amountTotalThisPeriod: 300,
        isUsed: false,
        reminderDaysBefore: 21
      },
      {
        id: makeId("benefit"),
        name: "Lifestyle Credit",
        type: "annual",
        valueAmount: 150,
        expirationRule: "Cardmember year",
        amountUsedThisPeriod: 0,
        amountTotalThisPeriod: 150,
        isUsed: false,
        reminderDaysBefore: 21
      }
    ]
  }),
  template({
    id: "capital-one-platinum",
    issuer: "Capital One",
    name: "Platinum Mastercard",
    annualFee: 0,
    annualFeeDueDate: nextAnnualDate(2, 9),
    colorHex: "#40434A",
    imageAssetKey: "capital-one-platinum",
    isActive: true,
    rewardCurrencyType: "cash_back",
    notes: "Basic credit-builder style card.",
    earningRules: [{ id: makeId("rule"), category: "everything_else", multiplier: 1 }],
    benefits: []
  }),
  template({
    id: "capital-one-venture",
    issuer: "Capital One",
    name: "Venture Rewards",
    annualFee: 95,
    annualFeeDueDate: nextAnnualDate(7, 19),
    colorHex: "#1E3A5F",
    imageAssetKey: "capital-one-venture",
    isActive: true,
    rewardCurrencyType: "miles",
    notes: "Everyday travel card with simple miles earning.",
    earningRules: [
      { id: makeId("rule"), category: "hotels", multiplier: 5, notes: "Hotels and rental cars through Capital One Travel" },
      { id: makeId("rule"), category: "everything_else", multiplier: 2 }
    ],
    benefits: [
      {
        id: makeId("benefit"),
        name: "Global Entry / TSA PreCheck Credit",
        type: "annual",
        valueAmount: 100,
        expirationRule: "Every 4 years",
        amountUsedThisPeriod: 0,
        amountTotalThisPeriod: 100,
        isUsed: false,
        reminderDaysBefore: 30
      },
      {
        id: makeId("benefit"),
        name: "Experience Credit",
        type: "annual",
        valueAmount: 50,
        category: "travel",
        expirationRule: "Up to $50 at Capital One Dining, Entertainment, or Premier Collection stays when eligible",
        amountUsedThisPeriod: 0,
        amountTotalThisPeriod: 50,
        isUsed: false,
        reminderDaysBefore: 21
      }
    ]
  }),
  template({
    id: "capital-one-venture-x",
    issuer: "Capital One",
    name: "Venture X",
    annualFee: 395,
    annualFeeDueDate: nextAnnualDate(11, 14),
    colorHex: "#0C2846",
    imageAssetKey: "capital-one-venture-x",
    isActive: true,
    rewardCurrencyType: "miles",
    notes: "Premium Capital One travel card with lounge access and annual travel credit.",
    earningRules: [
      { id: makeId("rule"), category: "hotels", multiplier: 10, notes: "Hotels and rental cars through Capital One Travel" },
      { id: makeId("rule"), category: "flights", multiplier: 5, notes: "Flights through Capital One Travel" },
      { id: makeId("rule"), category: "everything_else", multiplier: 2 }
    ],
    benefits: [
      {
        id: makeId("benefit"),
        name: "Annual Travel Credit",
        type: "annual",
        valueAmount: 300,
        category: "travel",
        expirationRule: "Cardmember year through Capital One Travel",
        amountUsedThisPeriod: 0,
        amountTotalThisPeriod: 300,
        isUsed: false,
        reminderDaysBefore: 30
      },
      {
        id: makeId("benefit"),
        name: "Anniversary Miles Bonus",
        type: "annual",
        valueAmount: 100,
        expirationRule: "10,000 bonus miles every card anniversary",
        amountUsedThisPeriod: 0,
        amountTotalThisPeriod: 100,
        isUsed: false,
        reminderDaysBefore: 21
      },
      {
        id: makeId("benefit"),
        name: "Global Entry / TSA PreCheck Credit",
        type: "one_time",
        valueAmount: 120,
        category: "travel",
        expirationRule: "Every 4 years",
        amountUsedThisPeriod: 0,
        amountTotalThisPeriod: 120,
        isUsed: false,
        reminderDaysBefore: 45
      }
    ]
  }),
  template({
    id: "capital-one-quicksilver",
    issuer: "Capital One",
    name: "Quicksilver",
    annualFee: 0,
    annualFeeDueDate: nextAnnualDate(2, 14),
    colorHex: "#8A8E93",
    imageAssetKey: "capital-one-quicksilver",
    isActive: true,
    rewardCurrencyType: "cash_back",
    notes: "Simple flat-rate cash back card.",
    earningRules: [{ id: makeId("rule"), category: "everything_else", multiplier: 1.5 }],
    benefits: []
  }),
  template({
    id: "capital-one-walmart-rewards",
    issuer: "Capital One",
    name: "Walmart Rewards Card",
    annualFee: 0,
    annualFeeDueDate: nextAnnualDate(5, 11),
    colorHex: "#1577D3",
    imageAssetKey: "capital-one-walmart-rewards",
    isActive: true,
    rewardCurrencyType: "cash_back",
    notes: "Walmart-focused store rewards card.",
    earningRules: [
      { id: makeId("rule"), category: "online_shopping", multiplier: 5, notes: "Walmart.com including pickup and delivery" },
      { id: makeId("rule"), category: "dining", multiplier: 2, notes: "Dining and travel" },
      { id: makeId("rule"), category: "travel", multiplier: 2, notes: "Travel purchases" },
      { id: makeId("rule"), category: "everything_else", multiplier: 1 }
    ],
    benefits: []
  }),
  template({
    id: "capital-one-savor",
    issuer: "Capital One",
    name: "Savor",
    annualFee: 95,
    annualFeeDueDate: nextAnnualDate(9, 12),
    colorHex: "#C97949",
    imageAssetKey: "capital-one-savor",
    isActive: true,
    rewardCurrencyType: "cash_back",
    notes: "Strong entertainment and dining card.",
    earningRules: [
      { id: makeId("rule"), category: "dining", multiplier: 4 },
      { id: makeId("rule"), category: "streaming", multiplier: 3 },
      { id: makeId("rule"), category: "grocery", multiplier: 3 },
      { id: makeId("rule"), category: "everything_else", multiplier: 1 }
    ],
    benefits: []
  }),
  template({
    id: "capital-one-savorone",
    issuer: "Capital One",
    name: "SavorOne",
    annualFee: 0,
    annualFeeDueDate: nextAnnualDate(3, 4),
    colorHex: "#D68657",
    imageAssetKey: "capital-one-savorone",
    isActive: true,
    rewardCurrencyType: "cash_back",
    notes: "No-annual-fee Capital One card for dining, groceries, and streaming.",
    earningRules: [
      { id: makeId("rule"), category: "dining", multiplier: 3 },
      { id: makeId("rule"), category: "grocery", multiplier: 3 },
      { id: makeId("rule"), category: "streaming", multiplier: 3 },
      { id: makeId("rule"), category: "everything_else", multiplier: 1 }
    ],
    benefits: []
  }),
  template({
    id: "capital-one-ventureone",
    issuer: "Capital One",
    name: "VentureOne Rewards",
    annualFee: 0,
    annualFeeDueDate: nextAnnualDate(1, 17),
    colorHex: "#365573",
    imageAssetKey: "capital-one-ventureone",
    isActive: true,
    rewardCurrencyType: "miles",
    notes: "Entry travel miles card with no annual fee.",
    earningRules: [
      { id: makeId("rule"), category: "hotels", multiplier: 5, notes: "Hotels and rental cars through Capital One Travel" },
      { id: makeId("rule"), category: "everything_else", multiplier: 1.25 }
    ],
    benefits: []
  }),
  template({
    id: "chase-freedom",
    issuer: "Chase",
    name: "Freedom",
    annualFee: 0,
    annualFeeDueDate: nextAnnualDate(7, 20),
    colorHex: "#179DCC",
    imageAssetKey: "chase-freedom",
    isActive: true,
    rewardCurrencyType: "cash_back",
    notes: "Classic rotating-category Freedom card.",
    earningRules: [
      { id: makeId("rule"), category: "grocery", multiplier: 5 },
      { id: makeId("rule"), category: "gas", multiplier: 5 },
      { id: makeId("rule"), category: "everything_else", multiplier: 1 }
    ],
    benefits: []
  }),
  template({
    id: "chase-freedom-unlimited",
    issuer: "Chase",
    name: "Freedom Unlimited",
    annualFee: 0,
    annualFeeDueDate: nextAnnualDate(1, 9),
    colorHex: "#1A2B77",
    imageAssetKey: "chase-freedom-unlimited",
    isActive: true,
    rewardCurrencyType: "cash_back",
    notes: "Flexible everyday Chase card.",
    earningRules: [
      { id: makeId("rule"), category: "dining", multiplier: 3 },
      { id: makeId("rule"), category: "drugstores", multiplier: 3 },
      { id: makeId("rule"), category: "travel", multiplier: 5, notes: "Booked through Chase Travel" },
      { id: makeId("rule"), category: "everything_else", multiplier: 1.5 }
    ],
    benefits: []
  }),
  template({
    id: "chase-sapphire-preferred",
    issuer: "Chase",
    name: "Sapphire Preferred",
    annualFee: 95,
    annualFeeDueDate: nextAnnualDate(10, 21),
    colorHex: "#0C3C6D",
    imageAssetKey: "chase-sapphire-preferred",
    isActive: true,
    rewardCurrencyType: "points",
    notes: "Mid-tier travel and dining card.",
    earningRules: [
      { id: makeId("rule"), category: "dining", multiplier: 3 },
      { id: makeId("rule"), category: "streaming", multiplier: 3 },
      { id: makeId("rule"), category: "online_shopping", multiplier: 3 },
      { id: makeId("rule"), category: "travel", multiplier: 2 },
      { id: makeId("rule"), category: "everything_else", multiplier: 1 }
    ],
    benefits: [
      {
        id: makeId("benefit"),
        name: "Hotel Credit",
        type: "annual",
        valueAmount: 50,
        category: "hotels",
        expirationRule: "Annual hotel credit on eligible Chase Travel hotel stays",
        amountUsedThisPeriod: 0,
        amountTotalThisPeriod: 50,
        isUsed: false,
        reminderDaysBefore: 20
      },
      {
        id: makeId("benefit"),
        name: "DoorDash Monthly Promo",
        type: "monthly",
        valueAmount: 10,
        category: "dining",
        expirationRule: "Monthly eligible DoorDash savings when active",
        amountUsedThisPeriod: 0,
        amountTotalThisPeriod: 10,
        isUsed: false,
        reminderDaysBefore: 5
      }
    ]
  }),
  template({
    id: "citi-double-cash",
    issuer: "Citi",
    name: "Double Cash",
    annualFee: 0,
    annualFeeDueDate: nextAnnualDate(4, 8),
    colorHex: "#0F6AAE",
    imageAssetKey: "citi-double-cash",
    isActive: true,
    rewardCurrencyType: "cash_back",
    notes: "Straightforward flat-rate Citi cash back card.",
    earningRules: [{ id: makeId("rule"), category: "everything_else", multiplier: 2 }],
    benefits: []
  }),
  template({
    id: "citi-prestige",
    issuer: "Citi",
    name: "Prestige",
    annualFee: 495,
    annualFeeDueDate: nextAnnualDate(6, 6),
    colorHex: "#282828",
    imageAssetKey: "citi-prestige",
    isActive: true,
    rewardCurrencyType: "points",
    notes: "Legacy premium Citi travel card.",
    earningRules: [
      { id: makeId("rule"), category: "dining", multiplier: 5 },
      { id: makeId("rule"), category: "flights", multiplier: 5 },
      { id: makeId("rule"), category: "hotels", multiplier: 3 },
      { id: makeId("rule"), category: "everything_else", multiplier: 1 }
    ],
    benefits: []
  }),
  template({
    id: "citi-simplicity",
    issuer: "Citi",
    name: "Simplicity",
    annualFee: 0,
    annualFeeDueDate: nextAnnualDate(8, 18),
    colorHex: "#4C6AB3",
    imageAssetKey: "citi-simplicity",
    isActive: true,
    rewardCurrencyType: "cash_back",
    notes: "Balance transfer style card with simple benefits.",
    earningRules: [{ id: makeId("rule"), category: "everything_else", multiplier: 1 }],
    benefits: []
  }),
  template({
    id: "discover-it",
    issuer: "Discover",
    name: "Discover it",
    annualFee: 0,
    annualFeeDueDate: nextAnnualDate(3, 25),
    colorHex: "#D9D9D9",
    imageAssetKey: "discover-it",
    isActive: true,
    rewardCurrencyType: "cash_back",
    notes: "Rotating 5% categories.",
    earningRules: [
      { id: makeId("rule"), category: "grocery", multiplier: 5 },
      { id: makeId("rule"), category: "gas", multiplier: 5 },
      { id: makeId("rule"), category: "everything_else", multiplier: 1 }
    ],
    benefits: []
  }),
  template({
    id: "marriott-bonvoy-boundless",
    issuer: "Chase",
    name: "Marriott Bonvoy Boundless",
    annualFee: 95,
    annualFeeDueDate: nextAnnualDate(11, 2),
    colorHex: "#083B57",
    imageAssetKey: "marriott-bonvoy-boundless",
    isActive: true,
    rewardCurrencyType: "hotel_points",
    notes: "Marriott-focused hotel card.",
    earningRules: [
      { id: makeId("rule"), category: "hotels", multiplier: 6 },
      { id: makeId("rule"), category: "everything_else", multiplier: 2 }
    ],
    benefits: [
      {
        id: makeId("benefit"),
        name: "Annual Free Night",
        type: "annual",
        valueAmount: 95,
        category: "hotels",
        expirationRule: "Issued yearly",
        amountUsedThisPeriod: 0,
        amountTotalThisPeriod: 95,
        isUsed: false,
        reminderDaysBefore: 30
      }
    ]
  }),
  template({
    id: "uber-visa",
    issuer: "Visa",
    name: "Uber Visa",
    annualFee: 0,
    annualFeeDueDate: nextAnnualDate(1, 27),
    colorHex: "#222222",
    imageAssetKey: "uber-visa",
    isActive: true,
    rewardCurrencyType: "cash_back",
    notes: "Legacy Uber card shown for collection completeness.",
    earningRules: [
      { id: makeId("rule"), category: "dining", multiplier: 4 },
      { id: makeId("rule"), category: "travel", multiplier: 3 },
      { id: makeId("rule"), category: "everything_else", multiplier: 1 }
    ],
    benefits: []
  }),
  template({
    id: "wells-fargo-propel",
    issuer: "Wells Fargo",
    name: "Propel",
    annualFee: 0,
    annualFeeDueDate: nextAnnualDate(4, 5),
    colorHex: "#A11E4A",
    imageAssetKey: "wells-fargo-propel",
    isActive: true,
    rewardCurrencyType: "points",
    notes: "Legacy Wells Fargo travel and transit card.",
    earningRules: [
      { id: makeId("rule"), category: "dining", multiplier: 3 },
      { id: makeId("rule"), category: "travel", multiplier: 3 },
      { id: makeId("rule"), category: "transit", multiplier: 3 },
      { id: makeId("rule"), category: "streaming", multiplier: 3 },
      { id: makeId("rule"), category: "everything_else", multiplier: 1 }
    ],
    benefits: []
  }),
  template({
    id: "amex-blue-cash-everyday",
    issuer: "American Express",
    name: "Blue Cash Everyday",
    annualFee: 0,
    annualFeeDueDate: nextAnnualDate(5, 18),
    colorHex: "#B9CBE2",
    imageAssetKey: "amex-blue-cash-everyday",
    isActive: true,
    rewardCurrencyType: "cash_back",
    notes: "No-fee everyday cash back card.",
    earningRules: [
      { id: makeId("rule"), category: "grocery", multiplier: 3 },
      { id: makeId("rule"), category: "online_shopping", multiplier: 3 },
      { id: makeId("rule"), category: "gas", multiplier: 3 },
      { id: makeId("rule"), category: "everything_else", multiplier: 1 }
    ],
    benefits: []
  }),
  template({
    id: "amex-blue-cash-preferred",
    issuer: "American Express",
    name: "Blue Cash Preferred",
    annualFee: 95,
    annualFeeDueDate: nextAnnualDate(7, 28),
    colorHex: "#21416F",
    imageAssetKey: "amex-blue-cash-preferred",
    isActive: true,
    rewardCurrencyType: "cash_back",
    notes: "Grocery and streaming-focused cash back card.",
    earningRules: [
      { id: makeId("rule"), category: "grocery", multiplier: 6 },
      { id: makeId("rule"), category: "streaming", multiplier: 6 },
      { id: makeId("rule"), category: "gas", multiplier: 3 },
      { id: makeId("rule"), category: "transit", multiplier: 3 },
      { id: makeId("rule"), category: "everything_else", multiplier: 1 }
    ],
    benefits: [
      {
        id: makeId("benefit"),
        name: "Disney Bundle Credit",
        type: "monthly",
        valueAmount: 7,
        category: "streaming",
        expirationRule: "Monthly with eligible subscription",
        amountUsedThisPeriod: 0,
        amountTotalThisPeriod: 7,
        isUsed: false,
        reminderDaysBefore: 5
      }
    ]
  }),
  template({
    id: "hilton-honors-amex",
    issuer: "American Express",
    name: "Hilton Honors Card",
    annualFee: 0,
    annualFeeDueDate: nextAnnualDate(8, 8),
    colorHex: "#2388D1",
    imageAssetKey: "hilton-honors-amex",
    isActive: true,
    rewardCurrencyType: "hotel_points",
    notes: "Entry Hilton card shown in the visual set.",
    earningRules: [
      { id: makeId("rule"), category: "hotels", multiplier: 7 },
      { id: makeId("rule"), category: "dining", multiplier: 5 },
      { id: makeId("rule"), category: "grocery", multiplier: 5 },
      { id: makeId("rule"), category: "gas", multiplier: 5 },
      { id: makeId("rule"), category: "everything_else", multiplier: 3 }
    ],
    benefits: []
  }),
  template({
    id: "citi-diamond-preferred",
    issuer: "Citi",
    name: "Diamond Preferred",
    annualFee: 0,
    annualFeeDueDate: nextAnnualDate(6, 15),
    colorHex: "#9B9B9B",
    imageAssetKey: "citi-diamond-preferred",
    isActive: true,
    rewardCurrencyType: "cash_back",
    notes: "Legacy low-rewards card template for completeness.",
    earningRules: [{ id: makeId("rule"), category: "everything_else", multiplier: 1 }],
    benefits: []
  })
];

export const starterCards: TrackerCard[] = featuredTemplates.map(cloneCard);
export const cardTemplates: TrackerCard[] = [...featuredTemplates, ...expandedTemplates].map(cloneCard);

export function makeInitialCards() {
  return starterCards.map(cloneCard);
}
