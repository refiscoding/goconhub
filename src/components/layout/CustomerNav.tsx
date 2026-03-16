"use client";
import { FC, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { IconSearch, IconChat, IconUser, IconWrench, IconChevL, IconServices, IconLogout, IconShop } from "@/components/icons";

interface NavItem { href: string; icon: React.ReactNode; label: string; badge?: boolean }

const NAV_ITEMS: NavItem[] = [
  { href: "/customer/explore",        icon: <IconSearch   style={{ width: 20, height: 20 }} />, label: "Explore"       },
  { href: "/customer/bookings",       icon: <IconServices style={{ width: 20, height: 20 }} />, label: "Bookings"      },
  { href: "/customer/marketplace",    icon: <IconShop     style={{ width: 20, height: 20 }} />, label: "Marketplace"   },
  { href: "/customer/messages",       icon: <IconChat     style={{ width: 20, height: 20 }} />, label: "Messages"      },
  { href: "/customer/notifications",  icon: <Bell         size={20}                          />, label: "Notifications", badge: true },
  { href: "/customer/profile",        icon: <IconUser     style={{ width: 20, height: 20 }} />, label: "Profile"       },
];

interface CustomerNavProps { unreadCount?: number; }

export const CustomerNav: FC<CustomerNavProps> = ({ unreadCount = 0 }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed]       = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(unreadCount);

  useEffect(() => {
    const saved = localStorage.getItem("nav-collapsed") === "true";
    setCollapsed(saved);
    document.documentElement.dataset.navCollapsed = String(saved);
  }, []);

  useEffect(() => {
    fetch("/api/notifications").then((r) => r.ok ? r.json() : null).then((d) => {
      if (d) setUnreadNotifs(d.unread);
    });
  }, [pathname]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("nav-collapsed", String(next));
    document.documentElement.dataset.navCollapsed = String(next);
  };

  const closeMobile = () => setMobileOpen(false);

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  return (
    <>
      {/* Hamburger button — mobile only */}
      <button className={`nav-hamburger${mobileOpen ? " nav-hamburger--hidden" : ""}`} onClick={() => setMobileOpen(true)} aria-label="Open menu">
        <svg width="18" height="14" viewBox="0 0 18 14" fill="currentColor">
          <rect y="0"  width="18" height="2" rx="1"/>
          <rect y="6"  width="18" height="2" rx="1"/>
          <rect y="12" width="18" height="2" rx="1"/>
        </svg>
      </button>

      {/* Backdrop */}
      {mobileOpen && <div className="nav-overlay" onClick={closeMobile} />}

      {/* Nav panel */}
      <nav className={`nav-bot${mobileOpen ? " mobile-open" : ""}`}>
        {/* Brand header */}
        <div className="nav-brand">
          <div className="nav-brand-logo" style={{ background: "#0077B6" }}>
            <IconWrench style={{ width: 14, height: 14 }} />
          </div>
          <span className="nav-brand-name serif">HandyHub</span>
          <button className="nav-toggle-btn" onClick={toggle} aria-label="Toggle sidebar">
            <IconChevL style={{ width: 13, height: 13, transform: collapsed ? "rotate(180deg)" : "none", transition: "transform .25s" }} />
          </button>
          <button className="nav-close-btn" onClick={closeMobile} aria-label="Close menu">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="1" y1="1" x2="13" y2="13"/><line x1="13" y1="1" x2="1" y2="13"/>
            </svg>
          </button>
        </div>

        {/* Nav items */}
        <div className="nav-items-wrap">
          {NAV_ITEMS.map((n) => {
            const active = pathname.startsWith(n.href);
            const showBadge = n.badge && unreadNotifs > 0;
            return (
              <Link key={n.href} href={n.href} className={`nav-item ${active ? "on" : ""}`} style={{ textDecoration: "none" }} onClick={closeMobile}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  {n.icon}
                  {showBadge && (
                    <span style={{ position: "absolute", top: -4, right: -4, background: "var(--acc)", color: "white", borderRadius: 99, fontSize: 9, fontWeight: 800, minWidth: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px", lineHeight: 1 }}>
                      {unreadNotifs > 9 ? "9+" : unreadNotifs}
                    </span>
                  )}
                </div>
                <span className="nav-label">{n.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Sign out */}
        <div className="nav-signout-wrap">
          <button className="nav-signout" onClick={handleSignOut}>
            <IconLogout style={{ width: 18, height: 18, flexShrink: 0 }} />
            <span className="nav-label">Sign Out</span>
          </button>
        </div>
      </nav>
    </>
  );
};
