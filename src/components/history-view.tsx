"use client"

import { useQuery } from "@tanstack/react-query"
import { dataQueries } from "@/lib/data"
import Link from "next/link"

export function HistoryView() {
  const { data } = useQuery(dataQueries.manifest)

  if (!data) return <p>No data available.</p>

  return (
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
  )
}
