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
