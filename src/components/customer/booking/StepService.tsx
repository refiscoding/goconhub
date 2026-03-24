import { FC } from "react";
import { Avatar, Stars } from "@/components/ui";
import { IconCheck } from "@/components/icons";
import type { Vendor, SelectedService } from "@/lib/types";
import { fmtPrice } from "@/lib/fmt";

interface StepServiceProps {
  vendor: Vendor;
  selected: SelectedService | null;
  onSelect: (s: SelectedService) => void;
}

export const StepService: FC<StepServiceProps> = ({ vendor, selected, onSelect }) => {
  // Use real DB services if available, else derive from tags
  const items = vendor.services && vendor.services.length > 0
    ? vendor.services.map((s) => ({ name: s.name, price: s.price, unit: s.unit }))
    : vendor.tags.map((tag, i) => ({ name: tag, price: vendor.price - i * 30, unit: vendor.unit }));

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="cust-card" style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px" }}>
        <Avatar name={vendor.name} size={46} />
        <div>
          <p style={{ fontWeight: 700, fontSize: 15 }}>{vendor.name}</p>
          <p style={{ fontSize: 13, color: "var(--ink2)", marginTop: 2 }}>
            {vendor.cat} · <Stars n={Math.round(vendor.rating)} /> {vendor.rating}
          </p>
        </div>
      </div>

      <h2 className="cust-heading" style={{ fontSize: 24 }}>Choose a service</h2>

      {items.map((item) => {
        const isSel = selected?.name === item.name;
        return (
          <div key={item.name} onClick={() => onSelect({ name: item.name, price: item.price })}
            style={{ padding: 16, borderRadius: 16, border: `2px solid ${isSel ? "#1A7A5E" : "var(--border)"}`, background: isSel ? "rgba(26,122,94,.06)" : "var(--card)", cursor: "pointer", transition: "all .2s", boxShadow: isSel ? "0 0 0 3px rgba(26,122,94,.12)" : "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15 }}>{item.name}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <p style={{ fontWeight: 800, color: "#1A7A5E", fontSize: 16 }}>{fmtPrice(item.price)}</p>
                {isSel && <IconCheck style={{ width: 20, height: 20, color: "#1A7A5E" }} />}
              </div>
            </div>
            <p style={{ fontSize: 12, color: "var(--ink2)", marginTop: 4 }}>per {item.unit}</p>
          </div>
        );
      })}
    </div>
  );
};
