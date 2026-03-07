import { FC } from "react";
import { Avatar } from "@/components/ui";
import type { Message } from "@/lib/types";

interface MessageBubbleProps {
  message: Message;
  senderName?: string;
}

export const MessageBubble: FC<MessageBubbleProps> = ({ message, senderName = "" }) => (
  <div style={{ display: "flex", justifyContent: message.from === "me" ? "flex-end" : "flex-start", gap: 8, alignItems: "flex-end" }}>
    {message.from !== "me" && <Avatar name={senderName} size={26} />}
    <div>
      <div className={message.from === "me" ? "bubble-me" : "bubble-them"}
        style={{ padding: "10px 14px", maxWidth: 260, fontSize: 14, lineHeight: 1.55 }}>
        {message.text}
      </div>
      <p style={{ fontSize: 10, color: "var(--ink3)", marginTop: 3, textAlign: message.from === "me" ? "right" : "left" }}>
        {message.time}
      </p>
    </div>
  </div>
);
