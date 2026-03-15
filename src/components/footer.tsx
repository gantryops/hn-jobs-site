export function Footer() {
  return (
    <footer className="border-border/40 mt-16 border-t">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-semibold">Methodology</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Data is collected on the 3rd and 28th of each month from the Hacker News{" "}
              <a
                href="https://news.ycombinator.com/submitted?id=whoishiring"
                className="underline underline-offset-2"
              >
                &ldquo;Who is Hiring?&rdquo;
              </a>{" "}
              thread and direct job posts. Job listings are classified using{" "}
              <a
                href="https://openrouter.ai"
                className="underline underline-offset-2"
              >
                Google Gemini Flash
              </a>{" "}
              against a fixed taxonomy of technologies, roles, and work arrangements. Percentages
              are computed from aggregated counts across all listings.
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold">Open Source</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Both the data pipeline and this site are open source.
            </p>
            <div className="mt-2 flex gap-4 text-sm">
              <a
                href="https://github.com/gantryops/hn-jobs-data"
                className="underline underline-offset-2"
              >
                hn-jobs-data
              </a>
              <a
                href="https://github.com/gantryops/hn-jobs-site"
                className="underline underline-offset-2"
              >
                hn-jobs-site
              </a>
              <a
                href="/llms.txt"
                className="underline underline-offset-2"
              >
                llms.txt
              </a>
            </div>
            <p className="text-muted-foreground mt-4 text-xs">
              Built by{" "}
              <a href="https://gantryops.dev" className="underline underline-offset-2">
                GantryOps
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
