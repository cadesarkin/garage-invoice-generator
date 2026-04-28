import { renderToBuffer } from "@react-pdf/renderer";
import { extractListingId, fetchListing, ListingFetchError } from "@/app/lib/garage";
import { InvoicePdf } from "@/app/lib/InvoicePdf";

export const runtime = "nodejs";

const ALLOWED_HOSTS = new Set([
  "shopgarage.com",
  "www.shopgarage.com",
  "garage-backend.onrender.com",
]);

function safeFilename(title: string, id: string): string {
  const slug =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "garage-listing";
  return `garage-invoice-${slug}-${id.slice(0, 8)}.pdf`;
}

async function fetchHeroImage(url?: string) {
  if (!url) return null;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const mimeType = res.headers.get("content-type") ?? "image/jpeg";
    if (!mimeType.startsWith("image/")) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    return { mimeType, base64: buf.toString("base64") };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const input = (body as { url?: string })?.url;

  if (typeof input !== "string" || !input.trim()) {
    return Response.json(
      { error: "Paste a Garage listing URL or its UUID." },
      { status: 400 },
    );
  }

  let sourceUrl: string | undefined;
  try {
    const parsed = new URL(input.trim());
    if (!ALLOWED_HOSTS.has(parsed.hostname)) {
      return Response.json(
        { error: "That link doesn't look like a shopgarage.com listing." },
        { status: 400 },
      );
    }
    sourceUrl = parsed.toString();
  } catch {
    // Not a URL — only OK if the input is a bare UUID.
  }

  const id = extractListingId(input);
  if (!id) {
    return Response.json(
      {
        error:
          "Couldn't find a listing ID in that input. Paste the full /listing/... URL.",
      },
      { status: 400 },
    );
  }

  let listing;
  try {
    listing = await fetchListing(id);
  } catch (err) {
    if (err instanceof ListingFetchError) {
      return Response.json({ error: err.message }, { status: err.status });
    }
    return Response.json(
      { error: "Unexpected error fetching the listing." },
      { status: 500 },
    );
  }

  const heroImageUrl = listing.listingImages
    ?.slice()
    .sort((a, b) => a.order - b.order)[0]?.url;
  const heroImage = await fetchHeroImage(heroImageUrl);

  const buffer = await renderToBuffer(
    InvoicePdf({
      listing,
      generatedAt: new Date(),
      sourceUrl,
      heroImage,
    }),
  );

  const filename = safeFilename(listing.listingTitle, listing.id);

  return new Response(buffer as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
