"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function TrendsRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/insights")
  }, [router])
  return null
}
