import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import type { GarageListing } from "./garage";
import {
  formatPrice,
  formatDate,
  formatInvoiceNumber,
  formatDeliveryMethod,
  formatLocation,
} from "./format";

// Allow long hyphenated tokens (UUIDs, slugs) to wrap at hyphens instead of
// overflowing their container. react-pdf only breaks on whitespace by default.
Font.registerHyphenationCallback((word) => {
  if (word.length <= 16 || !word.includes("-")) return [word];
  const segments = word.split("-");
  return segments.map((seg, i) =>
    i < segments.length - 1 ? `${seg}-` : seg,
  );
});

const COLORS = {
  ink: "#0F172A",
  body: "#1F2937",
  muted: "#64748B",
  faint: "#94A3B8",
  rule: "#E2E8F0",
  panel: "#F8FAFC",
  accent: "#B91C1C",
  accentInk: "#7F1D1D",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 48,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.body,
    lineHeight: 1.5,
  },
  // ── Header ────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandMark: {
    width: 24,
    height: 24,
    backgroundColor: COLORS.accent,
    borderRadius: 4,
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    paddingTop: 4,
  },
  brandName: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: COLORS.ink,
    letterSpacing: 1.2,
  },
  brandSub: { fontSize: 8, color: COLORS.muted, letterSpacing: 1 },
  invoiceMeta: { alignItems: "flex-end" },
  invoiceLabel: {
    fontSize: 9,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  invoiceNo: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: COLORS.ink,
    marginTop: 2,
  },
  invoiceDate: { fontSize: 10, color: COLORS.muted, marginTop: 4 },

  // ── Title block ────────────────────────────────────────────
  titleBlock: {
    borderTopWidth: 2,
    borderTopColor: COLORS.accent,
    paddingTop: 18,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.rule,
  },
  eyebrow: {
    fontSize: 9,
    color: COLORS.accent,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: COLORS.ink,
    marginTop: 6,
    lineHeight: 1.25,
  },
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 14,
  },
  pill: {
    fontSize: 9,
    color: COLORS.accentInk,
    backgroundColor: "#FEE2E2",
    paddingTop: 4,
    paddingBottom: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.6,
    lineHeight: 1,
  },
  subtitleText: { fontSize: 10, color: COLORS.muted, lineHeight: 1 },

  // ── Image ──────────────────────────────────────────────────
  hero: {
    marginTop: 18,
    width: "100%",
    height: 220,
    objectFit: "cover",
    borderRadius: 6,
  },

  // ── Three-column meta ──────────────────────────────────────
  metaGrid: {
    flexDirection: "row",
    marginTop: 24,
    gap: 18,
  },
  metaCol: {
    flex: 1,
    backgroundColor: COLORS.panel,
    padding: 14,
    borderRadius: 6,
  },
  metaHeading: {
    fontSize: 9,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 1.4,
    marginBottom: 6,
    fontFamily: "Helvetica-Bold",
  },
  metaValue: {
    fontSize: 11,
    color: COLORS.ink,
    fontFamily: "Helvetica-Bold",
  },
  metaSub: { fontSize: 9, color: COLORS.muted, marginTop: 2 },
  metaIdSub: {
    fontSize: 7.5,
    color: COLORS.faint,
    marginTop: 4,
    fontFamily: "Courier",
    lineHeight: 1.3,
  },

  // ── Section ────────────────────────────────────────────────
  section: { marginTop: 24 },
  sectionHeading: {
    fontSize: 11,
    color: COLORS.ink,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.4,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.rule,
    marginBottom: 10,
  },
  description: { fontSize: 10.5, color: COLORS.body, lineHeight: 1.55 },

  // ── Specs table ────────────────────────────────────────────
  specRow: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.rule,
  },
  specLabel: { width: "45%", fontSize: 10, color: COLORS.muted },
  specValue: {
    width: "55%",
    fontSize: 10,
    color: COLORS.ink,
    fontFamily: "Helvetica-Bold",
  },

  // ── Total line ─────────────────────────────────────────────
  totalRow: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.ink,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 6,
  },
  totalLabel: {
    color: "#FFFFFF",
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
    lineHeight: 1,
  },
  totalValue: {
    color: "#FFFFFF",
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    lineHeight: 1,
  },

  // ── Footer ─────────────────────────────────────────────────
  footer: {
    position: "absolute",
    bottom: 28,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.rule,
    fontSize: 8,
    color: COLORS.faint,
  },
});

function dimensionLabel(
  inches?: number | null,
  unit = "in",
): string | undefined {
  if (inches == null || Number.isNaN(inches)) return undefined;
  const ft = Math.floor(inches / 12);
  const rem = inches % 12;
  if (ft >= 1) {
    return rem === 0 ? `${ft} ft` : `${ft} ft ${rem} ${unit}`;
  }
  return `${inches} ${unit}`;
}

function buildSpecRows(listing: GarageListing): Array<[string, string]> {
  const rows: Array<[string, string]> = [];
  if (listing.itemAge) rows.push(["Year", String(listing.itemAge)]);
  if (listing.itemBrand) rows.push(["Manufacturer", listing.itemBrand]);
  if (listing.category?.name) rows.push(["Category", listing.category.name]);
  const length = dimensionLabel(listing.itemLength);
  if (length) rows.push(["Length", length]);
  const height = dimensionLabel(listing.itemHeight);
  if (height) rows.push(["Height", height]);
  const width = dimensionLabel(listing.itemWidth);
  if (width) rows.push(["Width", width]);
  if (listing.itemWeight) rows.push(["Weight", `${listing.itemWeight} lb`]);
  if (listing.vin) rows.push(["VIN", listing.vin]);

  for (const attr of listing.ListingAttribute ?? []) {
    const name = attr.categoryAttribute?.name;
    const unit = attr.categoryAttribute?.unit;
    if (!name || !attr.value) continue;
    if (attr.value === "true" || attr.value === "false") {
      if (attr.value === "true") rows.push([name, "Yes"]);
      continue;
    }
    rows.push([name, unit ? `${attr.value} ${unit}` : attr.value]);
  }
  return rows;
}

export type InvoicePdfProps = {
  listing: GarageListing;
  generatedAt: Date;
  sourceUrl?: string;
  heroImage?: { mimeType: string; base64: string } | null;
};

export function InvoicePdf({
  listing,
  generatedAt,
  sourceUrl,
  heroImage,
}: InvoicePdfProps) {
  const invoiceNo = formatInvoiceNumber(listing.secondaryId, listing.id);
  const dateLabel = formatDate(generatedAt);
  const price = formatPrice(listing.sellingPrice);
  const location = formatLocation(listing.address);
  const delivery = formatDeliveryMethod(listing.deliveryMethod);
  const specRows = buildSpecRows(listing);
  const heroSrc = heroImage
    ? `data:${heroImage.mimeType};base64,${heroImage.base64}`
    : undefined;

  return (
    <Document
      title={`Invoice — ${listing.listingTitle}`}
      author="Garage"
      subject="Fire apparatus pre-purchase invoice"
    >
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header} fixed>
          <View style={styles.brandRow}>
            <Text style={styles.brandMark}>G</Text>
            <View>
              <Text style={styles.brandName}>GARAGE</Text>
              <Text style={styles.brandSub}>EMERGENCY VEHICLE MARKETPLACE</Text>
            </View>
          </View>
          <View style={styles.invoiceMeta}>
            <Text style={styles.invoiceLabel}>Pre-Purchase Invoice</Text>
            <Text style={styles.invoiceNo}>{invoiceNo}</Text>
            <Text style={styles.invoiceDate}>Issued {dateLabel}</Text>
          </View>
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.eyebrow}>Apparatus for board approval</Text>
          <Text style={styles.title}>{listing.listingTitle}</Text>
          <View style={styles.subtitleRow}>
            <Text style={styles.pill}>{listing.status ?? "ACTIVE"}</Text>
            {location ? (
              <Text style={styles.subtitleText}>Located in {location}</Text>
            ) : null}
            {listing.category?.name ? (
              <Text style={styles.subtitleText}>{listing.category.name}</Text>
            ) : null}
          </View>
        </View>

        {heroSrc ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <Image src={heroSrc} style={styles.hero} />
        ) : null}

        <View style={styles.metaGrid}>
          <View style={styles.metaCol}>
            <Text style={styles.metaHeading}>Listing ID</Text>
            <Text style={styles.metaValue}>
              {listing.secondaryId ? `#${listing.secondaryId}` : invoiceNo}
            </Text>
            <Text style={styles.metaIdSub}>{listing.id}</Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaHeading}>Asking Price</Text>
            <Text style={styles.metaValue}>{price}</Text>
            <Text style={styles.metaSub}>
              {listing.isAuction ? "Live auction" : "Direct sale"}
            </Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaHeading}>Delivery</Text>
            <Text style={styles.metaValue}>
              {delivery ?? "Coordinate with seller"}
            </Text>
            <Text style={styles.metaSub}>
              {listing.isPickupAvailable
                ? "Buyer pickup available"
                : "Seller-arranged shipping"}
            </Text>
          </View>
        </View>

        {listing.listingDescription ? (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Apparatus Description</Text>
            <Text style={styles.description}>
              {listing.listingDescription.trim()}
            </Text>
          </View>
        ) : null}

        {specRows.length > 0 ? (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionHeading}>Specifications</Text>
            {specRows.map(([k, v]) => (
              <View key={k} style={styles.specRow}>
                <Text style={styles.specLabel}>{k}</Text>
                <Text style={styles.specValue}>{v}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.totalRow} wrap={false}>
          <Text style={styles.totalLabel}>Quoted Total (USD)</Text>
          <Text style={styles.totalValue}>{price}</Text>
        </View>

        <View style={styles.footer} fixed>
          <Text>
            {sourceUrl
              ? `Prepared from ${sourceUrl}`
              : "Prepared from shopgarage.com"}
          </Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
