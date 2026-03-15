"use client"

import type { ClassifiedJob } from "@/lib/data"

// ==============================================================================
// Cross-tabulation breakdown
//
// Given a set of classified jobs and a dimension to break down by, shows
// a ranked list of counts. E.g. clicking "Python" shows the role breakdown
// of all jobs that mention Python.
// ==============================================================================

interface CrossTabProps {
  title: string
  jobs: ClassifiedJob[]
  dimension: "role" | "technologies"
}

export function CrossTab({ title, jobs, dimension }: CrossTabProps) {
  if (jobs.length === 0) return null

  // Count occurrences by the chosen dimension
  const counts = new Map<string, number>()
  for (const job of jobs) {
    if (dimension === "technologies") {
      for (const tech of job.technologies) {
        counts.set(tech, (counts.get(tech) ?? 0) + 1)
      }
    } else {
      counts.set(job.role, (counts.get(job.role) ?? 0) + 1)
    }
  }

  const sorted = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)

  const max = sorted[0]?.[1] ?? 0

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">
        {title} <span className="text-muted-foreground font-normal">({jobs.length} jobs)</span>
      </p>
      <div className="space-y-1.5">
        {sorted.map(([name, count]) => (
          <div key={name} className="flex items-center gap-2 text-sm">
            <div className="relative h-5 flex-1 overflow-hidden rounded-sm bg-muted">
              <div
                className="absolute inset-y-0 left-0 rounded-sm bg-foreground/10"
                style={{ width: `${(count / max) * 100}%` }}
              />
              <span className="relative z-10 px-2 text-xs leading-5">{name}</span>
            </div>
            <span className="text-muted-foreground w-8 text-right text-xs tabular-nums">{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
