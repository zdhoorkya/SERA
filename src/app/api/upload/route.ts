import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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
    jimpImage.grayscale().contrast(0.08);

    // 2. Get processed image as buffer (PNG)
    const processedBuffer = await jimpImage.getBuffer("image/png");
    const base64 = processedBuffer.toString("base64");

    // 3. Send to remote PHP database server for persistent storage
    const remoteUrl = "https://database.primpla.com/api.php";
    const dbToken = process.env.DB_ACCESS_TOKEN || "primpla-sera-2026";

    const ext = file.name.split(".").pop() || "png";
    const filename = `${Date.now()}-${Math.floor(Math.random() * 10000)}.png`;

    const response = await fetch(remoteUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Database-Token": dbToken,
      },
      body: JSON.stringify({
        token: dbToken,
        model: "Upload",
        action: "uploadImage",
        args: {
          filename,
          base64,
          mimeType: "image/png",
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Remote upload failed:", response.status, errText);
      return NextResponse.json({ message: "Image upload failed" }, { status: 500 });
    }

    const result = await response.json();
    if (result.error) {
      console.error("Remote upload error:", result.error);
      return NextResponse.json({ message: "Image upload failed" }, { status: 500 });
    }

    // Return the public URL from the remote server
    return NextResponse.json({ url: result.url });
  } catch (e) {
    console.error("Upload API error:", e);
    return NextResponse.json({ message: "Image processing failed" }, { status: 500 });
  }
}
