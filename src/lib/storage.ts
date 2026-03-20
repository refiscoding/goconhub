/**
 * Supabase Storage wrapper using the REST API directly (no SDK).
 *
 * Requires env vars:
 *   SUPABASE_URL             — e.g. https://xyz.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY — service_role key (server-side only)
 *
 * Buckets (create in Supabase dashboard):
 *   "avatars"   — public  (user profile photos)
 *   "documents" — private (identity docs, accessed via signed URLs)
 */

import { logger } from "./logger";

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

function headers(contentType?: string): Record<string, string> {
  const h: Record<string, string> = {
    Authorization: `Bearer ${SERVICE_KEY}`,
    apikey: SERVICE_KEY,
  };
  if (contentType) h["Content-Type"] = contentType;
  return h;
}

/**
 * Upload a file to a Supabase Storage bucket.
 * Returns the public URL (for public buckets) or the storage path (for private buckets).
 */
export async function uploadFile(
  bucket: string,
  path: string,
  buffer: Buffer | Uint8Array,
  contentType: string,
): Promise<string> {
  const url = `${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { ...headers(contentType), "x-upsert": "true" },
    body: buffer as unknown as BodyInit,
  });

  if (!res.ok) {
    const text = await res.text();
    logger.error("Storage upload failed", { bucket, path, status: res.status, body: text });
    throw new Error(`Storage upload failed: ${res.status}`);
  }

  // Return public URL for public buckets, storage path for private
  if (bucket === "avatars") {
    return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
  }
  return path;
}

/**
 * Get a time-limited signed URL for a private file.
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn = 3600,
): Promise<string> {
  const url = `${SUPABASE_URL}/storage/v1/object/sign/${bucket}/${path}`;

  const res = await fetch(url, {
    method: "POST",
    headers: headers("application/json"),
    body: JSON.stringify({ expiresIn }),
  });

  if (!res.ok) {
    const text = await res.text();
    logger.error("Storage sign URL failed", { bucket, path, status: res.status, body: text });
    throw new Error(`Storage sign URL failed: ${res.status}`);
  }

  const data = await res.json();
  return `${SUPABASE_URL}/storage/v1${data.signedURL}`;
}

/**
 * Delete a file from a Supabase Storage bucket.
 */
export async function deleteFile(bucket: string, path: string): Promise<void> {
  const url = `${SUPABASE_URL}/storage/v1/object/${bucket}`;

  const res = await fetch(url, {
    method: "DELETE",
    headers: headers("application/json"),
    body: JSON.stringify({ prefixes: [path] }),
  });

  if (!res.ok) {
    const text = await res.text();
    logger.warn("Storage delete failed", { bucket, path, status: res.status, body: text });
  }
}
