import { loadManifest, loadAnalysis, loadClassified, loadRaw } from "@/lib/fs-data"
import { RunDetailView } from "@/components/run-detail-view"

export async function generateStaticParams() {
  const manifest = await loadManifest()
  return manifest.runs.map((run) => ({ date: run.date }))
}

export default async function RunPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params

  const [analysis, classified, raw] = await Promise.all([
    loadAnalysis(date),
    loadClassified(date),
    loadRaw(date),
  ])

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <RunDetailView analysis={analysis} classified={classified} raw={raw} date={date} />
    </main>
  )
}
