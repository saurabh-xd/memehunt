import { requireAdmin } from "@/lib/auth-helpers"
import { toggleMemeSelection } from "@/services/admin.service"


export async function PATCH(req: Request) {

   await requireAdmin()

  const { id, enabled } = await req.json()

  const result = await toggleMemeSelection(id, enabled)

  return Response.json(result)
}