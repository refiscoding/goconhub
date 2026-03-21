import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { uploadFile } from "@/lib/storage";
import { logger } from "@/lib/logger";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;   // 2 MB
const MAX_DOC_SIZE    = 5 * 1024 * 1024;    // 5 MB

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_DOC_TYPES   = [...ALLOWED_IMAGE_TYPES, "application/pdf"];

function extFromMime(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp",
    "image/gif": "gif", "application/pdf": "pdf",
  };
  return map[mime] ?? "bin";
}

/**
 * POST /api/upload
 * Accepts multipart/form-data with:
 *   - file:   the file blob
 *   - bucket: "avatars" | "documents"
 *   - type:   "avatar" | "id-document" | "cipa-document"
 *
 * Returns { url } — public URL for avatars, storage path for documents.
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file   = formData.get("file") as File | null;
    const bucket = formData.get("bucket") as string | null;
    const type   = formData.get("type") as string | null;

    if (!file || !bucket || !type) {
      return NextResponse.json({ message: "file, bucket, and type are required." }, { status: 400 });
    }

    // Validate bucket
    if (!["avatars", "documents"].includes(bucket)) {
      return NextResponse.json({ message: "Invalid bucket." }, { status: 400 });
    }

    // Validate type
    if (!["avatar", "id-document", "cipa-document"].includes(type)) {
      return NextResponse.json({ message: "Invalid upload type." }, { status: 400 });
    }

    // Documents require vendor role
    if (bucket === "documents" && session.role !== "vendor") {
      return NextResponse.json({ message: "Only vendors can upload documents." }, { status: 403 });
    }

    // Validate MIME type
    const allowedTypes = bucket === "avatars" ? ALLOWED_IMAGE_TYPES : ALLOWED_DOC_TYPES;
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ message: `Invalid file type: ${file.type}` }, { status: 400 });
    }

    // Validate size
    const maxSize = bucket === "avatars" ? MAX_AVATAR_SIZE : MAX_DOC_SIZE;
    if (file.size > maxSize) {
      return NextResponse.json({
        message: `File too large. Max ${maxSize / (1024 * 1024)}MB.`,
      }, { status: 400 });
    }

    // Build storage path
    const ext = extFromMime(file.type);
    const ts  = Date.now();
    const path = bucket === "avatars"
      ? `${session.userId}-${ts}.${ext}`
      : `${session.userId}/${type}-${ts}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadFile(bucket, path, buffer, file.type);

    logger.info("File uploaded", { bucket, path, userId: session.userId, size: file.size });

    return NextResponse.json({ url }, { status: 201 });
  } catch (e) {
    logger.error("Upload failed", { error: e instanceof Error ? e.message : String(e) });
    return NextResponse.json({ message: "Upload failed." }, { status: 500 });
  }
}
