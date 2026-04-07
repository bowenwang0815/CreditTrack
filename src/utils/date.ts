export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export function annualFeeCountdown(dateString: string) {
  const now = new Date();
  const current = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const due = new Date(dateString);
  const dueStart = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime();
  const diff = Math.round((dueStart - current) / (1000 * 60 * 60 * 24));

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

export function formatCurrency(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}
