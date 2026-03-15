import { dataQueries } from "@/lib/data"

export const dynamic = "force-static"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://hn-job-trends.gantryops.dev"

export async function GET() {
  const manifest = await dataQueries.manifest.queryFn()

  const items = manifest.runs
    .slice(0, 20)
    .map(
      (run) => `
    <item>
      <title>${escapeXml(run.thread_title ?? `HN Jobs — ${run.date}`)}</title>
      <link>${SITE_URL}/history/${run.date}</link>
      <guid isPermaLink="true">${SITE_URL}/history/${run.date}</guid>
      <pubDate>${new Date(run.date).toUTCString()}</pubDate>
      <description>${run.job_count} jobs analyzed (${run.type} run)</description>
    </item>`,
    )
    .join("")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>HN Jobs Trends</title>
    <link>${SITE_URL}</link>
    <description>Tech job market trends from Hacker News — updated monthly</description>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  })
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}
