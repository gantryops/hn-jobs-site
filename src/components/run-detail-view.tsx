"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { analysisQuery, classifiedQuery, dataQueries } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TechChart } from "@/components/tech-chart"
import { RemoteChart } from "@/components/remote-chart"
import { CrossTab } from "@/components/cross-tab"
import Link from "next/link"

// ==============================================================================
// Shared run detail view — used by both the homepage (isHome) and /history/[date]
// ==============================================================================

interface RunDetailViewProps {
  date: string
  isHome?: boolean
}

export function RunDetailView({ date, isHome }: RunDetailViewProps) {
  const { data } = useQuery(analysisQuery(date))
  const { data: manifest } = useQuery(dataQueries.manifest)
  const { data: classified } = useQuery(classifiedQuery(date))

  // Track which tech/role the user clicked for cross-tab breakdown
  const [selectedTech, setSelectedTech] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null)

  // Find the previous run for MoM deltas
  const runIndex = manifest?.runs.findIndex((r) => r.date === date) ?? -1
  const prevDate = manifest && runIndex >= 0 && runIndex < manifest.runs.length - 1
    ? manifest.runs[runIndex + 1].date
    : null
  const { data: prev } = useQuery({
    ...analysisQuery(prevDate ?? ""),
    enabled: !!prevDate,
  })

  if (!data) return <p>No data available for {date}.</p>

  // Filter classified jobs for cross-tab
  const techJobs = selectedTech && classified
    ? classified.jobs.filter((j) => j.technologies.includes(selectedTech))
    : []
  const roleJobs = selectedRole && classified
    ? classified.jobs.filter((j) => j.role === selectedRole)
    : []
  const levelJobs = selectedLevel && classified
    ? classified.jobs.filter((j) => j.experience_level === selectedLevel)
    : []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        {!isHome && (
          <Link href="/history" className="text-muted-foreground mb-2 inline-block text-sm hover:underline">
            &larr; All runs
          </Link>
        )}
        <h1 className="text-3xl font-bold">
          {isHome ? "HN Jobs Trends" : date}
        </h1>
        {isHome && (
          <p className="text-muted-foreground mt-1">
            Tech job market trends from Hacker News &mdash; updated monthly
          </p>
        )}
        <div className="mt-3 flex items-center gap-3">
          <Badge variant="outline">{data.date}</Badge>
          <span className="text-muted-foreground text-sm">{data.job_count} jobs analyzed</span>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Jobs" value={String(data.job_count)} delta={deltaVal(data.job_count, prev?.job_count)} />
        <StatCard title="Remote %" value={`${data.remote.fully_remote.pct}%`} delta={deltaPp(data.remote.fully_remote.pct, prev?.remote.fully_remote.pct)} />
        <StatCard title="Salary Mentioned" value={`${data.compensation.salary_mentioned_pct}%`} delta={deltaPp(data.compensation.salary_mentioned_pct, prev?.compensation.salary_mentioned_pct)} />
        <StatCard title="AI/ML Mentioned" value={`${data.ai_ml_mentioned_pct}%`} delta={deltaPp(data.ai_ml_mentioned_pct, prev?.ai_ml_mentioned_pct)} />
      </div>

      {/* Tech chart + Roles — side by side */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Technologies</CardTitle>
            <p className="text-muted-foreground text-xs">Click a bar to see role breakdown</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <TechChart
              data={data.technologies.slice(0, 15)}
              onBarClick={(name) => setSelectedTech(selectedTech === name ? null : name)}
              selectedBar={selectedTech}
            />
            {selectedTech && classified && (
              <CrossTab
                title={`${selectedTech} jobs by role`}
                jobs={techJobs}
                dimension="role"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Roles</CardTitle>
            <p className="text-muted-foreground text-xs">Click a role to see tech breakdown</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              {data.roles.slice(0, 10).map((role) => {
                const prevPct = prev?.roles.find((r) => r.name === role.name)?.pct
                const isSelected = selectedRole === role.name
                return (
                  <div
                    key={role.name}
                    className={`flex cursor-pointer items-center justify-between rounded-md px-2 py-1 text-sm transition-colors ${isSelected ? "bg-muted" : "hover:bg-muted/50"}`}
                    onClick={() => setSelectedRole(isSelected ? null : role.name)}
                  >
                    <span>{role.name}</span>
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      {role.count} ({role.pct}%)
                      <DeltaArrow current={role.pct} previous={prevPct} />
                    </span>
                  </div>
                )
              })}
            </div>
            {selectedRole && classified && (
              <CrossTab
                title={`${selectedRole} jobs by technology`}
                jobs={roleJobs}
                dimension="technologies"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Experience levels + Compensation — side by side */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Experience Levels</CardTitle>
            <p className="text-muted-foreground text-xs">Click a level to see breakdown</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {data.experience_levels.map((level) => {
                const isSelected = selectedLevel === level.level
                return (
                  <div
                    key={level.level}
                    className={`cursor-pointer rounded-md p-3 text-center transition-colors ${isSelected ? "bg-muted" : "hover:bg-muted/50"}`}
                    onClick={() => setSelectedLevel(isSelected ? null : level.level)}
                  >
                    <p className="text-2xl font-bold">{level.pct}%</p>
                    <p className="text-muted-foreground text-sm">{level.level}</p>
                    <p className="text-muted-foreground text-xs">{level.count} jobs</p>
                  </div>
                )
              })}
            </div>
            {selectedLevel && classified && (
              <div className="grid gap-4 sm:grid-cols-2">
                <CrossTab
                  title={`${selectedLevel} by technology`}
                  jobs={levelJobs}
                  dimension="technologies"
                />
                <CrossTab
                  title={`${selectedLevel} by role`}
                  jobs={levelJobs}
                  dimension="role"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compensation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Salary mentioned</span>
              <span className="flex items-center gap-1.5 font-medium">
                {data.compensation.salary_mentioned_count} ({data.compensation.salary_mentioned_pct}%)
                <DeltaArrow current={data.compensation.salary_mentioned_pct} previous={prev?.compensation.salary_mentioned_pct} />
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Equity mentioned</span>
              <span className="flex items-center gap-1.5 font-medium">
                {data.compensation.equity_mentioned_count} ({data.compensation.equity_mentioned_pct}%)
                <DeltaArrow current={data.compensation.equity_mentioned_pct} previous={prev?.compensation.equity_mentioned_pct} />
              </span>
            </div>
            <div className="border-t pt-3">
              <p className="text-muted-foreground mb-2 text-xs font-medium uppercase">Salary Ranges</p>
              {data.compensation.ranges.map((range) => (
                <div key={range.band} className="flex items-center justify-between text-sm">
                  <span>{range.band}</span>
                  <span className="text-muted-foreground">{range.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Remote work — full width */}
      <Card>
        <CardHeader>
          <CardTitle>Remote Work</CardTitle>
        </CardHeader>
        <CardContent>
          <RemoteChart data={data.remote} />
        </CardContent>
      </Card>
    </div>
  )
}

// ==============================================================================
// Delta helpers
// ==============================================================================

function DeltaArrow({ current, previous }: { current: number; previous: number | undefined }) {
  if (previous === undefined) return null
  const diff = Math.round((current - previous) * 10) / 10
  if (diff === 0) return null
  return (
    <span className={`text-xs ${diff > 0 ? "text-green-600" : "text-red-500"}`}>
      {diff > 0 ? "\u2191" : "\u2193"}{Math.abs(diff)}pp
    </span>
  )
}

function deltaVal(current: number, previous: number | undefined): string | null {
  if (previous === undefined) return null
  const diff = current - previous
  if (diff === 0) return null
  return `${diff > 0 ? "+" : ""}${diff}`
}

function deltaPp(current: number, previous: number | undefined): string | null {
  if (previous === undefined) return null
  const diff = Math.round((current - previous) * 10) / 10
  if (diff === 0) return null
  return `${diff > 0 ? "+" : ""}${diff}pp`
}

function StatCard({ title, value, delta }: { title: string; value: string; delta: string | null }) {
  const isPositive = delta?.startsWith("+")
  const isNegative = delta?.startsWith("-")
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-muted-foreground text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{value}</span>
          {delta && (
            <span className={`text-xs font-medium ${isPositive ? "text-green-600" : isNegative ? "text-red-500" : "text-muted-foreground"}`}>
              {delta}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
