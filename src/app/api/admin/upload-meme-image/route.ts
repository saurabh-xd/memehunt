import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import cloudinary, { hasCloudinaryEnv } from "@/lib/cloudinary"
import { requireAdmin } from "@/lib/auth-helpers"

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function uploadImageToCloudinary(buffer: Buffer, publicIdBase: string) {
  return new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "memehunt/memes",
        public_id: `${publicIdBase}-${Date.now()}`,
        overwrite: false,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error)
          return
        }

        if (!result?.secure_url || !result.public_id) {
          reject(new Error("Cloudinary did not return a valid image URL."))
          return
        }

        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        })
      }
    )

    uploadStream.end(buffer)
  })
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      return NextResponse.json({ error: "You must be signed in to upload images." }, { status: 401 })
    }

       await requireAdmin()

    if (!hasCloudinaryEnv()) {
      return NextResponse.json(
        { error: "Cloudinary is not configured on this environment." },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file")
    const name = String(formData.get("name") ?? "").trim()

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose an image file to upload." }, { status: 400 })
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image uploads are supported." }, { status: 400 })
    }

    const originalName = file.name.replace(/\.[^.]+$/, "")
    const publicIdBase = slugify(name || originalName || "meme")

    if (!publicIdBase) {
      return NextResponse.json({ error: "Could not create a valid image ID." }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const uploadedImage = await uploadImageToCloudinary(buffer, publicIdBase)

    return NextResponse.json({
      url: uploadedImage.secure_url,
      publicId: uploadedImage.public_id,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to upload image right now.",
      },
      { status: 500 }
    )
  }
}
