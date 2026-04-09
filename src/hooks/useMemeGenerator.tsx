import { useState } from "react"
import { MemeResult } from "@/types/meme"
import axios from "axios"
import {
  MemeApiErrorResponse,
  MemeGenerateRequest,
  MemeGenerateResponse,
} from "@/types/api"

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

      const res = await axios.post<MemeGenerateResponse>("api/meme", {
        situation,
      } satisfies MemeGenerateRequest)

      const data = res.data


      setTemplate(data)
      return data as MemeResult

    } catch (error) {
      const message =
        axios.isAxiosError<MemeApiErrorResponse>(error)
          ? error.response?.data?.error ?? "Something went wrong"
          : "Something went wrong"

      console.error(error)
      setError(message)
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
