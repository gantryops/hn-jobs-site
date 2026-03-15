// Hardcoded chart colors — Recharts renders SVG which can't resolve
// CSS custom properties. These match the Gantry palette.

export const CHART_COLORS = [
  "#A68B3C", // gold (primary accent)
  "#4f6df5", // blue
  "#22a860", // green
  "#d43f8c", // pink
  "#2aafbf", // teal
  "#8844dd", // purple
  "#e54c2a", // red-orange
  "#3390dd", // sky blue
  "#c7a620", // dark gold
  "#7c3aed", // violet
] as const

export const PRIMARY_COLOR = CHART_COLORS[0]
