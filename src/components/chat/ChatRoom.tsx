"use client";
import { FC, useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Box, Flex, Text, Input, IconButton } from "@chakra-ui/react";
import { ArrowLeft, Send, Sparkles, ShieldCheck } from "lucide-react";
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
  embedded?: boolean;
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
  title, subtitle, chatUserId, bookingIds, bookingId, initialMessages = [], quickReplies = [], backHref, avatarSrc, profileHref, embedded = false,
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
    <Flex
      direction="column"
      h={embedded ? "100%" : "100vh"}
      bg="#f8f9fb"
      position="relative"
      overflow="hidden"
    >
      {/* Header — frosted glass */}
      <Flex
        bg="portal.primary"
        pt={embedded ? "16px" : "50px"}
        px="20px"
        pb="16px"
        align="center"
        gap="12px"
        flexShrink={0}
        position="relative"
        zIndex={2}
        boxShadow="0 4px 20px -4px rgba(0,0,0,0.15)"
      >
        {!embedded && (
          <IconButton
            aria-label="Back"
            icon={<ArrowLeft size={20} />}
            variant="ghost"
            color="white"
            _hover={{ bg: "whiteAlpha.200" }}
            onClick={goBack}
            size="sm"
            borderRadius="full"
          />
        )}
        <Flex
          align="center"
          gap="12px"
          flex="1"
          cursor={profileHref ? "pointer" : "default"}
          onClick={() => profileHref && router.push(profileHref)}
        >
          <Box position="relative">
            <Avatar name={title} size={42} src={avatarSrc} />
            {/* Online dot */}
            <Box
              position="absolute"
              bottom="0px"
              right="0px"
              w="11px"
              h="11px"
              borderRadius="full"
              bg="#34d399"
              border="2px solid"
              borderColor="portal.primary"
            />
          </Box>
          <Box>
            <Text fontWeight="700" fontSize="16px" color="white" letterSpacing="-0.01em">{title}</Text>
            <Text fontSize="12px" color="whiteAlpha.700" fontWeight="500" mt="1px">{subtitle}</Text>
          </Box>
        </Flex>
      </Flex>

      {/* Safety banner — subtle glass card */}
      <Flex
        mx="16px"
        mt="12px"
        px="14px"
        py="10px"
        gap="10px"
        align="center"
        flexShrink={0}
        bg="white"
        borderRadius="14px"
        boxShadow="0 1px 4px rgba(0,0,0,0.04)"
        border="1px solid"
        borderColor="gray.100"
      >
        <Flex
          w="28px" h="28px" borderRadius="10px"
          bg="green.50" align="center" justify="center" flexShrink={0}
        >
          <ShieldCheck size={15} color="#22c55e" />
        </Flex>
        <Text fontSize="12px" color="gray.500" lineHeight="1.4">
          All payments must be made through GoCon for your protection.
        </Text>
      </Flex>

      {/* Messages area — subtle pattern bg */}
      <Flex
        flex="1"
        overflowY="auto"
        px="16px"
        pt="12px"
        pb="16px"
        direction="column"
        gap="8px"
        bg="#f8f9fb"
        css={{
          "&::-webkit-scrollbar": { width: "4px" },
          "&::-webkit-scrollbar-thumb": { background: "rgba(0,0,0,0.1)", borderRadius: "4px" },
        }}
      >
        {messages.length === 0 && (
          <Flex flex="1" align="center" justify="center" direction="column" gap="8px">
            <Flex
              w="56px" h="56px" borderRadius="18px"
              bg="white" boxShadow="0 2px 8px rgba(0,0,0,0.04)"
              align="center" justify="center"
            >
              <Sparkles size={24} color="#d1d5db" />
            </Flex>
            <Text textAlign="center" color="gray.400" fontSize="14px" fontWeight="500">
              No messages yet
            </Text>
            <Text textAlign="center" color="gray.300" fontSize="13px">
              Say hello to start the conversation
            </Text>
          </Flex>
        )}
        {messages.map((m) => {
          const dateLabel = m.createdAt ? fmtDateLabel(m.createdAt) : "";
          const showLabel = dateLabel && dateLabel !== lastDateLabel;
          if (showLabel) lastDateLabel = dateLabel;
          return (
            <Box key={m.id}>
              {showLabel && (
                <Flex justify="center" my="12px">
                  <Text
                    fontSize="11px"
                    color="gray.400"
                    bg="white"
                    px="14px"
                    py="5px"
                    borderRadius="full"
                    boxShadow="0 1px 4px rgba(0,0,0,0.04)"
                    fontWeight="600"
                    letterSpacing="0.02em"
                    textTransform="uppercase"
                  >
                    {dateLabel}
                  </Text>
                </Flex>
              )}
              <MessageBubble message={m} senderName={title} />
            </Box>
          );
        })}
        <Box ref={bottomRef} />
      </Flex>

      {/* Quick replies — modern chip style */}
      {showQR && quickReplies.length > 0 && (
        <Box
          bg="white"
          borderTop="1px solid"
          borderColor="gray.100"
          px="16px"
          py="14px"
          flexShrink={0}
        >
          <Text fontSize="10px" fontWeight="700" color="gray.400" textTransform="uppercase" letterSpacing="0.08em" mb="10px">
            Quick Replies
          </Text>
          <Flex flexWrap="wrap" gap="8px">
            {quickReplies.map((r, i) => (
              <Box
                as="button"
                key={i}
                onClick={() => send(r)}
                bg="gray.50"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="full"
                px="16px"
                py="8px"
                fontSize="13px"
                color="gray.600"
                cursor="pointer"
                fontWeight="500"
                _hover={{ bg: "gray.100", borderColor: "gray.300" }}
                transition="all 0.15s ease"
                whiteSpace="nowrap"
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
          mx="16px"
          mb="8px"
          p="16px"
          bg="white"
          borderRadius="16px"
          border="1px solid"
          borderColor="red.100"
          boxShadow="0 4px 12px rgba(239,68,68,0.08)"
          flexShrink={0}
        >
          <Text fontWeight="700" fontSize="14px" mb="6px" color="red.500">Contact info detected</Text>
          <Text fontSize="13px" color="gray.500" lineHeight="1.5" mb="14px">
            Sharing phone numbers, email addresses, or messaging app links is not allowed before a booking is confirmed.
          </Text>
          <Box
            as="button"
            onClick={() => { setPendingText(null); setTimeout(() => inputRef.current?.focus(), 50); }}
            w="100%"
            py="10px"
            borderRadius="12px"
            bg="gray.50"
            border="1px solid"
            borderColor="gray.200"
            fontWeight="600"
            fontSize="13px"
            cursor="pointer"
            color="gray.700"
            _hover={{ bg: "gray.100" }}
            transition="all 0.15s ease"
          >
            OK, edit my message
          </Box>
        </Box>
      )}

      {/* Input area — floating glass bar */}
      <Box px="12px" pb={embedded ? "12px" : "16px"} pt="8px" flexShrink={0} bg="#f8f9fb">
        <Flex
          bg="white"
          px="6px"
          py="6px"
          gap="8px"
          align="center"
          borderRadius="full"
          boxShadow="0 2px 12px -2px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)"
        >
          {quickReplies.length > 0 && (
            <IconButton
              aria-label="Quick replies"
              icon={<Sparkles size={16} />}
              onClick={() => setShowQR((v) => !v)}
              variant="ghost"
              color={showQR ? "portal.primary" : "gray.400"}
              borderRadius="full"
              size="sm"
              ml="4px"
              _hover={{ bg: "gray.50", color: "portal.primary" }}
              flexShrink={0}
            />
          )}
          <Input
            ref={inputRef}
            placeholder="Type a message..."
            value={input}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && send()}
            variant="unstyled"
            fontSize="14.5px"
            py="10px"
            px={quickReplies.length > 0 ? "4px" : "14px"}
            color="gray.800"
            _placeholder={{ color: "gray.400" }}
          />
          <IconButton
            aria-label="Send"
            icon={<Send size={16} />}
            onClick={() => send()}
            isDisabled={sending || !input.trim()}
            bg="portal.primary"
            color="white"
            borderRadius="full"
            size="sm"
            w="40px"
            h="40px"
            minW="40px"
            boxShadow="0 2px 8px rgba(0,0,0,0.1)"
            _hover={{ opacity: 0.9, transform: "scale(1.04)" }}
            _disabled={{ opacity: 0.35, cursor: "not-allowed", transform: "none" }}
            transition="all 0.2s ease"
            flexShrink={0}
          />
        </Flex>
      </Box>
    </Flex>
  );
};
