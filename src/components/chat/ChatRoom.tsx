"use client";
import { FC, useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Box, Flex, Text, Input, IconButton, useBreakpointValue } from "@chakra-ui/react";
import { ArrowLeft, Send } from "lucide-react";
import { Avatar } from "@/components/ui";
import { MessageBubble } from "./MessageBubble";
import { useUser } from "@/context/UserContext";
import type { Message } from "@/lib/types";

const CONTACT_RE = /(\b\d[\d\s\-().+]{6,}\d\b|[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}|whatsapp|wa\.me|telegram|@\w{3,})/i;

interface ChatRoomProps {
  title: string;
  subtitle: string;
  chatUserId?: string;
  bookingIds?: string[];
  bookingId?: string;
  initialMessages?: Message[];
  quickReplies?: string[];
  backHref?: string;
  avatarSrc?: string | null;
  profileHref?: string;
}

function markRead(key: string, count: number) {
  try { localStorage.setItem(`hh_seen_${key}`, String(count)); } catch { /* ignore */ }
}

function fmtDateLabel(iso: string): string {
  const now = new Date();
  const date = new Date(iso);
  if (now.toDateString() === date.toDateString()) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (yesterday.toDateString() === date.toDateString()) return "Yesterday";
  const days = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (days < 7) return date.toLocaleDateString([], { weekday: "long" });
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export const ChatRoom: FC<ChatRoomProps> = ({
  title, subtitle, chatUserId, bookingIds, bookingId, initialMessages = [], quickReplies = [], backHref, avatarSrc, profileHref,
}) => {
  const router = useRouter();
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [activeBookingId, setActiveBookingId] = useState<string | undefined>(bookingId);
  const [input, setInput] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [sending, setSending] = useState(false);
  const [pendingText, setPendingText] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useBreakpointValue({ base: true, md: false }, { fallback: "base" });

  useEffect(() => {
    const myId = user?.id;
    if (!myId) return;

    let url: string;
    if (chatUserId) {
      url = `/api/messages?userId=${chatUserId}`;
    } else if (bookingId) {
      url = `/api/messages?bookingId=${bookingId}`;
    } else {
      return;
    }

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        const msgs: Message[] = (data.messages ?? []).map((m: {
          id: string; text: string; createdAt: string;
          sender: { id: string };
        }) => ({
          id: m.id,
          from: m.sender.id === myId ? "me" : "them",
          text: m.text,
          time: new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          createdAt: m.createdAt,
        }));
        setMessages(msgs);

        if (data.bookingIds?.length) {
          setActiveBookingId(data.bookingIds[0]);
        }

        const readKey = chatUserId ?? bookingId ?? "";
        if (readKey) markRead(readKey, msgs.length);
      })
      .catch(() => {});
  }, [chatUserId, bookingId, user?.id]);

  useEffect(() => {
    if (bookingIds?.length && !activeBookingId) {
      setActiveBookingId(bookingIds[0]);
    }
  }, [bookingIds, activeBookingId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const doSend = async (t: string) => {
    if (!t || sending || !activeBookingId) return;
    setShowQR(false);
    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: activeBookingId, text: t }),
      });
      if (res.ok) {
        const data = await res.json();
        const m = data.message;
        const now = m.createdAt ?? new Date().toISOString();
        setMessages((prev) => {
          const next = [
            ...prev,
            {
              id: m.id,
              from: "me" as const,
              text: m.text,
              time: new Date(now).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              createdAt: now,
            },
          ];
          const readKey = chatUserId ?? activeBookingId;
          markRead(readKey, next.length);
          return next;
        });
      }
    } catch { /* ignore */ } finally { setSending(false); }
  };

  const send = (text?: string) => {
    const t = text ?? input.trim();
    if (!t || sending) return;
    if (CONTACT_RE.test(t)) {
      setPendingText(t);
      return;
    }
    setInput("");
    doSend(t);
  };

  const goBack = () => backHref ? router.push(backHref) : router.back();

  let lastDateLabel = "";

  return (
    <Flex direction="column" h="100vh" bg="gray.50" position="relative">
      {/* Header */}
      <Flex
        bg="portal.primary"
        pt="50px"
        px="14px"
        pb="12px"
        align="center"
        gap="10px"
        position="sticky"
        top="0"
        zIndex={50}
        boxShadow="sm"
      >
        <IconButton
          aria-label="Back"
          icon={<ArrowLeft size={22} />}
          variant="ghost"
          color="white"
          _hover={{ bg: "whiteAlpha.200" }}
          onClick={goBack}
          size="sm"
        />
        <Flex
          align="center"
          gap="10px"
          flex="1"
          cursor={profileHref ? "pointer" : "default"}
          onClick={() => profileHref && router.push(profileHref)}
        >
          <Avatar name={title} size={38} src={avatarSrc} />
          <Box>
            <Text fontWeight="700" fontSize="15px" color="white">{title}</Text>
            <Text fontSize="11px" color="whiteAlpha.700" fontWeight="500" mt="1px">{subtitle}</Text>
          </Box>
        </Flex>
      </Flex>

      {/* Safety banner */}
      <Flex bg="yellow.50" borderBottom="1px solid" borderColor="yellow.300" px="18px" py="8px" gap="8px" align="flex-start">
        <Text fontSize="13px" flexShrink={0}>🛡️</Text>
        <Text fontSize="12px" color="yellow.800" lineHeight="1.5">
          For your safety, all payments must be made through HandyHub. Payments made outside the platform are not protected.
        </Text>
      </Flex>

      {/* Messages area */}
      <Box
        flex="1"
        overflowY="auto"
        px="18px"
        pt="16px"
        pb="80px"
        display="flex"
        flexDirection="column"
        gap="6px"
        bg="gray.50"
      >
        {messages.length === 0 && (
          <Text textAlign="center" color="gray.400" fontSize="13px" mt="40px">
            No messages yet. Say hello!
          </Text>
        )}
        {messages.map((m) => {
          const dateLabel = m.createdAt ? fmtDateLabel(m.createdAt) : "";
          const showLabel = dateLabel && dateLabel !== lastDateLabel;
          if (showLabel) lastDateLabel = dateLabel;
          return (
            <Box key={m.id}>
              {showLabel && (
                <Flex justify="center" my="8px">
                  <Text
                    fontSize="12px"
                    color="gray.500"
                    bg="white"
                    px="14px"
                    py="4px"
                    borderRadius="8px"
                    boxShadow="0 1px 2px rgba(0,0,0,0.06)"
                    fontWeight="500"
                  >
                    {dateLabel}
                  </Text>
                </Flex>
              )}
              <MessageBubble message={m} senderName={title} />
            </Box>
          );
        })}
        <div ref={bottomRef} />
      </Box>

      {/* Quick replies */}
      {showQR && quickReplies.length > 0 && (
        <Box
          position="absolute"
          bottom="68px"
          left="0"
          right="0"
          bg="white"
          borderTop="1px solid"
          borderColor="gray.200"
          p="12px 14px"
          zIndex={60}
          borderRadius="12px 12px 0 0"
          boxShadow="lg"
        >
          <Text fontSize="10px" fontWeight="700" color="portal.primary" textTransform="uppercase" letterSpacing="0.06em" mb="8px">
            Quick Replies
          </Text>
          <Flex direction="column" gap="6px" maxH="180px" overflowY="auto">
            {quickReplies.map((r, i) => (
              <Box
                as="button"
                key={i}
                onClick={() => send(r)}
                textAlign="left"
                bg="gray.50"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="10px"
                px="12px"
                py="9px"
                fontSize="13px"
                color="gray.700"
                cursor="pointer"
                _hover={{ bg: "gray.100" }}
                transition="background 0.15s"
              >
                {r}
              </Box>
            ))}
          </Flex>
        </Box>
      )}

      {/* Contact info warning */}
      {pendingText && (
        <Box
          position="absolute"
          bottom="68px"
          left="14px"
          right="14px"
          bg="white"
          border="1px solid"
          borderColor="red.200"
          borderRadius="12px"
          p="14px 16px"
          zIndex={70}
          boxShadow="xl"
        >
          <Text fontWeight="700" fontSize="14px" mb="4px" color="red.500">⚠️ Contact info detected</Text>
          <Text fontSize="13px" color="gray.600" lineHeight="1.5" mb="12px">
            Sharing phone numbers, email addresses, or messaging app links is not allowed before a booking is confirmed.
          </Text>
          <Box
            as="button"
            onClick={() => { setPendingText(null); setTimeout(() => inputRef.current?.focus(), 50); }}
            w="100%"
            py="9px"
            borderRadius="8px"
            bg="gray.50"
            border="1px solid"
            borderColor="gray.200"
            fontWeight="600"
            fontSize="13px"
            cursor="pointer"
            color="gray.700"
            _hover={{ bg: "gray.100" }}
          >
            OK, edit my message
          </Box>
        </Box>
      )}

      {/* Input area */}
      <Flex
        bg="white"
        px="10px"
        pt="8px"
        pb="12px"
        gap="8px"
        align="flex-end"
        zIndex={55}
        borderTop="1px solid"
        borderColor="gray.100"
        flexShrink={0}
      >
        {quickReplies.length > 0 && (
          <IconButton
            aria-label="Quick replies"
            icon={<Text fontSize="16px">⚡</Text>}
            onClick={() => setShowQR((v) => !v)}
            variant={showQR ? "solid" : "outline"}
            colorScheme={showQR ? "blue" : "gray"}
            borderRadius="full"
            size="md"
            flexShrink={0}
          />
        )}
        <Flex
          flex="1"
          align="flex-end"
          bg="gray.50"
          borderRadius="22px"
          border="1px solid"
          borderColor="gray.200"
          px="14px"
        >
          <Input
            ref={inputRef}
            placeholder="Message"
            value={input}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && send()}
            variant="unstyled"
            fontSize="15px"
            py="10px"
            color="gray.800"
          />
        </Flex>
        <IconButton
          aria-label="Send"
          icon={<Send size={18} />}
          onClick={() => send()}
          isDisabled={sending}
          colorScheme="blue"
          bg="portal.primary"
          color="white"
          borderRadius="full"
          size="md"
          boxShadow="sm"
          _hover={{ opacity: 0.9 }}
          flexShrink={0}
        />
      </Flex>
    </Flex>
  );
};
