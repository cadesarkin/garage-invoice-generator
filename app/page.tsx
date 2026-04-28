import InvoiceForm from "./components/InvoiceForm";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <Header />

      <main className="flex flex-1 flex-col">
        <Hero />
        <TrustStrip />
        <Steps />
        <FAQ />
      </main>
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="/" className="flex items-center gap-2.5">
          <Wordmark />
        </a>
        <a
          href="https://www.shopgarage.com"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-zinc-900 bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          Visit Garage
          <span aria-hidden>→</span>
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="border-b border-zinc-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-16 sm:pt-24 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div className="flex flex-col justify-center">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-red-700">
            <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
            Pre-Purchase Invoice Tool
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl">
            Board-ready invoices for any{" "}
            <span className="text-red-700">Garage</span> listing.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-600">
            Fire departments need a printed invoice before the board signs off
            on a new apparatus. Paste any listing from{" "}
            <a
              href="https://www.shopgarage.com"
              className="font-medium text-zinc-900 underline decoration-red-500 decoration-2 underline-offset-4 hover:text-red-700"
            >
              shopgarage.com
            </a>{" "}
            and download a polished PDF in seconds.
          </p>

          <div className="mt-10 rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)] sm:p-7">
            <InvoiceForm />
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              Tip: any URL containing a listing UUID works — the full slug page
              or just{" "}
              <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[11px] text-zinc-700">
                /listing/&lt;uuid&gt;
              </span>
              .
            </p>
          </div>
        </div>

        <SamplePreview />
      </div>
    </section>
  );
}

function SamplePreview() {
  return (
    <div className="relative hidden lg:block">
      <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-red-50 via-white to-zinc-100" />
      <div className="relative mx-auto flex h-full max-w-md items-center justify-center p-8">
        <div className="w-full rotate-1 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl shadow-zinc-900/10">
          <div className="flex items-center justify-between border-b-2 border-red-700 px-6 py-4">
            <div className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded bg-red-700 text-[10px] font-bold text-white">
                G
              </span>
              <span className="text-xs font-bold tracking-[0.2em] text-zinc-900">
                GARAGE
              </span>
            </div>
            <div className="text-right">
              <div className="text-[8px] uppercase tracking-widest text-zinc-500">
                Invoice
              </div>
              <div className="font-mono text-sm font-bold text-zinc-900">
                INV-1042
              </div>
            </div>
          </div>
          <div className="px-6 py-5">
            <div className="text-[9px] font-bold uppercase tracking-widest text-red-700">
              Apparatus for board approval
            </div>
            <div className="mt-1.5 text-base font-bold leading-tight text-zinc-950">
              2019 Pierce Velocity 100' Aerial Quint
            </div>
            <div className="mt-3 h-28 rounded bg-gradient-to-br from-zinc-200 to-zinc-300" />
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                ["Listing ID", "#1042"],
                ["Asking", "$465K"],
                ["Delivery", "Drive-away"],
              ].map(([k, v]) => (
                <div key={k} className="rounded bg-zinc-50 p-2">
                  <div className="text-[7px] uppercase tracking-wider text-zinc-500">
                    {k}
                  </div>
                  <div className="mt-0.5 text-[10px] font-bold text-zinc-900">
                    {v}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-1.5">
              <div className="h-1.5 w-full rounded bg-zinc-100" />
              <div className="h-1.5 w-5/6 rounded bg-zinc-100" />
              <div className="h-1.5 w-4/6 rounded bg-zinc-100" />
            </div>
            <div className="mt-4 flex items-center justify-between rounded bg-zinc-950 px-3 py-2.5">
              <span className="text-[9px] font-bold uppercase tracking-widest text-white">
                Quoted Total
              </span>
              <span className="text-base font-bold text-white">$465,000</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrustStrip() {
  const items = [
    "Pierce",
    "E-One",
    "Spartan",
    "Ferrara",
    "KME",
    "Toyne",
    "HME",
    "Crimson",
  ];
  return (
    <section className="border-b border-zinc-200 bg-zinc-50/60">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
          Works with every listing on Garage — every manufacturer, every spec
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-zinc-400">
          {items.map((m) => (
            <span
              key={m}
              className="text-base font-bold tracking-wide text-zinc-400/80 transition hover:text-zinc-600"
            >
              {m}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Steps() {
  const items = [
    {
      n: "01",
      title: "Paste a listing link",
      copy: "Drop in any /listing/ URL from shopgarage.com. We pull the listing by its UUID — no login required.",
    },
    {
      n: "02",
      title: "We pull the truck details",
      copy: "Title, description, asking price, specs, hero image, and seller location come from Garage's public API.",
    },
    {
      n: "03",
      title: "Download a polished PDF",
      copy: "Hand it to your board. Re-run the tool any time the listing changes — it's always live.",
    },
  ];
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-700">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
            From link to board-ready invoice
            <br className="hidden sm:block" /> in under 30 seconds.
          </h2>
        </div>
        <ol className="mt-14 grid gap-6 md:grid-cols-3">
          {items.map((it) => (
            <li
              key={it.n}
              className="group relative flex flex-col rounded-2xl border border-zinc-200 bg-white p-7 transition hover:border-zinc-300 hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)]"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-red-50 font-mono text-sm font-bold text-red-700">
                  {it.n}
                </span>
                <span className="h-px flex-1 bg-zinc-200" />
              </div>
              <h3 className="mt-5 text-lg font-bold tracking-tight text-zinc-950">
                {it.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                {it.copy}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function FAQ() {
  const faqs = [
    {
      q: "Where does the listing data come from?",
      a: "Directly from Garage's public listings API. Whatever's currently live on shopgarage.com is what lands in your PDF — title, description, asking price, hero image, specs, and seller location.",
    },
    {
      q: "Is the invoice an official quote?",
      a: "No — it's a board-ready summary built for procurement workflows. It captures the listing as it stands today; pricing and final terms are negotiated directly with the seller.",
    },
    {
      q: "What if a listing changes?",
      a: "Re-run the tool with the same URL. We always fetch the listing fresh, so the new PDF reflects the latest title, price, and details.",
    },
  ];
  return (
    <section className="border-t border-zinc-200 bg-zinc-50/60">
      <div className="mx-auto max-w-3xl px-6 py-20">
        <h2 className="text-center text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
          Common questions
        </h2>
        <dl className="mt-10 space-y-4">
          {faqs.map((f) => (
            <div
              key={f.q}
              className="rounded-xl border border-zinc-200 bg-white p-6"
            >
              <dt className="font-semibold text-zinc-950">{f.q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-zinc-600">
                {f.a}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function Wordmark() {
  return (
    <span className="flex items-center gap-2.5">
      <span
        className="grid h-7 w-7 place-items-center rounded-md bg-zinc-950 text-[11px] font-black text-white"
        aria-hidden
      >
        G
      </span>
      <span className="flex items-baseline gap-1.5">
        <span className="text-lg font-black tracking-tight text-zinc-950">
          Garage
        </span>
        <span className="hidden text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500 sm:inline">
          Invoice Studio
        </span>
      </span>
    </span>
  );
}

