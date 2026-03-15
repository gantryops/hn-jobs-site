"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const links = [
  { href: "/", label: "Latest" },
  { href: "/trends", label: "Trends" },
  { href: "/history", label: "History" },
] as const

export function Nav() {
  const pathname = usePathname()

  return (
    <header className="border-border/40 border-b">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight">
          HN Jobs
        </Link>
        <div className="flex items-center gap-1">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors",
                (href === "/" ? pathname === href : pathname.startsWith(href))
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </Link>
          ))}
          <a
            href="/feed.xml"
            className="text-muted-foreground hover:text-foreground ml-2 rounded-md px-2 py-1.5 text-sm transition-colors"
            title="RSS Feed"
          >
            RSS
          </a>
        </div>
      </nav>
    </header>
  )
}
