"use client"

import { TrendsView } from "@/components/trends-view"
import { SignalsView } from "@/components/signals-view"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Sparkles } from "lucide-react"

export function InsightsView() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          <h1 className="text-3xl font-bold">Insights</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Trends and ML-driven signals from HN job market data
        </p>
      </div>

      <Tabs defaultValue="trends">
        <TabsList>
          <TabsTrigger value="trends">
            <TrendingUp className="size-3.5 mr-1.5" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="signals">
            <Sparkles className="size-3.5 mr-1.5" />
            Signals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="mt-6">
          <TrendsView />
        </TabsContent>

        <TabsContent value="signals" className="mt-6">
          <SignalsView />
        </TabsContent>
      </Tabs>
    </div>
  )
}
