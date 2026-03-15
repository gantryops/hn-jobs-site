"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { dataQueries, type TrendSeries } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Area,
  AreaChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { CHART_COLORS } from "@/lib/colors"

const VALID_TABS = new Set(["tech", "roles", "overview"])
const DEFAULT_TAB = "tech"

function getTabFromHash(): string {
  if (typeof window === "undefined") return DEFAULT_TAB
  const hash = window.location.hash.slice(1)
  return VALID_TABS.has(hash) ? hash : DEFAULT_TAB
}

export function TrendsView() {
  const [tab, setTab] = useState(getTabFromHash)
  const { data: techTrends } = useQuery(dataQueries.techTrends)
  const { data: roleTrends } = useQuery(dataQueries.roleTrends)
  const { data: history } = useQuery(dataQueries.history)

  // Sync tab state when the URL hash changes (e.g. back/forward navigation)
  useEffect(() => {
    const onHashChange = () => setTab(getTabFromHash())
    window.addEventListener("hashchange", onHashChange)
    return () => window.removeEventListener("hashchange", onHashChange)
  }, [])

  function onTabChange(value: string) {
    setTab(value)
    window.history.replaceState(null, "", `#${value}`)
  }

  return (
    <div className="space-y-8">
      <Tabs value={tab} onValueChange={onTabChange}>
        <TabsList>
          <TabsTrigger value="tech">Technologies</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="tech" className="mt-6">
          {techTrends && <TrendChart title="Technology Trends" series={techTrends} topN={10} />}
        </TabsContent>

        <TabsContent value="roles" className="mt-6">
          {roleTrends && <TrendChart title="Role Trends" series={roleTrends} topN={10} />}
        </TabsContent>

        <TabsContent value="overview" className="mt-6">
          {history && (
            <Card>
              <CardHeader>
                <CardTitle>Monthly Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={history.runs}>
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="count" orientation="left" />
                    <YAxis yAxisId="pct" orientation="right" domain={[0, 100]} unit="%" />
                    <Tooltip />
                    <Line
                      yAxisId="count"
                      type="monotone"
                      dataKey="job_count"
                      name="Total Jobs"
                      stroke={CHART_COLORS[0]}
                      strokeWidth={2}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      label={(props: any) => <EndLabel {...props} text="Jobs" color={CHART_COLORS[0]} total={history.runs.length} />}
                    />
                    <Line
                      yAxisId="pct"
                      type="monotone"
                      dataKey="remote_pct"
                      name="Remote %"
                      stroke={CHART_COLORS[1]}
                      strokeWidth={2}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      label={(props: any) => <EndLabel {...props} text="Remote %" color={CHART_COLORS[1]} total={history.runs.length} />}
                    />
                    <Line
                      yAxisId="pct"
                      type="monotone"
                      dataKey="ai_ml_mentioned_pct"
                      name="AI/ML %"
                      stroke={CHART_COLORS[2]}
                      strokeWidth={2}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      label={(props: any) => <EndLabel {...props} text="AI/ML %" color={CHART_COLORS[2]} total={history.runs.length} />}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ==============================================================================
// End label — renders text at the last data point of a line
// ==============================================================================

function EndLabel({ x, y, index, text, color, total }: { x: number; y: number; index: number; text: string; color: string; total: number }) {
  if (index !== total - 1) return <g />
  return (
    <text x={x + 8} y={y} dy={4} fill={color} fontSize={11} fontWeight={500}>
      {text}
    </text>
  )
}

// ==============================================================================
// Stacked area trend chart — shows composition over time
// ==============================================================================

function TrendChart({
  title,
  series,
  topN,
}: {
  title: string
  series: TrendSeries
  topN: number
}) {
  const entries = Object.entries(series.series)
  const ranked = entries
    .map(([name, points]) => ({
      name,
      latestCount: points.at(-1)?.count ?? 0,
    }))
    .sort((a, b) => b.latestCount - a.latestCount)
    .slice(0, topN)

  const topNames = new Set(ranked.map((r) => r.name))

  const dateSet = new Set<string>()
  for (const [name, points] of entries) {
    if (!topNames.has(name)) continue
    for (const p of points) dateSet.add(p.date)
  }

  const dates = [...dateSet].sort()
  const chartData = dates.map((date) => {
    const row: Record<string, string | number> = { date }
    for (const [name, points] of entries) {
      if (!topNames.has(name)) continue
      const point = points.find((p) => p.date === date)
      row[name] = point?.count ?? 0
    }
    return row
  })

  // Reverse ranked so the largest area is at the bottom (visually stable)
  const orderedItems = [...ranked].reverse()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chartData}>
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip
              content={({ payload, label }) => {
                if (!payload?.length) return null
                // Sort by value descending to match visual stacking
                const sorted = [...payload].sort((a, b) => (b.value as number) - (a.value as number))
                return (
                  <div className="rounded-md border border-border bg-card p-3 shadow-md">
                    <p className="mb-2 text-xs font-medium">{label}</p>
                    {sorted.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-2 text-xs">
                        <div className="h-2 w-2 rounded-sm" style={{ backgroundColor: entry.color as string }} />
                        <span className="text-muted-foreground">{entry.name}</span>
                        <span className="ml-auto font-medium">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                )
              }}
            />
            {orderedItems.map((item, i) => {
              const colorIdx = ranked.length - 1 - i
              return (
                <Area
                  key={item.name}
                  type="monotone"
                  dataKey={item.name}
                  stackId="1"
                  fill={CHART_COLORS[colorIdx % CHART_COLORS.length]}
                  stroke={CHART_COLORS[colorIdx % CHART_COLORS.length]}
                  fillOpacity={0.4}
                />
              )
            })}
          </AreaChart>
        </ResponsiveContainer>
        {/* Legend below the chart — cleaner than inline for stacked areas */}
        <div className="mt-4 flex flex-wrap gap-3">
          {ranked.map((item, i) => (
            <div key={item.name} className="flex items-center gap-1.5 text-xs">
              <div
                className="h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
              />
              <span className="text-muted-foreground">{item.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
