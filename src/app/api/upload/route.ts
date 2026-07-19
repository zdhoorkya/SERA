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

    let base64: string;
    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    let filename = `${Date.now()}-${Math.floor(Math.random() * 10000)}.${ext}`;

    // 1. Try Jimp processing (grayscale + contrast), with fallback to original buffer if Jimp fails
    try {
      const jimpImage = await Jimp.read(buffer);
      jimpImage.grayscale().contrast(0.08);

      // Try fetching buffer from Jimp instance
      let processedBuffer: Buffer | null = null;
      if (typeof (jimpImage as any).getBuffer === "function") {
        processedBuffer = await (jimpImage as any).getBuffer("image/png");
      } else if (typeof (jimpImage as any).getBufferAsync === "function") {
        processedBuffer = await (jimpImage as any).getBufferAsync("image/png");
      }

      if (processedBuffer) {
        base64 = processedBuffer.toString("base64");
        filename = `${Date.now()}-${Math.floor(Math.random() * 10000)}.png`;
      } else {
        base64 = buffer.toString("base64");
      }
    } catch (jimpErr) {
      console.warn("Jimp processing skipped/failed, using raw upload buffer:", jimpErr);
      base64 = buffer.toString("base64");
    }

    // 2. Send to remote PHP database server for persistent storage
    const remoteUrl = "https://database.primpla.com/api.php";
    const dbToken = process.env.DB_ACCESS_TOKEN || "primpla-sera-2026";

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
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Remote upload HTTP error:", response.status, errText);
      return NextResponse.json({ message: `Upload server error (${response.status})` }, { status: 500 });
    }

    const result = await response.json();
    if (result.error) {
      console.error("Remote upload payload error:", result.error);
      return NextResponse.json({ message: result.error }, { status: 500 });
    }

    // Return the public URL from the remote server
    return NextResponse.json({ url: result.url });
  } catch (e: any) {
    console.error("Upload API error:", e);
    return NextResponse.json({ message: e?.message || "Image upload failed" }, { status: 500 });
  }
}
