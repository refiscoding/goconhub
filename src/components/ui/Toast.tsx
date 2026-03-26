import { FC } from "react";
import type { ToastState } from "@/lib/types";

export const Toast: FC<ToastState> = ({ msg, type = "ok" }) => (
  <div
    className="toast"
    style={{
      color:
        type === "ok"  ? "var(--green)" :
        type === "err" ? "var(--red)"   : "var(--acc)",
    }}
  >
    {msg}
  </div>
);
