import prisma from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

 









export async function createMemeTemplate(data: Prisma.MemeTemplateCreateInput) {

    return prisma.memeTemplate.create({data})
}

export async function updateMemeTemplate(id: string, data: Prisma.MemeTemplateUpdateInput) {
 
return prisma.memeTemplate.update({
    where: {id},
    data
})

}

export async function deleteMemeTemplate(id: string){

    return prisma.memeTemplate.delete({
        where: {id}
    })
}

export async function toggleMemeSelection(id: string, enabled: boolean){

     return prisma.memeTemplate.update({
    where: { id },
    data: { selectionEnabled: enabled },
  })
}





