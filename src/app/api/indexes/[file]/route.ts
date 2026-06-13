import { NextResponse } from "next/server"
import { readFile } from "node:fs/promises"
import path from "node:path"

// Serve static JSON from hn-jobs-data submodule.
// DATA_DIR is the hn-jobs-data directory relative to the project root.
const DATA_DIR = path.resolve(process.cwd(), "hn-jobs-data")

export async function GET(
  _request: Request,
  context: { params: Promise<{ file: string }> },
) {
  const { file } = await context.params
  const filePath = path.join(DATA_DIR, "indexes", file)

  try {
    const content = await readFile(filePath, "utf-8")
    return new NextResponse(content, {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch {
    return new NextResponse("Not found", { status: 404 })
  }
}