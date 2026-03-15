"use client"

import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { PRIMARY_COLOR, CHART_COLORS } from "@/lib/colors"

interface TechChartProps {
  data: Array<{ name: string; count: number; pct: number }>
  onBarClick?: (name: string) => void
  selectedBar?: string | null
}

export function TechChart({ data, onBarClick, selectedBar }: TechChartProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        layout="vertical"
        onClick={(state) => {
          if (state?.activeLabel != null && onBarClick) {
            onBarClick(String(state.activeLabel))
          }
        }}
      >
        <XAxis type="number" />
        <YAxis type="category" dataKey="name" width={"auto"} tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value, _name, props) => {
            const pct = (props.payload as { pct?: number })?.pct
            return [`${value}${pct != null ? ` (${pct}%)` : ""}`, "Count"]
          }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} cursor={onBarClick ? "pointer" : undefined}>
          {data.map((entry) => (
            <Cell
              key={entry.name}
              fill={selectedBar === entry.name ? CHART_COLORS[1] : PRIMARY_COLOR}
              fillOpacity={selectedBar && selectedBar !== entry.name ? 0.4 : 1}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
