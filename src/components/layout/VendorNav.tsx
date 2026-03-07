"use client";
import { FC, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconGrid, IconServices, IconChat, IconUser, IconWrench, IconChevL } from "@/components/icons";

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
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("nav-collapsed") === "true";
    setCollapsed(saved);
    document.documentElement.dataset.navCollapsed = String(saved);
  }, []);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("nav-collapsed", String(next));
    document.documentElement.dataset.navCollapsed = String(next);
  };

  return (
    <nav className="nav-bot">
      {/* Brand header — desktop only */}
      <div className="nav-brand">
        <div className="nav-brand-logo" style={{ background: "var(--acc)" }}>
          <IconWrench style={{ width: 14, height: 14 }} />
        </div>
        <span className="nav-brand-name serif">HandyHub</span>
        <button className="nav-toggle-btn" onClick={toggle} aria-label="Toggle sidebar">
          <IconChevL style={{ width: 13, height: 13, transform: collapsed ? "rotate(180deg)" : "none", transition: "transform .25s" }} />
        </button>
      </div>

      {/* Nav items */}
      <div className="nav-items-wrap">
        {NAV_ITEMS.map((n) => {
          const active = pathname.startsWith(n.href);
          return (
            <Link key={n.href} href={n.href} className={`nav-item ${active ? "on" : ""}`} style={{ textDecoration: "none" }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                {n.icon}
              </div>
              <span className="nav-label">{n.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
