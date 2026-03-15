import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"
import { analysisQuery, classifiedQuery, dataQueries } from "@/lib/data"
import { RunDetailView } from "@/components/run-detail-view"

// Static export needs to know all possible [date] values at build time
export async function generateStaticParams() {
  try {
    const manifest = await dataQueries.manifest.queryFn()
    return manifest.runs.map((run) => ({ date: run.date }))
  } catch {
    return []
  }
}

export default async function RunPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params
  const queryClient = new QueryClient()

  await Promise.all([
    queryClient.prefetchQuery(analysisQuery(date)),
    queryClient.prefetchQuery(classifiedQuery(date)),
    queryClient.prefetchQuery(dataQueries.manifest),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <RunDetailView date={date} />
      </main>
    </HydrationBoundary>
  )
}
