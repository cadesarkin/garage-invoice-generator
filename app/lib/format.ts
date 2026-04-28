export function formatPrice(amount?: number | null): string {
  if (amount == null || Number.isNaN(amount)) return "Contact seller";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

export function formatInvoiceNumber(
  secondaryId?: number,
  fallbackUuid?: string,
): string {
  if (secondaryId) return `INV-${secondaryId}`;
  if (fallbackUuid) return `INV-${fallbackUuid.slice(0, 8).toUpperCase()}`;
  return "INV-DRAFT";
}

export function formatDeliveryMethod(method?: string | null): string | null {
  if (!method) return null;
  const map: Record<string, string> = {
    FREIGHT_FTL: "Full truckload freight",
    FREIGHT_LTL: "Less-than-truckload freight",
    DRIVE_AWAY: "Drive-away",
    PICKUP: "Buyer pickup",
  };
  return map[method] ?? method.replace(/_/g, " ").toLowerCase();
}

export function formatLocation(addr?: {
  state?: string | null;
  city?: string | null;
} | null): string | null {
  if (!addr) return null;
  const parts = [addr.city, addr.state].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}
