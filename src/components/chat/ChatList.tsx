import { FC } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui";

interface ChatPreview {
  id: string;
  name: string;
  lastMessage: string;
  time?: string;
  unread: number;
  href: string;
}

function fmtRelative(iso?: string): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) {
    return new Date(iso).toLocaleDateString([], { weekday: "short" });
  }
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

interface ChatListProps { chats: ChatPreview[]; }

export const ChatList: FC<ChatListProps> = ({ chats }) => (
  <div style={{ paddingBottom: 88 }}>
    <div style={{ padding: "52px 22px 18px", borderBottom: "1px solid var(--border)" }}>
      <h1 className="serif" style={{ fontSize: 28, letterSpacing: "-.02em" }}>Messages</h1>
    </div>
    {chats.map((c) => (
      <Link key={c.id} href={c.href} style={{ textDecoration: "none", color: "inherit" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 22px", cursor: "pointer", background: c.unread ? "var(--acc-bg)" : "transparent", borderLeft: `2px solid ${c.unread ? "var(--acc)" : "transparent"}`, transition: "background .2s" }}>
          <div style={{ position: "relative" }}>
            <Avatar name={c.name} size={46} />
            {c.unread > 0 && (
              <div style={{ position: "absolute", top: -2, right: -2, width: 10, height: 10, background: "var(--acc)", borderRadius: "50%", border: "2px solid var(--bg)" }} />
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <p style={{ fontWeight: 700, fontSize: 15 }}>{c.name}</p>
              <p style={{ fontSize: 11, color: c.unread ? "var(--acc)" : "var(--ink3)", fontWeight: c.unread ? 700 : 400 }}>{fmtRelative(c.time)}</p>
            </div>
            <p style={{ fontSize: 13, color: "var(--ink2)", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.lastMessage}</p>
          </div>
        </div>
      </Link>
    ))}
  </div>
);
