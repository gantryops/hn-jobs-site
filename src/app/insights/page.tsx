import type { Metadata } from "next"
import { loadTechTrends, loadLanguageTrends, loadRoleTrends, loadTechClusters, loadTechMomentum, loadTechCooccurrence } from "@/lib/fs-data"
import { InsightsView } from "@/components/insights-view"

export const metadata: Metadata = {
  title: "Insights",
  description: "Trends and ML-driven market signals from HN job data.",
}

export default async function InsightsPage() {
  const [
    techTrends, languageTrends, roleTrends,
    rawClusters, rawMomentum, rawCooccurrence,
  ] = await Promise.all([
    loadTechTrends(), loadLanguageTrends(), loadRoleTrends(),
    loadTechClusters(), loadTechMomentum(), loadTechCooccurrence(),
  ])

  const clusters = (rawClusters as { clusters?: unknown[] })?.clusters ?? []
  const momentum = rawMomentum as { rising?: unknown[]; declining?: unknown[]; stable?: unknown[] }
  const topPairs = (rawCooccurrence as { top_pairs?: unknown[] })?.top_pairs ?? []

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <InsightsView
        techTrends={techTrends}
        languageTrends={languageTrends}
        roleTrends={roleTrends}
        clusters={clusters as never}
        momentum={momentum as never}
        topPairs={topPairs as never}
      />
    </main>
  )
}