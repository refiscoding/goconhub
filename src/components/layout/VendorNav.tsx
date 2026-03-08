"use client";
import { FC, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { IconGrid, IconServices, IconChat, IconUser, IconWrench, IconChevL, IconLogout } from "@/components/icons";

interface NavItem { href: string; icon: React.ReactNode; label: string; }

const NAV_ITEMS: NavItem[] = [
  { href: "/vendor/dashboard", icon: <IconGrid     style={{ width: 20, height: 20 }} />, label: "Dashboard" },
  { href: "/vendor/services",  icon: <IconServices style={{ width: 20, height: 20 }} />, label: "Services"  },
  { href: "/vendor/messages",  icon: <IconChat     style={{ width: 20, height: 20 }} />, label: "Messages"  },
  { href: "/vendor/profile",   icon: <IconUser     style={{ width: 20, height: 20 }} />, label: "Profile"   },
];

interface VendorNavProps { unreadCount?: number; }

export const VendorNav: FC<VendorNavProps> = ({ unreadCount = 0 }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("nav-collapsed") === "true";
    setCollapsed(saved);
    document.documentElement.dataset.navCollapsed = String(saved);
  }, []);

  // Close drawer on route change
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
          <div className="nav-brand-logo" style={{ background: "var(--acc)" }}>
            <IconWrench style={{ width: 14, height: 14 }} />
          </div>
          <span className="nav-brand-name serif">HandyHub</span>
          {/* Desktop collapse toggle */}
          <button className="nav-toggle-btn" onClick={toggle} aria-label="Toggle sidebar">
            <IconChevL style={{ width: 13, height: 13, transform: collapsed ? "rotate(180deg)" : "none", transition: "transform .25s" }} />
          </button>
          {/* Mobile close button */}
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
            return (
              <Link key={n.href} href={n.href} className={`nav-item ${active ? "on" : ""}`} style={{ textDecoration: "none" }} onClick={closeMobile}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  {n.icon}
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
