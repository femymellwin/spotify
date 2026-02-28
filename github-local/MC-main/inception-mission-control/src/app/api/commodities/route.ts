// Server-side only. Proxies Yahoo Finance for commodity prices.
// No API key required — uses the unofficial public chart endpoint.

import { NextResponse } from "next/server";
import type { CommoditiesData, CommodityPrice } from "@/types/commodities";

const COMMODITIES = [
  { symbol: "CL=F", name: "WTI CRUDE OIL", unit: "/bbl" },
  { symbol: "BZ=F", name: "BRENT CRUDE OIL", unit: "/bbl" },
  { symbol: "GC=F", name: "GOLD", unit: "/oz" },
  { symbol: "NG=F", name: "NATURAL GAS", unit: "/MMBtu" },
];

async function fetchYahooQuote(symbol: string): Promise<{
  price: number;
  previousClose: number;
  currency: string;
} | null> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=2d`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      Accept: "application/json",
    },
    next: { revalidate: 300 }, // 5-minute ISR cache
  });

  if (!res.ok) return null;

  const json = await res.json();
  const meta = json?.chart?.result?.[0]?.meta;
  if (!meta) return null;

  const price =
    meta.regularMarketPrice ?? meta.chartPreviousClose ?? null;
  const previousClose =
    meta.previousClose ?? meta.chartPreviousClose ?? price;

  if (price == null) return null;

  return {
    price: Number(price),
    previousClose: Number(previousClose ?? price),
    currency: meta.currency ?? "USD",
  };
}

export async function GET() {
  try {
    const results = await Promise.allSettled(
      COMMODITIES.map((c) => fetchYahooQuote(c.symbol))
    );

    const items: CommodityPrice[] = COMMODITIES.map(
      ({ symbol, name, unit }, i) => {
        const r = results[i];
        if (r.status === "rejected" || !r.value) {
          return { symbol, name, price: 0, previousClose: 0, change: 0, changePercent: 0, currency: "USD", unit };
        }
        const { price, previousClose, currency } = r.value;
        const change = price - previousClose;
        const changePercent = previousClose ? (change / previousClose) * 100 : 0;
        return { symbol, name, price, previousClose, change, changePercent, currency, unit };
      }
    );

    const data: CommoditiesData = {
      items,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Commodities data unavailable" },
      { status: 500 }
    );
  }
}
