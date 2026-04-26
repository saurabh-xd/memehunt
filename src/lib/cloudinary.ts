import { v2 as cloudinary } from "cloudinary"

export function getCloudinaryConfig() {
  return {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  }
}

export function hasCloudinaryEnv() {
  const { cloud_name, api_key, api_secret } = getCloudinaryConfig()
  return Boolean(cloud_name && api_key && api_secret)
}

cloudinary.config(getCloudinaryConfig())

export default cloudinary
