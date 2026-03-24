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
  <Box pb="20px" bg="white" h="100%" overflowY="auto">
    <Box pt="52px" px="20px" pb="16px">
      <Heading size="lg" letterSpacing="-0.03em" color="portal.text" fontWeight="800">
        Chats
      </Heading>
    </Box>

    {/* Search bar — pill shape */}
    <Box px="16px" pb="14px">
      <InputGroup size="md">
        <InputLeftElement pointerEvents="none" h="100%">
          <Search size={16} color="#A0AEC0" />
        </InputLeftElement>
        <Input
          placeholder="Search conversations"
          borderRadius="full"
          bg="gray.50"
          border="1px solid"
          borderColor="gray.100"
          _placeholder={{ color: "gray.400", fontSize: "14px" }}
          _focus={{ bg: "gray.100", boxShadow: "none", borderColor: "gray.200" }}
          fontSize="14px"
          h="42px"
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

    <Flex direction="column" px="10px" gap="2px">
      {chats.map((c) => {
        const isActive = c.id === activeChatId;
        const chatEl = (
          <Flex
            key={c.id}
            align="center"
            gap="14px"
            px="14px"
            py="14px"
            bg={isActive ? "portal.surface" : "transparent"}
            cursor="pointer"
            borderRadius="16px"
            _hover={{ bg: isActive ? "portal.surface" : "gray.50" }}
            transition="all 0.15s ease"
            onClick={() => onSelectChat?.(c.id)}
          >
            <Box position="relative" flexShrink={0}>
              <Avatar name={c.name} size={52} src={c.avatarUrl} />
              {c.unread > 0 && (
                <Box
                  position="absolute"
                  top="-2px"
                  right="-2px"
                  w="12px"
                  h="12px"
                  borderRadius="full"
                  bg="portal.primary"
                  border="2.5px solid white"
                />
              )}
            </Box>
            <Box flex="1" minW="0">
              <Flex justify="space-between" align="baseline" mb="3px">
                <Text
                  fontWeight={c.unread ? "700" : "600"}
                  fontSize="15px"
                  color="gray.800"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                  flex="1"
                  mr="8px"
                  letterSpacing="-0.01em"
                >
                  {c.name}
                </Text>
                <Text
                  fontSize="12px"
                  color={c.unread ? "portal.primary" : "gray.400"}
                  fontWeight={c.unread ? "600" : "400"}
                  flexShrink={0}
                >
                  {fmtRelative(c.time)}
                </Text>
              </Flex>
              <Flex align="center" gap="8px">
                <Text
                  flex="1"
                  fontSize="13.5px"
                  color={c.unread ? "gray.600" : "gray.400"}
                  overflow="hidden"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                  fontWeight={c.unread ? 500 : 400}
                  lineHeight="1.4"
                >
                  {c.lastMessage}
                </Text>
                {c.unread > 0 && (
                  <Badge
                    borderRadius="full"
                    px="7px"
                    py="2px"
                    fontSize="11px"
                    fontWeight="700"
                    bg="portal.primary"
                    color="white"
                    minW="22px"
                    textAlign="center"
                    boxShadow="0 2px 6px rgba(0,0,0,0.08)"
                  >
                    {c.unread}
                  </Badge>
                )}
              </Flex>
            </Box>
          </Flex>
        );

        if (onSelectChat) {
          return chatEl;
        }
        return (
          <Link key={c.id} href={c.href} style={{ textDecoration: "none", color: "inherit" }}>
            {chatEl}
          </Link>
        );
      })}
    </Flex>
  </Box>
);
