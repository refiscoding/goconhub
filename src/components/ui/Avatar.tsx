import { FC } from "react";

interface AvatarProps {
  name?: string;
  size?: number;
  src?: string | null;
}

export const Avatar: FC<AvatarProps> = ({ name = "", size = 40, src }) => {
  if (src) {
    return (
      <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: "1.5px solid var(--border)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    );
  }

  const initials = name
    .trim()
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const hue = (name.charCodeAt(0) * 37 + (name.charCodeAt(1) || 0) * 13) % 360;

  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: `hsl(${hue},50%,20%)`,
        border: `1.5px solid hsl(${hue},50%,32%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.36, fontWeight: 700,
        color: `hsl(${hue},75%,68%)`,
        flexShrink: 0, fontFamily: "'Fraunces',serif",
      }}
    >
      {initials || "?"}
    </div>
  );
};
