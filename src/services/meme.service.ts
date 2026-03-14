import { memes } from "@/data/meme"
import { chooseMeme } from "./ai.services"


export async function findBestMeme(situation: string) {

  const memeList = memes
    .map(m => `${m.id} → ${m.description}`)
    .join("\n")

  const templateId = await chooseMeme(situation, memeList)

  const meme = memes.find(m => m.id === templateId)

  return meme ?? memes[0]
}