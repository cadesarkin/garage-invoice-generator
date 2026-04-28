const GARAGE_BACKEND = "https://garage-backend.onrender.com";

const UUID_RE =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

export type ListingAttribute = {
  id: string;
  listingId: string;
  categoryAttributeId: string;
  value: string;
  categoryAttribute?: {
    name?: string;
    unit?: string | null;
  } | null;
};

export type ListingImage = {
  id: string;
  order: number;
  url: string;
};

export type GarageListing = {
  id: string;
  secondaryId?: number;
  status: string;
  listingTitle: string;
  listingDescription?: string | null;
  sellingPrice?: number | null;
  appraisedPrice?: number | null;
  estimatedPriceMin?: number | null;
  estimatedPriceMax?: number | null;
  itemBrand?: string | null;
  itemAge?: number | null;
  itemLength?: number | null;
  itemWidth?: number | null;
  itemHeight?: number | null;
  itemWeight?: number | null;
  vin?: string | null;
  isAuction?: boolean;
  deliveryMethod?: string | null;
  isPickupAvailable?: boolean;
  createdAt?: string;
  updatedAt?: string;
  ListingAttribute?: ListingAttribute[];
  listingImages?: ListingImage[];
  address?: {
    state?: string | null;
    city?: string | null;
    streetAddress?: string | null;
    zipCode?: string | null;
  } | null;
  category?: {
    name?: string;
  } | null;
};

export class ListingFetchError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.status = status;
  }
}

export function extractListingId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const match = trimmed.match(UUID_RE);
  return match ? match[0].toLowerCase() : null;
}

export async function fetchListing(id: string): Promise<GarageListing> {
  const url = `${GARAGE_BACKEND}/listings/${encodeURIComponent(id)}`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { accept: "application/json" },
      cache: "no-store",
    });
  } catch (err) {
    throw new ListingFetchError(
      `Could not reach the Garage API: ${(err as Error).message}`,
    );
  }

  if (res.status === 404) {
    throw new ListingFetchError(
      "No Garage listing was found for that link.",
      404,
    );
  }
  if (!res.ok) {
    throw new ListingFetchError(
      `Garage API responded with ${res.status}.`,
      502,
    );
  }
  return (await res.json()) as GarageListing;
}
