"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Calendar, Wrench, ShieldCheck, CreditCard } from "lucide-react";

interface Notif {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  linkUrl: string | null;
  createdAt: string;
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  booking_accepted:  <Calendar    size={18} color="#0d9488" />,
  job_complete:      <Wrench      size={18} color="#0d9488" />,
  payment_confirmed: <CreditCard  size={18} color="#0d9488" />,
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function CustomerNotificationsPage() {
  const router = useRouter();
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/notifications");
    if (res.ok) {
      const d = await res.json();
      setNotifs(d.notifications);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClick = async (n: Notif) => {
    if (!n.read) {
      await fetch(`/api/notifications/${n.id}`, { method: "PATCH" });
      setNotifs((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x));
    }
    if (n.linkUrl) router.push(n.linkUrl);
  };

  const unread = notifs.filter((n) => !n.read).length;

  return (
    <div style={{ maxWidth: 540, margin: "0 auto", padding: "24px 16px 80px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Bell size={22} color="var(--acc)" />
          <h1 className="serif" style={{ fontSize: 22, letterSpacing: "-.02em", margin: 0 }}>Notifications</h1>
          {unread > 0 && (
            <span style={{ background: "var(--acc)", color: "white", borderRadius: 99, fontSize: 11, fontWeight: 700, padding: "2px 8px" }}>{unread}</span>
          )}
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--acc)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
            <CheckCheck size={15} />
            Mark all read
          </button>
        )}
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: 48, color: "var(--ink2)" }}>Loading…</div>
      )}

      {!loading && notifs.length === 0 && (
        <div style={{ textAlign: "center", padding: 48 }}>
          <Bell size={40} color="var(--ink3)" style={{ marginBottom: 12 }} />
          <p style={{ color: "var(--ink2)", fontSize: 15 }}>No notifications yet</p>
          <p style={{ color: "var(--ink3)", fontSize: 13, marginTop: 4 }}>You'll be notified when your booking status changes.</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {notifs.map((n) => (
          <div
            key={n.id}
            onClick={() => handleClick(n)}
            style={{
              background: n.read ? "var(--bg2)" : "var(--acc-bg)",
              border: `1px solid ${n.read ? "var(--border)" : "var(--acc-bd)"}`,
              borderRadius: 12,
              padding: "14px 16px",
              cursor: n.linkUrl ? "pointer" : "default",
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
              transition: "opacity .15s",
            }}
          >
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: n.read ? "var(--bg3)" : "var(--acc-bg)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {TYPE_ICON[n.type] ?? <Bell size={18} color="var(--ink2)" />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <p style={{ fontWeight: n.read ? 500 : 700, fontSize: 14, margin: 0, color: "var(--ink)" }}>{n.title}</p>
                <span style={{ fontSize: 11, color: "var(--ink3)", flexShrink: 0 }}>{timeAgo(n.createdAt)}</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--ink2)", margin: "3px 0 0", lineHeight: 1.45 }}>{n.body}</p>
            </div>
            {!n.read && (
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--acc)", flexShrink: 0, marginTop: 5 }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
