import { NextRequest, NextResponse } from "next/server";
import { uploadImage, uploadVideo } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "de-still-pharmacy";
    const type = (formData.get("type") as string) || "image";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const isVideo = type === "video" || file.type.startsWith("video/");

    // Validate file size
    const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large (max ${isVideo ? "50MB" : "5MB"})` },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const allowedVideoTypes = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"];

    if (isVideo && !allowedVideoTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid video type. Allowed: MP4, WebM, MOV, AVI" }, { status: 400 });
    }

    if (!isVideo && !allowedImageTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid image type. Allowed: JPEG, PNG, WebP, GIF" }, { status: 400 });
    }

    // Convert to base64 data URI
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    const result = isVideo
      ? await uploadVideo(dataUri, folder)
      : await uploadImage(dataUri, folder);

    return NextResponse.json({ ...result, type: isVideo ? "video" : "image" });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
