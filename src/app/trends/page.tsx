import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"
import { dataQueries } from "@/lib/data"
import { TrendsView } from "@/components/trends-view"

export default async function TrendsPage() {
  const queryClient = new QueryClient()

  await Promise.all([
    queryClient.prefetchQuery(dataQueries.techTrends),
    queryClient.prefetchQuery(dataQueries.roleTrends),
    queryClient.prefetchQuery(dataQueries.history),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-2 text-3xl font-bold">Trends</h1>
        <p className="text-muted-foreground mb-8">Technology and role trends over time</p>
        <TrendsView />
      </main>
    </HydrationBoundary>
  )
}
