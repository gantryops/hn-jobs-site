import { loadManifest, loadAnalysis, loadClassified, loadRaw } from "@/lib/fs-data"
import { RunDetailView } from "@/components/run-detail-view"

export default async function Page() {
  const manifest = await loadManifest()
  const latestDate = manifest.runs[0].date

  const [latestAnalysis, classified, raw] = await Promise.all([
    loadAnalysis(latestDate),
    loadClassified(latestDate),
    loadRaw(latestDate),
  ])

  const prevDate = manifest.runs[1]?.date
  const prevAnalysis = prevDate ? await loadAnalysis(prevDate) : undefined

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <RunDetailView
        analysis={latestAnalysis}
        classified={classified}
        raw={raw}
        prevAnalysis={prevAnalysis}
        isHome
      />
    </main>
  )
}
