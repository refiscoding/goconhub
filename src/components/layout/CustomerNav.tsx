"use client";
import { FC, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconSearch, IconChat, IconUser, IconWrench, IconChevL, IconServices } from "@/components/icons";

interface NavItem { href: string; icon: React.ReactNode; label: string; }

const NAV_ITEMS: NavItem[] = [
  { href: "/customer/explore",  icon: <IconSearch   style={{ width: 20, height: 20 }} />, label: "Explore"  },
  { href: "/customer/bookings", icon: <IconServices style={{ width: 20, height: 20 }} />, label: "Bookings" },
  { href: "/customer/messages", icon: <IconChat     style={{ width: 20, height: 20 }} />, label: "Messages" },
  { href: "/customer/profile",  icon: <IconUser     style={{ width: 20, height: 20 }} />, label: "Profile"  },
];

interface CustomerNavProps { unreadCount?: number; }

export const CustomerNav: FC<CustomerNavProps> = ({ unreadCount = 0 }) => {
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
        <div className="nav-brand-logo" style={{ background: "#d97706" }}>
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
