"use client"

import { useSyncExternalStore } from "react"
import { useTheme } from "next-themes"

const subscribe = () => () => {}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )

  return (
    <select
      aria-label="Color theme"
      className="border-input bg-background text-foreground ml-2 rounded-md border px-2 py-1.5 text-sm"
      disabled={!mounted}
      value={mounted ? theme : "system"}
      onChange={(event) => setTheme(event.target.value)}
    >
      <option value="system">System</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  )
}
