import { createMemeTemplate, deleteMemeTemplate, updateMemeTemplate } from "@/services/admin.service"
import { NextResponse } from "next/server"


export async function POST(req: Request){
    try {

        const body = await req.json()
console.log(body);

        const meme =  await createMemeTemplate(body)

        return NextResponse.json({success: true, meme})
        
    } catch (error) {
        console.log(error);
        
        return NextResponse.json(
      { error: "Failed to create meme" },
      { status: 500 }
    )
    }



}

export async function DELETE(req: Request){
    try {

        const {id} = await req.json()        

        await deleteMemeTemplate(id)

        console.log("delete success");
        

        return NextResponse.json({ success: true })

    } catch (error) {
         return NextResponse.json(
      { error: "Failed to delete meme" },
      { status: 500 }
    )
    }
}

export async function PATCH(req: Request){
    try {
        const body = await req.json()

        const {id, ...data} = body

const updated = await updateMemeTemplate(id, data)




return NextResponse.json({success: true, updated})



    } catch (error) {
        console.log(error);
        
        return NextResponse.json({error: "update failed"}, {status: 500})
    }
}