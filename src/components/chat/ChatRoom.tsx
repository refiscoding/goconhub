"use client";
import { FC, useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { IconChevL, IconSend } from "@/components/icons";
import { Avatar } from "@/components/ui";
import { MessageBubble } from "./MessageBubble";
import { useUser } from "@/context/UserContext";
import type { Message } from "@/lib/types";

interface ChatRoomProps {
  title: string;
  subtitle: string;
  banner?: string;
  bookingId?: string;
  initialMessages?: Message[];
  quickReplies?: string[];
  backHref?: string;
  avatarSrc?: string | null;
  profileHref?: string;
}

function markRead(bookingId: string, count: number) {
  try { localStorage.setItem(`hh_seen_${bookingId}`, String(count)); } catch { /* ignore */ }
}

export const ChatRoom: FC<ChatRoomProps> = ({
  title, subtitle, banner, bookingId, initialMessages = [], quickReplies = [], backHref, avatarSrc, profileHref,
}) => {
  const router   = useRouter();
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input,    setInput]    = useState("");
  const [showQR,   setShowQR]   = useState(false);
  const [sending,  setSending]  = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bookingId) return;
    fetch(`/api/messages?bookingId=${bookingId}`)
      .then((r) => r.json())
      .then((data) => {
        const myId = user?.id;
        const msgs: Message[] = (data.messages ?? []).map((m: {
          id: string; text: string; createdAt: string;
          sender: { id: string };
        }) => ({
          id:   m.id,
          from: m.sender.id === myId ? "me" : "them",
          text: m.text,
          time: new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }));
        setMessages(msgs);
        markRead(bookingId, msgs.length);
      })
      .catch(() => {});
  }, [bookingId, user?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text?: string) => {
    const t = text ?? input.trim();
    if (!t || sending) return;
    setInput("");
    setShowQR(false);

    if (bookingId) {
      setSending(true);
      try {
        const res = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId, text: t }),
        });
        if (res.ok) {
          const data = await res.json();
          const m = data.message;
          setMessages((prev) => {
            const next = [
              ...prev,
              {
                id:   m.id,
                from: "me" as const,
                text: m.text,
                time: new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              },
            ];
            markRead(bookingId, next.length);
            return next;
          });
        }
      } catch { /* ignore */ } finally { setSending(false); }
    } else {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), from: "me", text: t, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
      ]);
    }
  };

  const goBack = () => backHref ? router.push(backHref) : router.back();

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg)" }}>
      <div style={{ background: "var(--card)", borderBottom: "1px solid var(--border)", padding: "50px 18px 14px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 50 }}>
        <button className="back-btn" onClick={goBack}>
          <IconChevL style={{ width: 22, height: 22 }} />
        </button>
        <div
          style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, cursor: profileHref ? "pointer" : "default" }}
          onClick={() => profileHref && router.push(profileHref)}
        >
          <Avatar name={title} size={36} src={avatarSrc} />
          <div>
            <p style={{ fontWeight: 700, fontSize: 15 }}>{title}</p>
            <p style={{ fontSize: 11, color: "var(--green)", fontWeight: 600, marginTop: 1 }}>● {subtitle}</p>
          </div>
        </div>
      </div>

      {banner && (
        <div style={{ background: "var(--acc-bg)", borderBottom: "1px solid var(--acc-bd)", padding: "9px 18px" }}>
          <p style={{ fontSize: 12, color: "var(--acc)", fontWeight: 500 }}>{banner}</p>
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px 110px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ textAlign: "center", marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: "var(--ink3)", background: "var(--bg2)", padding: "3px 12px", borderRadius: 999 }}>Today</span>
        </div>
        {messages.length === 0 && (
          <p style={{ textAlign: "center", color: "var(--ink3)", fontSize: 13, marginTop: 40 }}>No messages yet. Say hello!</p>
        )}
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} senderName={title} />
        ))}
        <div ref={bottomRef} />
      </div>

      {showQR && quickReplies.length > 0 && (
        <div style={{ position: "fixed", bottom: 72, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "var(--card)", borderTop: "1px solid var(--border)", padding: "12px 14px", zIndex: 60 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "var(--acc)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>Quick Replies</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 180, overflowY: "auto" }}>
            {quickReplies.map((r, i) => (
              <button key={i} onClick={() => send(r)}
                style={{ textAlign: "left", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 10, padding: "9px 12px", fontSize: 13, color: "var(--ink)", cursor: "pointer" }}>
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "var(--card)", borderTop: "1px solid var(--border)", padding: "10px 14px 22px", display: "flex", gap: 8, alignItems: "flex-end", zIndex: 55 }}>
        {quickReplies.length > 0 && (
          <button onClick={() => setShowQR((v) => !v)}
            style={{ width: 40, height: 40, background: showQR ? "var(--acc-bg)" : "var(--bg3)", border: `1px solid ${showQR ? "var(--acc-bd)" : "var(--border)"}`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
            ⚡
          </button>
        )}
        <input className="field" placeholder="Type a message…" value={input}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && send()}
          style={{ flex: 1 }} />
        <button onClick={() => send()} disabled={sending}
          style={{ width: 42, height: 42, borderRadius: 10, background: "var(--acc)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--bg)", flexShrink: 0, opacity: sending ? 0.6 : 1 }}>
          <IconSend style={{ width: 18, height: 18 }} />
        </button>
      </div>
    </div>
  );
};
