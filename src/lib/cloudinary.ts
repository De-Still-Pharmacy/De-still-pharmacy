import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(
  file: string,
  folder: string = "de-still-pharmacy"
): Promise<{ url: string; publicId: string; secure_url: string }> {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });
  return { url: result.secure_url, publicId: result.public_id, secure_url: result.secure_url };
}

export async function uploadVideo(
  file: string,
  folder: string = "de-still-pharmacy/videos"
): Promise<{ url: string; publicId: string; secure_url: string }> {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    resource_type: "video",
  });
  return { url: result.secure_url, publicId: result.public_id, secure_url: result.secure_url };
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export { cloudinary };
