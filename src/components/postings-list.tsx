"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ExternalLink, Search } from "lucide-react"
import { classifiedQuery, rawQuery, type ClassifiedJob, type RawJob } from "@/lib/data"
import { Badge } from "@/components/ui/badge"

// ==============================================================================
// Job postings — joins raw.json (the listings) with classified.json (the tags)
// and renders a searchable, faceted list. The raw postings are published to
// Pages but were never surfaced in the UI before this.
// ==============================================================================

const REMOTE_LABELS: Record<string, string> = {
  fully_remote: "Remote",
  hybrid: "Hybrid",
  onsite_only: "Onsite",
  not_mentioned: "Unspecified",
}

type Posting = {
  raw: RawJob
  tags: ClassifiedJob | undefined
  company: string
  body: string
  hnUrl: string
}

// ── HN text → plain text ──────────────────────────────────────────────────────
// HN stores comment HTML: <p> paragraphs, <a> links, and escaped entities.
// We strip to text (no dangerouslySetInnerHTML — the content is user-submitted).

function htmlToText(html: string): string {
  return html
    .replace(/<\/p>/gi, "")
    .replace(/<p>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&#x2F;/g, "/")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&")
    .trim()
}

function toPosting(raw: RawJob, tags: ClassifiedJob | undefined): Posting {
  const text = htmlToText(raw.text)
  const firstBreak = text.indexOf("\n")
  const company = (firstBreak === -1 ? text : text.slice(0, firstBreak)).split("|")[0].trim()
  return {
    raw,
    tags,
    company: company || "(untitled)",
    body: text,
    hnUrl: `https://news.ycombinator.com/item?id=${raw.id}`,
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PostingsList({ date }: { date: string }) {
  const { data: raw } = useQuery(rawQuery(date))
  const { data: classified } = useQuery(classifiedQuery(date))

  const [search, setSearch] = useState("")
  const [role, setRole] = useState("")
  const [tech, setTech] = useState("")
  const [remote, setRemote] = useState("")

  const postings = useMemo(() => {
    if (!raw) return []
    const byId = new Map((classified?.jobs ?? []).map((j) => [j.id, j]))
    return raw.jobs.map((j) => toPosting(j, byId.get(j.id)))
  }, [raw, classified])

  const roles = useMemo(
    () => [...new Set(postings.map((p) => p.tags?.role).filter(Boolean) as string[])].sort(),
    [postings],
  )
  const techs = useMemo(
    () => [...new Set(postings.flatMap((p) => p.tags?.technologies ?? []))].sort(),
    [postings],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return postings.filter((p) => {
      if (q && !p.body.toLowerCase().includes(q) && !p.raw.by.toLowerCase().includes(q)) return false
      if (role && p.tags?.role !== role) return false
      if (tech && !p.tags?.technologies.includes(tech)) return false
      if (remote && p.tags?.remote !== remote) return false
      return true
    })
  }, [postings, search, role, tech, remote])

  if (!raw) return <p className="text-muted-foreground text-sm">Loading postings…</p>

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-50">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search postings…"
            className="border-border bg-background focus-visible:ring-ring/50 h-9 w-full rounded-md border py-1 pr-3 pl-8 text-sm focus-visible:ring-[3px] focus-visible:outline-none"
          />
        </div>
        <FilterSelect value={role} onChange={setRole} placeholder="All roles" options={roles} />
        <FilterSelect value={tech} onChange={setTech} placeholder="All tech" options={techs} />
        <FilterSelect
          value={remote}
          onChange={setRemote}
          placeholder="Any location"
          options={Object.keys(REMOTE_LABELS)}
          labels={REMOTE_LABELS}
        />
      </div>

      <p className="text-muted-foreground text-xs">
        {filtered.length} of {postings.length} postings
      </p>

      {/* Postings */}
      <div className="space-y-2">
        {filtered.map((p) => (
          <details key={p.raw.id} className="group rounded-lg border px-4 py-3 open:bg-muted/30">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
              <div className="min-w-0 space-y-1.5">
                <span className="font-medium">{p.company}</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {p.tags?.role && <Badge variant="secondary">{p.tags.role}</Badge>}
                  {p.tags && p.tags.experience_level !== "Not specified" && (
                    <Badge variant="outline">{p.tags.experience_level}</Badge>
                  )}
                  {p.tags && p.tags.remote !== "not_mentioned" && (
                    <Badge variant="outline">{REMOTE_LABELS[p.tags.remote]}</Badge>
                  )}
                  {p.tags?.salary_band && <Badge variant="outline">{p.tags.salary_band}</Badge>}
                  {p.tags?.ai_ml_mentioned && <Badge variant="outline">AI/ML</Badge>}
                  {p.tags?.technologies.slice(0, 4).map((t) => (
                    <Badge key={t} variant="ghost">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
              <span className="text-muted-foreground shrink-0 text-xs group-open:hidden">expand</span>
            </summary>

            <div className="mt-3 space-y-2 border-t pt-3">
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <span>by {p.raw.by}</span>
                <a
                  href={p.hnUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary inline-flex items-center gap-1 hover:underline"
                >
                  View on HN <ExternalLink className="size-3" />
                </a>
              </div>
              <p className="text-sm whitespace-pre-wrap">{p.body}</p>
            </div>
          </details>
        ))}
        {filtered.length === 0 && (
          <p className="text-muted-foreground py-8 text-center text-sm">No postings match these filters.</p>
        )}
      </div>
    </div>
  )
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
  labels,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  options: string[]
  labels?: Record<string, string>
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border-border bg-background focus-visible:ring-ring/50 h-9 rounded-md border px-2 text-sm focus-visible:ring-[3px] focus-visible:outline-none"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {labels?.[o] ?? o}
        </option>
      ))}
    </select>
  )
}
