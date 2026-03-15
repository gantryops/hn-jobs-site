import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"
import { dataQueries } from "@/lib/data"
import { HistoryView } from "@/components/history-view"

export default async function HistoryPage() {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery(dataQueries.manifest)

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-2 text-3xl font-bold">History</h1>
        <p className="text-muted-foreground mb-8">All pipeline runs</p>
        <HistoryView />
      </main>
    </HydrationBoundary>
  )
}
