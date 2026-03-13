import { useState } from "react"
import { MemeResult } from "@/types/meme"
import axios from "axios"

export function useMemeGenerator() {

  const [situation, setSituation] = useState("")
  const [template, setTemplate] = useState<MemeResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  async function generate(e?: React.FormEvent) {

    if (e) e.preventDefault()
    if (!situation.trim()) return

    setIsLoading(true)
    setError("")
    setTemplate(null)

    try {

      const res = await axios.post("api/meme", { situation})

      const data = await res.data


      setTemplate(data)

    } catch (error) {

      console.error(error)
      setError("Something went wrong")

    } finally {
      setIsLoading(false)
    }

  }

  return {
    situation,
    setSituation,
    template,
    isLoading,
    error,
    generate
  }
}