export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysBetween(from: Date, to: Date) {
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / (1000 * 60 * 60 * 24));
}

export function getNextAnnualFeeDate(dateString: string, reference = new Date()) {
  const original = new Date(dateString);
  const candidate = new Date(reference.getFullYear(), original.getMonth(), original.getDate());

  if (startOfDay(candidate).getTime() < startOfDay(reference).getTime()) {
    return new Date(reference.getFullYear() + 1, original.getMonth(), original.getDate());
  }

  return candidate;
}

export function getPreviousAnnualFeeDate(dateString: string, reference = new Date()) {
  const nextDue = getNextAnnualFeeDate(dateString, reference);
  return new Date(nextDue.getFullYear() - 1, nextDue.getMonth(), nextDue.getDate());
}

export function formatAnnualFeeDueDate(dateString: string) {
  return formatDate(getNextAnnualFeeDate(dateString).toISOString());
}

export function annualFeeCountdown(dateString: string) {
  const diff = daysUntil(dateString);

  if (diff === 0) {
    return "Due today";
  }
  if (diff === 1) {
    return "Due tomorrow";
  }
  if (diff <= 7) {
    return `${diff}d left`;
  }
  if (diff <= 45) {
    return `${diff} days left`;
  }
  return `${diff}d left`;
}

export function daysUntil(dateString: string) {
  return daysBetween(new Date(), getNextAnnualFeeDate(dateString));
}

export function annualFeeProgress(dateString: string) {
  const nextDue = getNextAnnualFeeDate(dateString);
  const previousDue = getPreviousAnnualFeeDate(dateString);
  const cycleLength = Math.max(1, daysBetween(previousDue, nextDue));
  const elapsedDays = Math.max(0, Math.min(cycleLength, daysBetween(previousDue, new Date())));
  return elapsedDays / cycleLength;
}

export function getAnnualFeeStatus(dateString: string) {
  const daysRemaining = daysUntil(dateString);

  if (daysRemaining <= 7) {
    return {
      label: daysRemaining === 0 ? "Due today" : `${daysRemaining} days remaining`,
      tone: "urgent" as const
    };
  }

  if (daysRemaining <= 30) {
    return {
      label: `${daysRemaining} days remaining`,
      tone: "upcoming" as const
    };
  }

  return {
    label: `${daysRemaining} days remaining`,
    tone: "normal" as const
  };
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}
