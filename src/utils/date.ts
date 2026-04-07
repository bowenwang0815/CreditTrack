export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export function annualFeeCountdown(dateString: string) {
  const diff = daysUntil(dateString);

  if (diff < 0) {
    return "Past due";
  }
  if (diff === 0) {
    return "Due today";
  }
  if (diff === 1) {
    return "Due tomorrow";
  }
  return `${diff}d left`;
}

export function daysUntil(dateString: string) {
  const now = new Date();
  const current = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const due = new Date(dateString);
  const dueStart = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime();
  return Math.round((dueStart - current) / (1000 * 60 * 60 * 24));
}

export function annualFeeProgress(dateString: string) {
  const remainingDays = Math.max(0, Math.min(365, daysUntil(dateString)));
  return 1 - remainingDays / 365;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}
