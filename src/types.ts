export type SpendingCategory =
  | "dining"
  | "grocery"
  | "gas"
  | "travel"
  | "flights"
  | "hotels"
  | "transit"
  | "drugstores"
  | "online_shopping"
  | "streaming"
  | "mobile_wallet"
  | "everything_else";

export type BenefitType = "monthly" | "quarterly" | "semiannual" | "annual" | "one_time";
export type RewardCurrencyType = "points" | "miles" | "cash_back" | "hotel_points";
export type TabKey = "dashboard" | "cards" | "best" | "benefits" | "settings";

export interface EarningRule {
  id: string;
  category: SpendingCategory;
  multiplier: number;
  notes?: string;
}

export interface Benefit {
  id: string;
  name: string;
  type: BenefitType;
  valueAmount: number;
  category?: SpendingCategory;
  expirationRule: string;
  lastUsedDate?: string;
  amountUsedThisPeriod: number;
  amountTotalThisPeriod: number;
  isUsed: boolean;
  reminderDaysBefore: number;
}

export interface TrackerCard {
  id: string;
  issuer: string;
  name: string;
  nickname?: string;
  last4?: string;
  annualFee: number;
  annualFeeDueDate: string;
  openDate?: string;
  colorHex: string;
  imageUrl?: string;
  imageAssetKey?: string;
  isActive: boolean;
  rewardCurrencyType: RewardCurrencyType;
  notes?: string;
  earningRules: EarningRule[];
  benefits: Benefit[];
}

export interface AddCardPayload {
  templateId: string;
  last4?: string;
  openDate: string;
  annualFeeDueDate: string;
}
