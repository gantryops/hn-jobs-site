import { NextResponse } from "next/server"
import { readFile } from "node:fs/promises"
import path from "node:path"

const DATA_DIR = path.resolve(process.cwd(), "hn-jobs-data")

export async function GET(
  _request: Request,
  context: { params: Promise<{ date: string; file: string }> },
) {
  const { date, file } = await context.params
  const filePath = path.join(DATA_DIR, "runs", date, file)

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