import { loadManifest } from "@/lib/fs-data"
import Link from "next/link"

export default async function HistoryPage() {
  const data = await loadManifest()

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold">History</h1>
      <p className="text-muted-foreground mb-8">All pipeline runs</p>
      <div className="space-y-3">
        {data.runs.map((run) => (
          <Link
            key={run.run_id}
            href={`/history/${run.date}`}
            className="border-border block rounded-lg border p-4 transition-colors hover:bg-muted/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{run.thread_title ?? `HN Jobs — ${run.date}`}</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  {run.date} &middot; {run.job_count} jobs
                </p>
              </div>
              <span className="text-muted-foreground text-2xl">&rsaquo;</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
