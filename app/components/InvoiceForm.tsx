"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "success" | "error";
type Mode = "download" | "open";

const EXAMPLE = "https://www.shopgarage.com/listing/<paste-listing-url>";

export default function InvoiceForm() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [pendingMode, setPendingMode] = useState<Mode | null>(null);
  const [completedMode, setCompletedMode] = useState<Mode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastFile, setLastFile] = useState<string | null>(null);

  const generate = async (mode: Mode) => {
    if (!url.trim() || status === "loading") return;
    setStatus("loading");
    setPendingMode(mode);
    setError(null);

    try {
      const res = await fetch("/api/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? `Server returned ${res.status}.`);
        setStatus("error");
        return;
      }

      const disposition = res.headers.get("content-disposition") ?? "";
      const filenameMatch = /filename="([^"]+)"/.exec(disposition);
      const filename = filenameMatch?.[1] ?? "garage-invoice.pdf";

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = objectUrl;
      if (mode === "download") {
        a.download = filename;
      } else {
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      }
      document.body.appendChild(a);
      a.click();
      a.remove();
      // Keep the blob URL alive long enough for the download to start or the
      // new tab to load it, then release it so we don't leak across repeated
      // generations.
      setTimeout(() => URL.revokeObjectURL(objectUrl), mode === "open" ? 60_000 : 1_000);

      setLastFile(filename);
      setCompletedMode(mode);
      setStatus("success");
    } catch (err) {
      setError((err as Error).message ?? "Something went wrong.");
      setStatus("error");
    } finally {
      setPendingMode(null);
    }
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    generate("download");
  };

  const isLoading = status === "loading";
  const disabled = isLoading || !url.trim();

  return (
    <form onSubmit={onSubmit} className="w-full">
      <div className="flex items-center justify-between">
        <label
          htmlFor="listing-url"
          className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500"
        >
          Listing URL
        </label>
        <span className="text-[11px] text-zinc-400">UUID also accepted</span>
      </div>

      <div className="relative mt-2">
        <span
          className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-zinc-400"
          aria-hidden
        >
          <LinkIcon />
        </span>
        <input
          id="listing-url"
          name="listing-url"
          type="text"
          inputMode="url"
          required
          autoComplete="off"
          spellCheck={false}
          placeholder={EXAMPLE}
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (status !== "idle") {
              setStatus("idle");
              setError(null);
            }
          }}
          className="w-full rounded-lg border border-zinc-300 bg-white py-3 pl-10 pr-4 text-base text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-600/15 disabled:opacity-60"
          disabled={isLoading}
        />
      </div>

      <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
        <button
          type="submit"
          disabled={disabled}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-700 px-5 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-red-800 active:bg-red-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading && pendingMode === "download" ? (
            <>
              <Spinner /> Building PDF…
            </>
          ) : (
            <>
              <DownloadIcon /> Download PDF
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => generate("open")}
          disabled={disabled}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-5 py-3 text-base font-semibold text-zinc-900 shadow-sm transition hover:border-zinc-400 hover:bg-zinc-50 active:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading && pendingMode === "open" ? (
            <>
              <Spinner /> Building PDF…
            </>
          ) : (
            <>
              <OpenIcon /> Open in new tab
            </>
          )}
        </button>
      </div>

      <div className="mt-4 min-h-[1.5rem] text-sm">
        {status === "error" && error ? (
          <p className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-800">
            <span aria-hidden className="mt-0.5">
              ⚠
            </span>
            <span>{error}</span>
          </p>
        ) : null}
        {status === "success" && lastFile ? (
          <p className="flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-800">
            <span aria-hidden className="mt-0.5">
              ✓
            </span>
            <span>
              {completedMode === "open" ? "Opened" : "Downloaded"}{" "}
              <span className="break-all font-mono text-[12px]">
                {lastFile}
              </span>
            </span>
          </p>
        ) : null}
        {status === "loading" ? (
          <p className="text-zinc-500">
            Fetching listing from Garage and rendering PDF…
          </p>
        ) : null}
      </div>
    </form>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.25"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

function OpenIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M14 4h6v6" />
      <path d="M20 4 10 14" />
      <path d="M19 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 1 0-7.07-7.07l-1.5 1.5" />
      <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 1 0 7.07 7.07l1.5-1.5" />
    </svg>
  );
}
