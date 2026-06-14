"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { TrendSeries } from "@/lib/fs-data"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown, Minus, Layers, Sparkles } from "lucide-react"
import { CHART_COLORS } from "@/lib/colors"

// ==============================================================================
// Types
// ==============================================================================

type Cluster = { label: string; top_techs: string[]; top_roles?: string[]; size?: number; pct: number; avg_salary_mentioned?: number; avg_remote_pct?: number; avg_ai_ml_pct?: number }
type MomentumEntry = { tech: string; slope_pct: number; total_count?: number }
type SimPair = { tech: string; with: string; count: number; jaccard: number }
type TrendPoint = TrendSeries["series"][string][number]

interface InsightsClientProps {
  techTrends: TrendSeries
  languageTrends: TrendSeries
  roleTrends: TrendSeries
  clusters: Cluster[]
  momentum: { rising: MomentumEntry[]; declining: MomentumEntry[]; stable: MomentumEntry[] }
  topPairs: SimPair[]
}

// ==============================================================================
// Normalize trend series (deduplicate same-month refreshes)
// ==============================================================================

function getMonthKey(date: string) { return date.slice(0, 7) }

function normalizeTrendSeries(series: TrendSeries["series"]): TrendSeries["series"] {
  const latestDatesByMonth = new Map<string, string>()
  for (const points of Object.values(series)) {
    for (const point of points) {
      const month = getMonthKey(point.date)
      const existing = latestDatesByMonth.get(month)
      if (!existing || existing <= point.date) latestDatesByMonth.set(month, point.date)
    }
  }
  const latestDates = new Set(latestDatesByMonth.values())
  const normalized: TrendSeries["series"] = {}
  for (const [name, points] of Object.entries(series)) {
    const byDate = new Map(points.map((p) => [p.date, p]))
    normalized[name] = [...latestDates].map((d) => byDate.get(d)).filter((p): p is TrendPoint => Boolean(p)).sort((a, b) => a.date.localeCompare(b.date))
  }
  return normalized
}

function TrendChart({ title, series, topN }: { title: string; series: TrendSeries; topN: number }) {
  const entries = Object.entries(normalizeTrendSeries(series.series))
  const latestDate = entries.flatMap(([, pts]) => pts.map((p) => p.date)).sort().at(-1)
  const ranked = entries.map(([name, pts]) => ({ name, latestCount: latestDate ? (pts.find((p) => p.date === latestDate)?.count ?? 0) : 0 })).sort((a, b) => b.latestCount - a.latestCount).slice(0, topN)
  const topNames = new Set(ranked.map((r) => r.name))
  const dateSet = new Set<string>()
  for (const [name, pts] of entries) { if (topNames.has(name)) for (const p of pts) dateSet.add(p.date) }
  const dates = [...dateSet].sort()
  const chartData = dates.map((date) => { const row: Record<string, string | number> = { date }; for (const [name, pts] of entries) { if (topNames.has(name)) { const pt = pts.find((p) => p.date === date); row[name] = pt?.count ?? 0 } } return row })

  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={chartData}>
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip content={({ payload, label }) => {
              if (!payload?.length) return null
              const rankOrder = ranked.map((r) => r.name)
              const sorted = [...payload].sort((a, b) => rankOrder.indexOf(a.name as string) - rankOrder.indexOf(b.name as string))
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
            }} />
            {[...ranked].reverse().map((item, i) => (
              <Area key={item.name} type="monotone" dataKey={item.name} stackId="1" fill={CHART_COLORS[(ranked.length - 1 - i) % CHART_COLORS.length]} stroke={CHART_COLORS[(ranked.length - 1 - i) % CHART_COLORS.length]} fillOpacity={0.4} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-3 flex flex-wrap gap-3">
          {ranked.map((item, i) => (
            <div key={item.name} className="flex items-center gap-1.5 text-xs">
              <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
              <span className="text-muted-foreground">{item.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ==============================================================================
// Main view
// ==============================================================================

export function InsightsView({
  techTrends, languageTrends, roleTrends,
  clusters, momentum, topPairs,
}: InsightsClientProps) {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          <h1 className="text-3xl font-bold">Insights</h1>
        </div>
        <p className="text-muted-foreground text-sm">Trends and market signals from HN job data</p>
      </div>

      {/* Trend Charts */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
          <TrendingUp className="size-4 text-primary" />Trends
        </h2>
        <div className="space-y-6">
          <TrendChart title="Technology Trends" series={techTrends} topN={8} />
          <TrendChart title="Language Trends" series={languageTrends} topN={8} />
          <TrendChart title="Role Trends" series={roleTrends} topN={8} />
        </div>
      </section>

      {/* Clusters */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
          <Layers className="size-4 text-primary" />Tech Stack Archetypes
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clusters.map((cluster, i) => (
            <Card key={cluster.label} size="sm" className="relative overflow-hidden">
              <div className="absolute left-0 top-0 h-1 w-full" style={{ background: `hsl(${(i * 60 + 35) % 360}, 60%, 50%)` }} />
              <CardHeader className="pt-5">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Layers className="size-4 text-muted-foreground" />{cluster.label}
                </CardTitle>
                <CardDescription>{cluster.pct}% of jobs {cluster.size != null && cluster.size > 0 && <span className="text-muted-foreground">({cluster.size} jobs)</span>}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {cluster.top_techs.map((t) => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                </div>
                {cluster.top_roles && cluster.top_roles.length > 0 && (
                  <div className="text-muted-foreground mt-2 text-xs">Top roles: {cluster.top_roles.join(", ")}</div>
                )}
                <div className="text-muted-foreground mt-3 flex flex-wrap gap-2 text-xs">
                  {cluster.avg_remote_pct != null && <span className="rounded-md bg-muted/50 px-2 py-0.5">🌐 {cluster.avg_remote_pct}% remote</span>}
                  {cluster.avg_salary_mentioned != null && <span className="rounded-md bg-muted/50 px-2 py-0.5">💰 {cluster.avg_salary_mentioned}% salary</span>}
                  {cluster.avg_ai_ml_pct != null && <span className="rounded-md bg-muted/50 px-2 py-0.5">🤖 {cluster.avg_ai_ml_pct}% AI/ML</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Momentum — Rising / Declining */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
          <TrendingUp className="size-4 text-primary" />Momentum
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm"><TrendingUp className="size-4 text-green-600" />Rising</CardTitle>
              <CardDescription>Technologies with positive growth trajectory</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-border/40 divide-y">
                {momentum.rising.slice(0, 8).map((e) => (
                  <div key={e.tech} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2"><ArrowUp className="size-3.5 text-green-600" /><span className="text-sm font-medium">{e.tech}</span></div>
                    <span className="text-green-600 text-xs font-medium tabular-nums">+{e.slope_pct.toFixed(1)}%/mo</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm"><TrendingDown className="size-4 text-red-500" />Declining</CardTitle>
              <CardDescription>Technologies losing share over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-border/40 divide-y">
                {momentum.declining.slice(0, 8).map((e) => (
                  <div key={e.tech} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2"><ArrowDown className="size-3.5 text-red-500" /><span className="text-sm font-medium">{e.tech}</span></div>
                    <span className="text-red-500 text-xs font-medium tabular-nums">{e.slope_pct.toFixed(1)}%/mo</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        {momentum.stable.length > 0 && (
          <Card className="mt-4">
            <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Minus className="size-4 text-muted-foreground" />Stable</CardTitle></CardHeader>
            <CardContent><div className="flex flex-wrap gap-2">{momentum.stable.map((e) => <Badge key={e.tech} variant="outline">{e.tech}</Badge>)}</div></CardContent>
          </Card>
        )}
      </section>

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
          <Layers className="size-4 text-primary" />Top Technology Pairs
        </h2>
        <Card>
          <CardContent className="pt-4">
            {topPairs.slice(0, 12).map((pair) => (
              <div key={`${pair.tech}-${pair.with}`} className="flex items-center justify-between border-border/50 border-b py-2.5 last:border-0">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-xs">{pair.tech}</Badge>
                  <span className="text-muted-foreground text-xs">+</span>
                  <Badge variant="secondary" className="text-xs">{pair.with}</Badge>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-medium tabular-nums">{pair.count} jobs</span>
                  <span className="text-muted-foreground tabular-nums">{(pair.jaccard * 100).toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Methodology */}
      <Card className="border-border/40">
        <CardContent className="py-3">
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            <span><strong>Greedy complete-linkage</strong> Jaccard clustering for tech archetypes</span>
            <span><strong>Linear regression</strong> slope for momentum scoring</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
