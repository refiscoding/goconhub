"use client";
import { FC } from "react";
import Link from "next/link";
import { Box, Flex, Text, Heading, Input, InputGroup, InputLeftElement, Badge } from "@chakra-ui/react";
import { Search } from "lucide-react";
import { Avatar } from "@/components/ui";

interface ChatPreview {
  id: string;
  name: string;
  lastMessage: string;
  time?: string;
  unread: number;
  href: string;
  avatarUrl?: string | null;
}

function fmtRelative(iso?: string): string {
  if (!iso) return "";
  const now = new Date();
  const date = new Date(iso);
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min`;
  const isToday = now.toDateString() === date.toDateString();
  if (isToday) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (yesterday.toDateString() === date.toDateString()) return "Yesterday";
  const days = Math.floor(diff / 86400000);
  if (days < 7) return date.toLocaleDateString([], { weekday: "long" });
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

interface ChatListProps {
  chats: ChatPreview[];
  activeChatId?: string;
  onSelectChat?: (chatId: string) => void;
}

export const ChatList: FC<ChatListProps> = ({ chats, activeChatId, onSelectChat }) => (
  <Box pb="88px" bg="white" h="100%" overflowY="auto">
    <Box pt="52px" px="20px" pb="12px">
      <Heading size="lg" letterSpacing="-0.02em" color="portal.text">
        Chats
      </Heading>
    </Box>

    <Box px="16px" pb="10px" borderBottom="1px solid" borderColor="gray.100">
      <InputGroup size="sm">
        <InputLeftElement pointerEvents="none">
          <Search size={15} color="#A0AEC0" />
        </InputLeftElement>
        <Input
          placeholder="Search"
          borderRadius="8px"
          bg="gray.50"
          border="none"
          _placeholder={{ color: "gray.400" }}
          _focus={{ bg: "gray.100", boxShadow: "none" }}
          readOnly
        />
      </InputGroup>
    </Box>

    {chats.length === 0 && (
      <Box py="60px" px="28px" textAlign="center" color="gray.400">
        <Text fontSize="32px" mb="8px">💬</Text>
        <Text fontWeight="600">No conversations yet</Text>
      </Box>
    )}

    {chats.map((c, i) => {
      const isActive = c.id === activeChatId;
      const chatEl = (
        <Flex
          key={c.id}
          align="center"
          gap="13px"
          px="18px"
          py="12px"
          bg={isActive ? "portal.surface" : "white"}
          cursor="pointer"
          borderBottom={i < chats.length - 1 ? "1px solid" : "none"}
          borderColor="gray.100"
          _hover={{ bg: isActive ? "portal.surface" : "gray.50" }}
          transition="background 0.15s"
          onClick={() => onSelectChat?.(c.id)}
        >
          <Avatar name={c.name} size={50} src={c.avatarUrl} />
          <Box flex="1" minW="0">
            <Flex justify="space-between" align="baseline" mb="2px">
              <Text
                fontWeight="600"
                fontSize="16px"
                color="gray.800"
                overflow="hidden"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
                flex="1"
                mr="8px"
              >
                {c.name}
              </Text>
              <Text
                fontSize="12px"
                color={c.unread ? "portal.primary" : "gray.400"}
                fontWeight="400"
                flexShrink={0}
              >
                {fmtRelative(c.time)}
              </Text>
            </Flex>
            <Flex align="center" gap="6px">
              <Text
                flex="1"
                fontSize="14px"
                color={c.unread ? "gray.700" : "gray.400"}
                overflow="hidden"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
                fontWeight={c.unread ? 600 : 400}
              >
                {c.lastMessage}
              </Text>
              {c.unread > 0 && (
                <Badge
                  borderRadius="full"
                  px="6px"
                  py="1px"
                  fontSize="11px"
                  fontWeight="700"
                  bg="portal.primary"
                  color="white"
                  minW="20px"
                  textAlign="center"
                >
                  {c.unread}
                </Badge>
              )}
            </Flex>
          </Box>
        </Flex>
      );

      // On desktop with sidebar, clicking handles selection; on standalone pages, use Link
      if (onSelectChat) {
        return chatEl;
      }
      return (
        <Link key={c.id} href={c.href} style={{ textDecoration: "none", color: "inherit" }}>
          {chatEl}
        </Link>
      );
    })}
  </Box>
);
