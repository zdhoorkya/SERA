import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import path from "path";
import fs from "fs";
import { Jimp } from "jimp";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 1. Process image using Jimp (server-side grayscale/contrast adjustment)
    const jimpImage = await Jimp.read(buffer);
    
    // Apply grayscale + contrast adjustment (+8%) matching CSS treatment exactly
    jimpImage.grayscale().contrast(0.08);

    const uploadsDir = path.join(process.cwd(), "public", "uploads");

    // Ensure uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique name
    const ext = file.name.split(".").pop() || "png";
    const filename = `${Date.now()}-${Math.floor(Math.random() * 10000)}.${ext}`;
    const filePath = path.join(uploadsDir, filename);

    // Save image
    await jimpImage.writeAsync(filePath);

    // Return public path
    const url = `/uploads/${filename}`;
    return NextResponse.json({ url });
  } catch (e) {
    console.error("Upload API error:", e);
    return NextResponse.json({ message: "Image processing failed" }, { status: 500 });
  }
}
