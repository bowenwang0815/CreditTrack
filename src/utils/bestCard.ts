import { SpendingCategory, TrackerCard } from "../types";
import { getRuleForCategory, getUnusedBenefitsCount } from "./cardHelpers";

export function getBestCardForCategory(cards: TrackerCard[], category: SpendingCategory) {
  const activeCards = cards.filter((card) => card.isActive);

  const best = activeCards.reduce<{
    card: TrackerCard | null;
    multiplier: number;
  }>(
    (current, card) => {
      const rule = getRuleForCategory(card, category);
      if (!rule) {
        return current;
      }

      if (rule.multiplier > current.multiplier) {
        return { card, multiplier: rule.multiplier };
      }

      if (
        rule.multiplier === current.multiplier &&
        current.card &&
        getUnusedBenefitsCount(card) > getUnusedBenefitsCount(current.card)
      ) {
        return { card, multiplier: rule.multiplier };
      }

      if (!current.card) {
        return { card, multiplier: rule.multiplier };
      }

      return current;
    },
    { card: null, multiplier: 0 }
  );

  return best;
}
