"use client";
import { FC, useRef, useState, useCallback, ChangeEvent } from "react";
import { IconCamera, IconX } from "@/components/icons";

interface AvatarUploadProps {
  src: string | null;
  name: string;
  size?: number;
  onUpload: (dataUrl: string) => Promise<void>;
}

function resizeImage(file: File, maxPx = 400): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.88));
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export const AvatarUpload: FC<AvatarUploadProps> = ({ src, name, size = 110, onUpload }) => {
  const fileRef   = useRef<HTMLInputElement>(null);
  const videoRef  = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [sheet,     setSheet]     = useState(false); // bottom sheet
  const [camera,    setCamera]    = useState(false); // camera modal
  const [busy,      setBusy]      = useState(false);
  const [camError,  setCamError]  = useState("");
  const [preview,   setPreview]   = useState<string | null>(null); // captured frame

  const initials = name.trim().split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";
  const hue = name ? (name.charCodeAt(0) * 37 + (name.charCodeAt(1) || 0) * 13) % 360 : 220;

  /* ── open camera ─────────────────────────────── */
  const openCamera = async () => {
    setSheet(false);
    setCamError("");
    setPreview(null);
    setCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setCamError("Camera access denied. Please allow camera permissions.");
    }
  };

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const closeCamera = () => {
    stopStream();
    setCamera(false);
    setPreview(null);
  };

  /* ── capture frame ───────────────────────────── */
  const capture = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0);
    setPreview(canvas.toDataURL("image/jpeg", 0.88));
    stopStream();
  };

  const retake = async () => {
    setPreview(null);
    setCamError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch { setCamError("Camera access denied."); }
  };

  const usePhoto = async () => {
    if (!preview) return;
    setBusy(true);
    await onUpload(preview);
    setBusy(false);
    closeCamera();
  };

  /* ── file upload ─────────────────────────────── */
  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setSheet(false);
    const dataUrl = await resizeImage(file);
    await onUpload(dataUrl);
    setBusy(false);
    e.target.value = "";
  };

  return (
    <>
      {/* ── Avatar button ── */}
      <div style={{ position: "relative", width: size, height: size }}>
        <button
          onClick={() => setSheet(true)}
          style={{ width: size, height: size, borderRadius: "50%", padding: 0, border: "none", cursor: "pointer", overflow: "hidden", display: "block", background: "none" }}
        >
          {src
            ? <img src={src} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            : (
              <div style={{ width: "100%", height: "100%", background: `hsl(${hue},50%,20%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.34, fontWeight: 700, color: `hsl(${hue},75%,68%)`, fontFamily: "'Fraunces',serif" }}>
                {initials}
              </div>
            )
          }
        </button>
        {/* Camera badge */}
        <button
          onClick={() => setSheet(true)}
          style={{ position: "absolute", bottom: 2, right: 2, width: 32, height: 32, borderRadius: "50%", background: "var(--acc)", border: "2.5px solid var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,.3)" }}
        >
          <IconCamera style={{ width: 14, height: 14, color: "#fff" }} />
        </button>
        {busy && (
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 22, height: 22, border: "3px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
          </div>
        )}
      </div>

      {/* ── Bottom sheet ── */}
      {sheet && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={() => setSheet(false)}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.45)" }} />
          <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", width: "100%", maxWidth: 420, background: "var(--card)", borderRadius: "16px 16px 0 0", padding: "6px 0 32px", boxShadow: "0 -4px 24px rgba(0,0,0,.15)" }}>
            <div style={{ width: 32, height: 3, borderRadius: 2, background: "var(--border2)", margin: "6px auto 14px" }} />
            <p style={{ textAlign: "center", fontWeight: 700, fontSize: 14, marginBottom: 14, color: "var(--ink)" }}>Update Profile Photo</p>
            <div style={{ display: "flex", gap: 10, padding: "0 20px" }}>
              <button onClick={openCamera} style={{ flex: 1, padding: "10px 8px", borderRadius: 12, background: "var(--acc-bg)", border: "1px solid var(--acc-bd)", color: "var(--acc)", fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, cursor: "pointer" }}>
                <span style={{ fontSize: 18 }}>🤳</span> Take Selfie
              </button>
              <button onClick={() => { setSheet(false); fileRef.current?.click(); }} style={{ flex: 1, padding: "10px 8px", borderRadius: 12, background: "var(--bg2)", border: "1px solid var(--border)", color: "var(--ink)", fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, cursor: "pointer" }}>
                <span style={{ fontSize: 18 }}>🖼️</span> Upload Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Camera modal (compact) ── */}
      {camera && (
        <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.7)" }} onClick={closeCamera}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "min(92vw, 360px)", background: "#111", borderRadius: 20, overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,.6)", display: "flex", flexDirection: "column" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px" }}>
              <p style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>Take Selfie</p>
              <button onClick={closeCamera} style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: "50%", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <IconX style={{ width: 15, height: 15, color: "#fff" }} />
              </button>
            </div>

            {/* Viewfinder — square crop */}
            <div style={{ position: "relative", width: "100%", aspectRatio: "1", background: "#000", overflow: "hidden" }}>
              {camError ? (
                <p style={{ color: "#fff", textAlign: "center", padding: 24, fontSize: 13, position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{camError}</p>
              ) : preview ? (
                <img src={preview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <video ref={videoRef} playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }} />
              )}
              {/* Circle guide */}
              {!preview && !camError && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                  <div style={{ width: "70%", aspectRatio: "1", borderRadius: "50%", border: "2px solid rgba(255,255,255,.55)", boxShadow: "0 0 0 1000px rgba(0,0,0,.3)" }} />
                </div>
              )}
            </div>

            {/* Controls */}
            <div style={{ padding: "14px 16px 18px", display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
              {preview ? (
                <>
                  <button onClick={retake} style={{ flex: 1, padding: "10px", borderRadius: 12, background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                    Retake
                  </button>
                  <button onClick={usePhoto} disabled={busy} style={{ flex: 1, padding: "10px", borderRadius: 12, background: "var(--acc)", border: "none", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: busy ? 0.7 : 1 }}>
                    {busy ? "Saving…" : "Use Photo"}
                  </button>
                </>
              ) : (
                <button onClick={capture} disabled={!!camError} style={{ width: 56, height: 56, borderRadius: "50%", background: "#fff", border: "3px solid rgba(255,255,255,.4)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 12px rgba(0,0,0,.4)" }}>
                  <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#fff", border: "3px solid #111" }} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
};
