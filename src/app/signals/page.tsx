import type { Metadata } from "next"
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"
import { dataQueries } from "@/lib/data"
import { SignalsView } from "@/components/signals-view"

export const metadata: Metadata = {
  title: "Market Signals",
  description: "ML-driven tech job market signals: clusters, associations, momentum, and co-occurrence patterns from HN job data.",
}

export default async function SignalsPage() {
  const queryClient = new QueryClient()

  await Promise.all([
    queryClient.prefetchQuery(dataQueries.techClusters),
    queryClient.prefetchQuery(dataQueries.techAssociations),
    queryClient.prefetchQuery(dataQueries.techMomentum),
    queryClient.prefetchQuery(dataQueries.techCooccurrence),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <SignalsView />
      </main>
    </HydrationBoundary>
  )
}