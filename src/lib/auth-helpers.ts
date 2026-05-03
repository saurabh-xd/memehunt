import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import prisma from "./prisma"

export async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    throw new Error("Unauthorized")
  }


  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  if (!user || user.role !== "ADMIN") {
    throw new Error("Forbidden")
  }

  return user
}