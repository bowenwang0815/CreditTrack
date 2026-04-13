import { Benefit, BenefitType, BenefitUsageEntry } from "../types";

function getQuarter(monthIndex: number) {
  return Math.floor(monthIndex / 3) + 1;
}

function getHalf(monthIndex: number) {
  return monthIndex < 6 ? 1 : 2;
}

export function getBenefitPeriodKey(type: BenefitType, reference = new Date()) {
  const year = reference.getFullYear();
  const monthIndex = reference.getMonth();

  switch (type) {
    case "monthly":
      return `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
    case "quarterly":
      return `${year}-Q${getQuarter(monthIndex)}`;
    case "semiannual":
      return `${year}-H${getHalf(monthIndex)}`;
    case "annual":
      return `${year}`;
    case "one_time":
      return "one-time";
  }
}

export function getBenefitPeriodLabel(type: BenefitType, reference = new Date()) {
  const year = reference.getFullYear();
  const monthLabel = reference.toLocaleDateString(undefined, { month: "long" });
  const quarter = getQuarter(reference.getMonth());
  const half = getHalf(reference.getMonth());

  switch (type) {
    case "monthly":
      return `${monthLabel} ${year}`;
    case "quarterly":
      return `Q${quarter} ${year}`;
    case "semiannual":
      return `${half === 1 ? "Jan-Jun" : "Jul-Dec"} ${year}`;
    case "annual":
      return `${year}`;
    case "one_time":
      return "Lifetime";
  }
}

export function normalizeBenefitState(benefit: Benefit, reference = new Date()): Benefit {
  const currentPeriodKey = getBenefitPeriodKey(benefit.type, reference);
  const currentPeriodLabel = getBenefitPeriodLabel(benefit.type, reference);
  const existingHistory = benefit.usageHistory ?? [];

  const seededHistory =
    existingHistory.length === 0 && benefit.amountUsedThisPeriod > 0
      ? [
          {
            id: `${benefit.id}-seed`,
            periodKey: currentPeriodKey,
            periodLabel: currentPeriodLabel,
            amountUsed: benefit.amountUsedThisPeriod,
            updatedAt: benefit.lastUsedDate ?? reference.toISOString()
          }
        ]
      : existingHistory;

  const currentEntry = seededHistory.find((entry) => entry.periodKey === currentPeriodKey);
  const amountUsedThisPeriod = currentEntry?.amountUsed ?? 0;

  return {
    ...benefit,
    usageHistory: seededHistory,
    currentPeriodKey,
    currentPeriodLabel,
    amountUsedThisPeriod,
    isUsed:
      benefit.amountTotalThisPeriod > 0
        ? amountUsedThisPeriod >= benefit.amountTotalThisPeriod
        : amountUsedThisPeriod > 0,
    lastUsedDate: currentEntry?.updatedAt ?? benefit.lastUsedDate
  };
}

export function buildUpdatedBenefitUsage(
  benefit: Benefit,
  amountUsed: number,
  reference = new Date()
): Benefit {
  const normalized = normalizeBenefitState(benefit, reference);
  const currentPeriodKey = normalized.currentPeriodKey ?? getBenefitPeriodKey(normalized.type, reference);
  const currentPeriodLabel =
    normalized.currentPeriodLabel ?? getBenefitPeriodLabel(normalized.type, reference);
  const clampedAmount = Math.max(0, Math.min(amountUsed, normalized.amountTotalThisPeriod));
  const history = normalized.usageHistory ?? [];
  const nextHistory = history.filter((entry) => entry.periodKey !== currentPeriodKey);

  if (clampedAmount > 0) {
    nextHistory.unshift({
      id: `${normalized.id}-${currentPeriodKey}`,
      periodKey: currentPeriodKey,
      periodLabel: currentPeriodLabel,
      amountUsed: clampedAmount,
      updatedAt: reference.toISOString()
    });
  }

  return normalizeBenefitState(
    {
      ...normalized,
      usageHistory: nextHistory,
      lastUsedDate: clampedAmount > 0 ? reference.toISOString() : undefined
    },
    reference
  );
}

export function getSortedUsageHistory(benefit: Benefit): BenefitUsageEntry[] {
  return [...(benefit.usageHistory ?? [])].sort(
    (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
  );
}
