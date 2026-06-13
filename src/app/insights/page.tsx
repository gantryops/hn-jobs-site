import type { Metadata } from "next"
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"
import { dataQueries } from "@/lib/data"
import { InsightsView } from "@/components/insights-view"

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Trends and ML-driven market signals from HN job data — tech clusters, momentum, associations, and co-occurrence patterns.",
}

export default async function InsightsPage() {
  const queryClient = new QueryClient()

  // Prefetch everything: trend charts + ML signals
  await Promise.all([
    queryClient.prefetchQuery(dataQueries.techTrends),
    queryClient.prefetchQuery(dataQueries.languageTrends),
    queryClient.prefetchQuery(dataQueries.roleTrends),
    queryClient.prefetchQuery(dataQueries.history),
    queryClient.prefetchQuery(dataQueries.techClusters),
    queryClient.prefetchQuery(dataQueries.techAssociations),
    queryClient.prefetchQuery(dataQueries.techMomentum),
    queryClient.prefetchQuery(dataQueries.techCooccurrence),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <InsightsView />
      </main>
    </HydrationBoundary>
  )
}
