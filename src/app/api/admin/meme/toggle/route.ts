import { toggleMemeSelection } from "@/services/admin.service"


export async function PATCH(req: Request) {
  const { id, enabled } = await req.json()

  const result = await toggleMemeSelection(id, enabled)

  return Response.json(result)
}