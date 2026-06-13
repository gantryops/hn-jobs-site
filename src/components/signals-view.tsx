"use client"

import { useQuery } from "@tanstack/react-query"
import { dataQueries } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowUp,
  ArrowDown,
  Minus,
  TrendingUp,
  TrendingDown,
  Link2,
  Layers,
} from "lucide-react"

// ==============================================================================
// Type definitions for analytics data (loosely typed, validated at runtime)
// ==============================================================================

interface Cluster {
  label: string
  top_techs: string[]
  top_roles?: string[]
  size?: number
  pct: number
  avg_salary_mentioned?: number
  avg_remote_pct?: number
  avg_ai_ml_pct?: number
}

interface AssociationRule {
  antecedent: string[]
  consequent: string[]
  confidence: number
  lift: number
  support?: number
  count?: number
}

interface MomentumEntry {
  tech: string
  slope_pct: number
  total_count?: number
}

// ==============================================================================
// Cluster card
// ==============================================================================

function ClusterCard({ cluster, rank }: { cluster: Cluster; rank: number }) {
  const hue = (rank * 60 + 35) % 360
  return (
    <Card size="sm" className="relative overflow-hidden">
      <div
        className="absolute left-0 top-0 h-1 w-full"
        style={{ background: `hsl(${hue}, 60%, 50%)` }}
      />
      <CardHeader className="pt-5">
        <CardTitle className="flex items-center gap-2">
          <Layers className="size-4 text-muted-foreground" />
          {cluster.label}
        </CardTitle>
        <CardDescription>
          {cluster.pct}% of jobs
          {cluster.size != null && cluster.size > 0 && (
            <span className="text-muted-foreground"> ({cluster.size} jobs)</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1.5">
          {cluster.top_techs.map((tech) => (
            <Badge key={tech} variant="secondary" className="text-xs">
              {tech}
            </Badge>
          ))}
        </div>
        {cluster.top_roles && cluster.top_roles.length > 0 && (
          <div className="text-muted-foreground mt-2 text-xs">
            Top roles: {cluster.top_roles.join(", ")}
          </div>
        )}
        {(cluster.avg_remote_pct != null ||
          cluster.avg_salary_mentioned != null ||
          cluster.avg_ai_ml_pct != null) && (
          <div className="text-muted-foreground mt-3 flex flex-wrap gap-2 text-xs">
            {cluster.avg_remote_pct != null && (
              <span className="rounded-md bg-muted/50 px-2 py-0.5">
                🌐 {cluster.avg_remote_pct}% remote
              </span>
            )}
            {cluster.avg_salary_mentioned != null && (
              <span className="rounded-md bg-muted/50 px-2 py-0.5">
                💰 {cluster.avg_salary_mentioned}% salary
              </span>
            )}
            {cluster.avg_ai_ml_pct != null && (
              <span className="rounded-md bg-muted/50 px-2 py-0.5">
                🤖 {cluster.avg_ai_ml_pct}% AI/ML
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ==============================================================================
// Association rule card
// ==============================================================================

function AssociationCard({ rule }: { rule: AssociationRule }) {
  return (
    <Card size="sm">
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <Link2 className="text-muted-foreground mt-0.5 size-4 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              {rule.antecedent.map((t) => (
                <Badge key={t} variant="default" className="text-xs">
                  {t}
                </Badge>
              ))}
              <span className="text-muted-foreground text-xs">→</span>
              {rule.consequent.map((t) => (
                <Badge key={t} variant="secondary" className="text-xs">
                  {t}
                </Badge>
              ))}
            </div>
            <div className="mt-2 flex gap-3 text-xs">
              <span className="text-foreground font-medium">
                {Math.round(rule.confidence * 100)}% confidence
              </span>
              <span className="text-muted-foreground">{rule.lift}x lift</span>
              {rule.support != null && (
                <span className="text-muted-foreground">
                  {(rule.support * 100).toFixed(1)}% support
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ==============================================================================
// Co-occurrence pair row
// ==============================================================================

function CooccurrenceRow({
  pair,
}: {
  pair: { tech: string; with: string; count: number; jaccard: number }
}) {
  return (
    <div className="flex items-center justify-between border-border/50 border-b py-2.5 last:border-0">
      <div className="flex items-center gap-2">
        <Badge variant="default" className="text-xs">
          {pair.tech}
        </Badge>
        <span className="text-muted-foreground text-xs">+</span>
        <Badge variant="secondary" className="text-xs">
          {pair.with}
        </Badge>
      </div>
      <div className="flex items-center gap-3 text-xs">
        <span className="font-medium tabular-nums">{pair.count} jobs</span>
        <span className="text-muted-foreground tabular-nums">
          Jaccard {(pair.jaccard * 100).toFixed(1)}%
        </span>
      </div>
    </div>
  )
}

// ==============================================================================
// Momentum row
// ==============================================================================

function MomentumRow({ entry, type }: { entry: MomentumEntry; type: "rising" | "declining" }) {
  const Icon = type === "rising" ? ArrowUp : ArrowDown
  const colorClass = type === "rising" ? "text-green-600" : "text-red-500"

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <Icon className={`size-3.5 ${colorClass}`} />
        <span className="text-sm font-medium">{entry.tech}</span>
      </div>
      <div className="flex items-center gap-2 text-xs">
        {entry.total_count != null && (
          <span className="text-muted-foreground tabular-nums">{entry.total_count} total</span>
        )}
        <span className={`${colorClass} font-medium tabular-nums`}>
          {entry.slope_pct > 0 ? "+" : ""}
          {entry.slope_pct.toFixed(1)}%/mo
        </span>
      </div>
    </div>
  )
}

// ==============================================================================
// Main signals view
// ==============================================================================

export function SignalsView() {
  const { data: rawClusters } = useQuery(dataQueries.techClusters)
  const { data: rawAssociations } = useQuery(dataQueries.techAssociations)
  const { data: rawMomentum } = useQuery(dataQueries.techMomentum)
  const { data: rawCooccurrence } = useQuery(dataQueries.techCooccurrence)

  const allClusters =
    (rawClusters as { clusters?: Cluster[] } | undefined)?.clusters ?? []
  const allRules =
    (rawAssociations as { rules?: AssociationRule[] } | undefined)?.rules ?? []
  const momentum = rawMomentum as
    | { rising?: MomentumEntry[]; declining?: MomentumEntry[]; stable?: MomentumEntry[] }
    | undefined
  const topPairs =
    (
      rawCooccurrence as
        | { top_pairs?: Array<{ tech: string; with: string; count: number; jaccard: number }> }
        | undefined
    )?.top_pairs ?? []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-primary size-5" />
          <h2 className="text-2xl font-bold">Market Signals</h2>
        </div>
        <p className="text-muted-foreground text-sm">
          ML-driven insights from {allClusters.length} tech stack archetypes across{" "}
          {topPairs.length > 0 ? `${topPairs.filter((p) => p.count > 0).length}+` : ""}{" "}
          co-occurring technology pairs.
        </p>
      </div>

      <Tabs defaultValue="clusters">
        <TabsList>
          <TabsTrigger value="clusters">Clusters</TabsTrigger>
          <TabsTrigger value="momentum">Momentum</TabsTrigger>
          <TabsTrigger value="associations">Associations</TabsTrigger>
          <TabsTrigger value="cooccurrence">Co-occurrence</TabsTrigger>
        </TabsList>

        {/* Tab: Clusters */}
        <TabsContent value="clusters" className="mt-6">
          {allClusters.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {allClusters.map((cluster, i) => (
                <ClusterCard key={cluster.label} cluster={cluster} rank={i} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-muted-foreground py-8 text-center">
                No cluster data yet. Run the pipeline first.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab: Momentum */}
        <TabsContent value="momentum" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="size-4 text-green-600" />
                  Rising
                </CardTitle>
                <CardDescription>Technologies with positive growth trajectory</CardDescription>
              </CardHeader>
              <CardContent>
                {momentum?.rising && momentum.rising.length > 0 ? (
                  <div className="divide-border/40 divide-y">
                    {momentum.rising.slice(0, 10).map((entry) => (
                      <MomentumRow key={entry.tech} entry={entry} type="rising" />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground py-4 text-center text-sm">No data yet</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="size-4 text-red-500" />
                  Declining
                </CardTitle>
                <CardDescription>Technologies losing share over time</CardDescription>
              </CardHeader>
              <CardContent>
                {momentum?.declining && momentum.declining.length > 0 ? (
                  <div className="divide-border/40 divide-y">
                    {momentum.declining.slice(0, 10).map((entry) => (
                      <MomentumRow key={entry.tech} entry={entry} type="declining" />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground py-4 text-center text-sm">No data yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {momentum?.stable && momentum.stable.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Minus className="text-muted-foreground size-4" />
                  Stable
                </CardTitle>
                <CardDescription>Technologies holding steady</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {momentum.stable.map((entry) => (
                    <Badge key={entry.tech} variant="outline">
                      {entry.tech}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab: Associations */}
        <TabsContent value="associations" className="mt-6">
          {allRules.length > 0 ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {allRules.slice(0, 12).map((rule, i) => (
                  <AssociationCard
                    key={`${rule.antecedent.join(",")}-${rule.consequent.join(",")}-${i}`}
                    rule={rule}
                  />
                ))}
              </div>
              {allRules.length > 12 && (
                <p className="text-muted-foreground mt-3 text-center text-xs">
                  Showing top 12 of {allRules.length} rules. Min support: 3%, min lift: 1.2x.
                </p>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="text-muted-foreground py-8 text-center">
                No association rules yet. Run the pipeline first.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab: Co-occurrence */}
        <TabsContent value="cooccurrence" className="mt-6">
          {topPairs.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Top Technology Pairs</CardTitle>
                <CardDescription>
                  Technologies most frequently mentioned together in job posts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {topPairs.slice(0, 15).map((pair) => (
                  <CooccurrenceRow key={`${pair.tech}-${pair.with}`} pair={pair} />
                ))}
                {topPairs.length > 15 && (
                  <p className="text-muted-foreground mt-3 text-center text-xs">
                    Showing top 15 of {topPairs.length} pairs
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-muted-foreground py-8 text-center">
                No co-occurrence data yet. Run the pipeline first.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Methodology footer */}
      <Card className="border-border/40">
        <CardContent className="py-3">
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            <span>
              <strong>K-means++</strong> clustering on one-hot encoded tech vectors
            </span>
            <span>
              <strong>Apriori</strong> association rule mining (min support 3%)
            </span>
            <span>
              <strong>Linear regression</strong> slope for momentum scoring
            </span>
            <span>
              <strong>Jaccard similarity</strong> for co-occurrence ranking
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
