import { readFile } from "node:fs/promises"
import path from "node:path"
import type { Analysis, ClassifiedData, History, Manifest, RawData, TrendSeries } from "../../hn-jobs-data/scripts/schemas"

export type { Analysis, ClassifiedData, History, Manifest, RawData, TrendSeries }
export type { ClassifiedJob, RawJob } from "../../hn-jobs-data/scripts/schemas"

const DATA_DIR = path.resolve(process.cwd(), "hn-jobs-data")

async function readJSON<T>(...segments: string[]): Promise<T> {
  const filePath = path.join(DATA_DIR, ...segments)
  const content = await readFile(filePath, "utf-8")
  return JSON.parse(content) as T
}

export function loadManifest(): Promise<Manifest> {
  return readJSON<Manifest>("indexes", "manifest.json")
}

export function loadHistory(): Promise<History> {
  return readJSON<History>("indexes", "history.json")
}

export function loadTechTrends(): Promise<TrendSeries> {
  return readJSON<TrendSeries>("indexes", "tech-trends.json")
}

export function loadLanguageTrends(): Promise<TrendSeries> {
  return readJSON<TrendSeries>("indexes", "language-trends.json")
}

export function loadRoleTrends(): Promise<TrendSeries> {
  return readJSON<TrendSeries>("indexes", "role-trends.json")
}

export function loadAnalysis(date: string): Promise<Analysis> {
  return readJSON<Analysis>("runs", date, "analysis.json")
}

export function loadClassified(date: string): Promise<ClassifiedData> {
  return readJSON<ClassifiedData>("runs", date, "classified.json")
}

export function loadRaw(date: string): Promise<RawData> {
  return readJSON<RawData>("runs", date, "raw.json")
}

export function loadTechClusters() {
  return readJSON<unknown>("indexes", "tech-clusters.json")
}

export function loadTechAssociations() {
  return readJSON<unknown>("indexes", "tech-associations.json")
}

export function loadTechMomentum() {
  return readJSON<unknown>("indexes", "tech-momentum.json")
}

export function loadTechCooccurrence() {
  return readJSON<unknown>("indexes", "tech-cooccurrence.json")
}
