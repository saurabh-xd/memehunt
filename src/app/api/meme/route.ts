import { findBestMeme } from "@/services/meme.service"

export async function POST(req: Request) {

  const { situation } = await req.json()

  if (!situation) {
    return Response.json(
      { error: "Situation required" },
      { status: 400 }
    )
  }

  const meme = await findBestMeme(situation)

  console.log("response = ",meme );
  
//   response is = response =  {
//   id: 'gru-plan',
//   name: "Gru's Plan",
//   image: 'https://i.imgflip.com/26jxvz.jpg',
//   description: 'A plan that backfires unexpectedly'
// }

  return Response.json(meme)
}