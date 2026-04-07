import { EarningRule, SpendingCategory, TrackerCard } from "../types";

export function getDisplayName(card: TrackerCard) {
  return card.nickname?.trim() ? card.nickname : card.name;
}

export function getSortedRules(card: TrackerCard) {
  return [...card.earningRules].sort((left, right) => {
    if (left.multiplier === right.multiplier) {
      return getCategoryLabel(left.category).localeCompare(getCategoryLabel(right.category));
    }
    return right.multiplier - left.multiplier;
  });
}

export function getKeyRules(card: TrackerCard) {
  return getSortedRules(card).slice(0, 5);
}

export function getUnusedBenefitsCount(card: TrackerCard) {
  return card.benefits.filter((benefit) => !benefit.isUsed).length;
}

export function getRedeemedValue(card: TrackerCard) {
  return card.benefits.reduce((sum, benefit) => sum + benefit.amountUsedThisPeriod, 0);
}

export function getCategoryLabel(category: SpendingCategory) {
  const labels: Record<SpendingCategory, string> = {
    dining: "Dining",
    grocery: "Grocery",
    gas: "Gas",
    travel: "Travel",
    flights: "Flights",
    hotels: "Hotels",
    transit: "Transit",
    drugstores: "Drugstores",
    online_shopping: "Online Shopping",
    streaming: "Streaming",
    mobile_wallet: "Mobile Wallet",
    everything_else: "Everyday Spend"
  };
  return labels[category];
}

export function getCategoryIcon(category: SpendingCategory) {
  const icons: Record<SpendingCategory, string> = {
    dining: "fork",
    grocery: "cart",
    gas: "fuel",
    travel: "trip",
    flights: "plane",
    hotels: "hotel",
    transit: "train",
    drugstores: "health",
    online_shopping: "bag",
    streaming: "play",
    mobile_wallet: "phone",
    everything_else: "card"
  };
  return icons[category];
}

export function getRuleForCategory(card: TrackerCard, category: SpendingCategory): EarningRule | undefined {
  return (
    card.earningRules.find((rule) => rule.category === category) ||
    card.earningRules.find((rule) => rule.category === "everything_else")
  );
}
