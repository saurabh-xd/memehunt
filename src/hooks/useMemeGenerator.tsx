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
    if (!situation.trim()) return null

    setIsLoading(true)
    setError("")
    setTemplate(null)

    try {

      const res = await axios.post("api/meme", { situation})

      const data = await res.data


      setTemplate(data)
      return data as MemeResult

    } catch (error) {

      console.error(error)
      setError("Something went wrong")
      return null

    } finally {
      setIsLoading(false)
    }

  }

  function clearTemplate() {
    setTemplate(null)
    setError("")
  }

  return {
    situation,
    setSituation,
    template,
    isLoading,
    error,
    generate,
    clearTemplate
  }
}
