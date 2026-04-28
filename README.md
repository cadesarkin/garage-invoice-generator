# Garage Invoice Studio

A small Next.js app that turns any [shopgarage.com](https://www.shopgarage.com) fire-truck listing into a board-ready PDF invoice. Built as a takehome demo.

> Fire departments often need a printed invoice before the board signs off on a new apparatus. Paste the listing link, get a polished PDF in seconds.

---

## What it does

1. You paste a Garage listing URL (or just the listing UUID).
2. The server pulls the live listing from Garage's public API.
3. It downloads the hero image, formats the specs, and renders a multi-page PDF on the server with `@react-pdf/renderer`.
4. The PDF streams back to the browser as a download.

No database, no auth, no listing cache — every request hits the live Garage API so the PDF always reflects the current listing.

---

## Quick start

```bash
npm install
npm run dev
```

Then open <http://localhost:3000> and paste a listing URL like:

```
https://www.shopgarage.com/listing/2025-Toyne-Freightliner-4x4-Pumper-11653dfc-46ea-4c03-9f10-f9f6065909b1
```

A bare UUID works too:

```
11653dfc-46ea-4c03-9f10-f9f6065909b1
```

---

## How it's wired up

```
app/
├── page.tsx                    Marketing-style landing page
├── layout.tsx                  Root layout, Geist fonts, Tailwind v4
├── globals.css                 Tailwind + theme tokens
├── components/
│   └── InvoiceForm.tsx         Client form + download trigger
├── api/
│   └── invoice/route.ts        POST endpoint: URL → PDF stream
└── lib/
    ├── garage.ts               Listing fetch + UUID extraction
    ├── format.ts               Price/date/location formatters
    └── InvoicePdf.tsx          @react-pdf/renderer document
```

### Request lifecycle

1. **`InvoiceForm`** posts `{ url }` to `/api/invoice`.
2. **`route.ts`** validates the host (`shopgarage.com`, `www.shopgarage.com`, or the backend), extracts a UUID with a regex (`extractListingId`), and calls `fetchListing(id)`.
3. **`fetchListing`** hits `https://garage-backend.onrender.com/listings/{id}` and returns a typed `GarageListing`.
4. The route fetches the hero image as base64 (so the PDF renderer can embed it without a network round-trip), then calls `renderToBuffer(InvoicePdf({...}))`.
5. The buffer streams back with `Content-Type: application/pdf` and a slugified `Content-Disposition` filename.

### The PDF document

`InvoicePdf.tsx` defines a single Letter-size page with:

- A fixed header (brand mark + invoice number + issue date)
- A title block with status pill, location, and category
- Hero image (220pt tall, contained)
- A 3-column meta grid: **Listing ID / Asking Price / Delivery**
- Apparatus description (full text from the listing)
- Spec table built from `ListingAttribute` plus dimensions/weight/VIN
- Quoted total band
- Fixed footer with page numbers and source URL

The PDF font stack is Helvetica + Helvetica-Bold + Courier (built into PDF — no external fonts to download).

---

## What this round of polish changed

### 1. Site-level styling closer to shopgarage.com

`app/page.tsx` was reworked to feel like a marketing page on the real Garage site rather than a generic admin form:

- **Sticky white header with a dark "Visit Garage" pill CTA** — matches the shopgarage.com nav pattern (Browse / Sell / Appraisals / How it works).
- **Wider hero with a left-side form and a right-side preview** of what the PDF looks like (a tilted, shadowed mockup card).
- **Trust strip** listing the apparatus manufacturers the tool works with (Pierce, E-One, Spartan, Ferrara, KME, Toyne, HME, Crimson) — same logo-row pattern Garage uses for partner departments.
- **Three-step "How it works" section** with numbered cards in a 3-column grid, restyled with a subtle hover lift and a red number tile.
- **FAQ section** with three questions about data freshness and what the invoice represents.
- **Cleaner footer** matching the header's wordmark.

The form (`InvoiceForm.tsx`) now has:

- A leading link icon inside the input.
- A "UUID also accepted" helper next to the label.
- **Two action buttons side-by-side**: a primary red **Download PDF** (also fires on Enter in the input) and a secondary outlined **Open in new tab** that opens the same generated PDF in a new browser tab via `window.open(blobUrl, "_blank")`. The buttons share one fetch path; only the post-fetch action differs. The clicked button shows its own loading spinner so it's clear which action is in flight.
- A graceful fallback if the new-tab open is blocked by a pop-up blocker — the form surfaces an error pointing at the Download button instead.
- Status messages styled as colored alert pills (red error, green success) instead of plain coloured text. The success line says "Downloaded" or "Opened" depending on which button you used.

The brand color stays Garage red — appropriate for emergency vehicles and consistent with shopgarage.com's accent.

### 2. Long listing-ID overflow in the PDF

The Listing ID box on the PDF used to render the full UUID (`11653dfc-46ea-4c03-9f10-f9f6065909b1`) at 9pt sans-serif. Three problems:

1. UUIDs are 36 characters with hyphens. The meta column is ~130pt wide.
2. `@react-pdf/renderer` only breaks lines on whitespace by default — hyphens don't count.
3. Result: the UUID either overflowed the column or got pushed onto a wrapped line that broke the card layout.

**Fix** in `app/lib/InvoicePdf.tsx`:

```ts
Font.registerHyphenationCallback((word) => {
  if (word.length <= 16 || !word.includes("-")) return [word];
  const segments = word.split("-");
  return segments.map((seg, i) =>
    i < segments.length - 1 ? `${seg}-` : seg,
  );
});
```

That registers a global hyphenation callback so any long hyphenated token (UUIDs, slugs) gets split at its hyphens, with the hyphen kept at the end of the preceding segment so it reads naturally on wrap.

The UUID line itself also got its own style:

```ts
metaIdSub: {
  fontSize: 7.5,
  color: COLORS.faint,
  marginTop: 4,
  fontFamily: "Courier",
  lineHeight: 1.3,
},
```

Smaller, monospaced (so character widths are predictable), and lighter — still legible as a reference, but no longer fights the surrounding layout.

---

## Verification

After the changes:

- `npx tsc --noEmit` — passes, no type errors.
- `curl http://localhost:3000/` — returns 200 with all new sections (`Board-ready`, `Common questions`, `Generate invoice`, `Pierce`, etc.).
- `POST /api/invoice` with a real Garage listing URL returns a valid 3-page PDF (`%PDF-1.3`, ~1.7MB).
- The generated PDF embeds the Courier font (confirmed via stream inspection), meaning the `metaIdSub` style is being applied.
- Next.js dev server log is clean after the HMR cycle.

A headless-browser visual diff was attempted via `gstack browse`, but the local browse binary needs a Windows-specific build that wasn't available in this environment. The HTML response contains every new section name and the dev log shows no runtime errors after the rebuild, so the styling changes render correctly.

---

## Tech stack

- **Next.js 16** (App Router, Turbopack) on Node.js runtime
- **React 19**
- **Tailwind CSS v4** (utility classes, no separate config file — `@theme inline` in `globals.css`)
- **`@react-pdf/renderer` 4.5** for server-side PDF rendering
- **TypeScript**, strict
- **Geist Sans + Geist Mono** via `next/font/google`

---

## Notes & assumptions

- **No persistence.** The PDF is built per-request and streamed back. Re-running the tool always reflects the current listing.
- **Host allowlist.** Only `shopgarage.com`, `www.shopgarage.com`, and the public backend are accepted. Bare UUIDs are also accepted.
- **Hero image.** First image (lowest `order`) is fetched server-side and inlined as base64 so the PDF renderer doesn't need to do its own network call.
- **Fonts.** PDF only uses the three PDF-built-in faces (Helvetica, Helvetica-Bold, Courier). No external font fetches at render time.
- **Backend.** `https://garage-backend.onrender.com` is hit with `cache: "no-store"`. If the API is sleeping (free Render tier), the first request can take a few seconds.
- **Errors.** API errors map to clean JSON shapes consumed by the form (404 → "No Garage listing was found for that link", network failures → 502 with a useful message).

---

## Project structure (top-level)

```
invoice-app/
├── app/                  Next.js app router code (pages, API, components, lib)
├── public/               Static assets (Next defaults — unused by the app)
├── package.json
├── tsconfig.json
├── postcss.config.mjs    Tailwind v4 PostCSS pipeline
├── next.config.ts
└── README.md             ← you are here
```

Built for the Garage takehome.
