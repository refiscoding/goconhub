"use client";
import { FC, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, CalendarDays, CreditCard, Wrench,
  Users, LogOut, ShieldCheck, ChevronLeft,
  Tag, Settings, ShoppingBag, LifeBuoy,
} from "lucide-react";

interface AdminNavItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

interface AdminNavProps {
  tab: string;
  onTabChange: (tab: string) => void;
  pendingVendors?: number;
  openDisputes?: number;
  pendingPayments?: number;
  pendingOrders?: number;
  onLogout: () => void;
}

export const AdminNav: FC<AdminNavProps> = ({
  tab, onTabChange,
  pendingVendors = 0, openDisputes = 0, pendingPayments = 0, pendingOrders = 0,
  onLogout,
}) => {
  const pathname = usePathname();
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("admin-nav-collapsed") === "true";
      setCollapsed(saved);
      document.documentElement.dataset.navCollapsed = String(saved);
    } catch { /* private browsing */ }
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    try { localStorage.setItem("admin-nav-collapsed", String(next)); } catch { /* ignore */ }
    document.documentElement.dataset.navCollapsed = String(next);
  };

  const closeMobile = () => setMobileOpen(false);

  const NAV_ITEMS: AdminNavItem[] = [
    { key: "overview",  icon: <LayoutDashboard size={20} />, label: "Overview"  },
    { key: "bookings",  icon: <CalendarDays    size={20} />, label: "Bookings"  },
    { key: "payments",  icon: <CreditCard      size={20} />, label: "Payments",  badge: pendingPayments },
    { key: "vendors",   icon: <Wrench          size={20} />, label: "Vendors",   badge: pendingVendors  },
    { key: "users",     icon: <Users           size={20} />, label: "Users"     },
    { key: "categories",  icon: <Tag          size={20} />, label: "Categories"  },
    { key: "marketplace", icon: <ShoppingBag  size={20} />, label: "Marketplace", badge: pendingOrders },
    { key: "support",     icon: <LifeBuoy     size={20} />, label: "Support"     },
    { key: "settings",    icon: <Settings     size={20} />, label: "Settings"    },
  ];

  return (
    <>
      {/* Hamburger — mobile only */}
      <button
        className={`nav-hamburger${mobileOpen ? " nav-hamburger--hidden" : ""}`}
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
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
        {/* Brand */}
        <div className="nav-brand">
          <div className="nav-brand-logo" style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)" }}>
            <ShieldCheck size={14} color="#fff" />
          </div>
          <span className="nav-brand-name serif">Admin</span>
          <button className="nav-toggle-btn" onClick={toggle} aria-label="Toggle sidebar">
            <ChevronLeft
              size={13}
              style={{ transform: collapsed ? "rotate(180deg)" : "none", transition: "transform .25s" }}
            />
          </button>
          <button className="nav-close-btn" onClick={closeMobile} aria-label="Close menu">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="1" y1="1" x2="13" y2="13"/><line x1="13" y1="1" x2="1" y2="13"/>
            </svg>
          </button>
        </div>

        {/* Nav items */}
        <div className="nav-items-wrap">
          {NAV_ITEMS.map((n) => (
            <button
              key={n.key}
              className={`nav-item${tab === n.key ? " on" : ""}`}
              onClick={() => { onTabChange(n.key); closeMobile(); }}
            >
              <div style={{ position: "relative", flexShrink: 0 }}>
                {n.icon}
                {n.badge && n.badge > 0 ? (
                  <span style={{
                    position: "absolute", top: -5, right: -6,
                    background: "#F59E0B", color: "#1E1B4B",
                    fontSize: 9, fontWeight: 800, lineHeight: 1,
                    padding: "2px 4px", borderRadius: 999, minWidth: 14, textAlign: "center",
                  }}>{n.badge}</span>
                ) : null}
              </div>
              <span className="nav-label">{n.label}</span>
            </button>
          ))}
        </div>

        {/* Sign out */}
        <div className="nav-signout-wrap">
          <button className="nav-signout" onClick={onLogout}>
            <LogOut size={18} style={{ flexShrink: 0 }} />
            <span className="nav-label">Sign Out</span>
          </button>
        </div>
      </nav>
    </>
  );
};
