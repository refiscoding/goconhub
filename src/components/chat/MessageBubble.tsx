"use client";
import { FC } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { Avatar } from "@/components/ui";
import type { Message } from "@/lib/types";

const MotionBox = motion(Box);

interface MessageBubbleProps {
  message: Message;
  senderName?: string;
}

function readStatus(msg: Message): string | null {
  if (msg.from !== "me") return null;
  // For now treat all sent messages as "Sent" — upgrade when read receipts exist
  return "Sent";
}

export const MessageBubble: FC<MessageBubbleProps> = ({ message, senderName = "" }) => {
  const isMe = message.from === "me";
  const status = readStatus(message);

  return (
    <MotionBox
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Flex justify={isMe ? "flex-end" : "flex-start"} gap="6px" align="flex-end">
        {!isMe && <Avatar name={senderName} size={24} />}
        <Box
          maxW="280px"
          px="10px"
          pt="8px"
          pb="6px"
          bg={isMe ? "portal.primary" : "white"}
          color={isMe ? "white" : "portal.text"}
          borderRadius={isMe ? "10px 10px 2px 10px" : "10px 10px 10px 2px"}
          boxShadow="0 1px 2px rgba(0,0,0,0.06)"
          fontSize="14px"
          lineHeight="1.5"
        >
          <Text as="span">{message.text}</Text>
          <Flex
            as="span"
            float="right"
            ml="8px"
            mt="4px"
            align="center"
            gap="4px"
            fontSize="11px"
            color={isMe ? "whiteAlpha.700" : "gray.400"}
            lineHeight="1"
          >
            <Text as="span">{message.time}</Text>
            {status && (
              <Text as="span" fontWeight="500" fontSize="10px">
                {status}
              </Text>
            )}
          </Flex>
        </Box>
      </Flex>
    </MotionBox>
  );
};
