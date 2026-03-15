"use client"

import { CHART_COLORS } from "@/lib/colors"

interface RemoteData {
  fully_remote: { count: number; pct: number }
  hybrid: { count: number; pct: number }
  onsite_only: { count: number; pct: number }
  not_mentioned: { count: number; pct: number }
}

const SEGMENTS = [
  { key: "fully_remote", label: "Fully Remote", color: CHART_COLORS[0] },
  { key: "hybrid", label: "Hybrid", color: CHART_COLORS[1] },
  { key: "onsite_only", label: "Onsite Only", color: CHART_COLORS[2] },
  { key: "not_mentioned", label: "Not Mentioned", color: CHART_COLORS[3] },
] as const

export function RemoteChart({ data }: { data: RemoteData }) {
  return (
    <div className="space-y-5">
      {/* Stacked bar */}
      <div className="flex h-8 overflow-hidden rounded-md">
        {SEGMENTS.map(({ key, label, color }) => {
          const segment = data[key]
          if (segment.pct === 0) return null
          return (
            <div
              key={key}
              className="flex items-center justify-center text-xs font-medium text-white"
              style={{ width: `${segment.pct}%`, backgroundColor: color }}
              title={`${label}: ${segment.count} (${segment.pct}%)`}
            >
              {segment.pct >= 10 ? `${segment.pct}%` : ""}
            </div>
          )
        })}
      </div>

      {/* Legend with counts */}
      <div className="grid grid-cols-2 gap-3">
        {SEGMENTS.map(({ key, label, color }) => {
          const segment = data[key]
          return (
            <div key={key} className="flex items-center gap-2 text-sm">
              <div className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: color }} />
              <span className="text-muted-foreground">{label}</span>
              <span className="ml-auto font-medium">
                {segment.count}
                <span className="text-muted-foreground ml-1 text-xs">
                  ({segment.pct}%)
                </span>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
