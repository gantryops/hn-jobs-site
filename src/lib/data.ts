// ==============================================================================
// Data fetching helpers
//
// DATA_BASE_URL is the server-side env var (used at build time).
// NEXT_PUBLIC_DATA_BASE_URL is the same value exposed to the client for
// runtime refetching via the Refresh button.
// ==============================================================================

import type { Analysis, ClassifiedData, History, Manifest, TrendSeries } from "../../hn-jobs-data/scripts/schemas"

export type { Analysis, ClassifiedData, History, Manifest, TrendSeries }
export type { ClassifiedJob } from "../../hn-jobs-data/scripts/schemas"

const DATA_BASE =
  process.env.DATA_BASE_URL || process.env.NEXT_PUBLIC_DATA_BASE_URL || ""

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${DATA_BASE}${path}`)
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`)
  return res.json() as Promise<T>
}

export function analysisQuery(date: string) {
  return {
    queryKey: ["analysis", date] as const,
    queryFn: () => fetchJSON<Analysis>(`/runs/${date}/analysis.json`),
  }
}

export function classifiedQuery(date: string) {
  return {
    queryKey: ["classified", date] as const,
    queryFn: () => fetchJSON<ClassifiedData>(`/runs/${date}/classified.json`),
  }
}

export const dataQueries = {
  manifest: {
    queryKey: ["manifest"] as const,
    queryFn: () => fetchJSON<Manifest>("/indexes/manifest.json"),
  },
  history: {
    queryKey: ["history"] as const,
    queryFn: () => fetchJSON<History>("/indexes/history.json"),
  },
  techTrends: {
    queryKey: ["tech-trends"] as const,
    queryFn: () => fetchJSON<TrendSeries>("/indexes/tech-trends.json"),
  },
  roleTrends: {
    queryKey: ["role-trends"] as const,
    queryFn: () => fetchJSON<TrendSeries>("/indexes/role-trends.json"),
  },
} as const
