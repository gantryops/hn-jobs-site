import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"
import { analysisQuery, classifiedQuery, dataQueries } from "@/lib/data"
import type { Manifest } from "@/lib/data"
import { RunDetailView } from "@/components/run-detail-view"

export default async function Page() {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery(dataQueries.manifest)

  const manifest = queryClient.getQueryData<Manifest>(dataQueries.manifest.queryKey)
  const latestDate = manifest?.runs[0]?.date

  if (latestDate) {
    await Promise.all([
      queryClient.prefetchQuery(analysisQuery(latestDate)),
      queryClient.prefetchQuery(classifiedQuery(latestDate)),
      manifest && manifest.runs.length >= 2
        ? queryClient.prefetchQuery(analysisQuery(manifest.runs[1].date))
        : Promise.resolve(),
    ])
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="mx-auto max-w-6xl px-4 py-8">
        {latestDate ? (
          <RunDetailView date={latestDate} isHome />
        ) : (
          <p>No data available yet.</p>
        )}
      </main>
    </HydrationBoundary>
  )
}
