"use client";
import { FC } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { Message } from "@/lib/types";

const MotionBox = motion(Box);

interface MessageBubbleProps {
  message: Message;
  senderName?: string;
}

export const MessageBubble: FC<MessageBubbleProps> = ({ message, senderName = "" }) => {
  const isMe = message.from === "me";

  return (
    <MotionBox
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 25 }}
    >
      <Flex justify={isMe ? "flex-end" : "flex-start"} align="flex-end" gap="8px">
        {/* Sender initial for received messages */}
        {!isMe && (
          <Box
            w="28px"
            h="28px"
            borderRadius="full"
            bg="gray.100"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="11px"
            fontWeight="700"
            color="gray.500"
            flexShrink={0}
            mb="2px"
          >
            {senderName.charAt(0).toUpperCase()}
          </Box>
        )}

        <Box
          maxW={{ base: "78%", md: "420px" }}
          px="16px"
          py="12px"
          bg={isMe ? "portal.primary" : "white"}
          color={isMe ? "white" : "gray.800"}
          borderRadius={isMe ? "22px 22px 6px 22px" : "22px 22px 22px 6px"}
          boxShadow={
            isMe
              ? "0 4px 14px -2px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.08)"
              : "0 2px 8px -1px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)"
          }
          fontSize="14.5px"
          lineHeight="1.55"
          letterSpacing="-0.006em"
          position="relative"
          transition="transform 0.15s ease"
          _hover={{ transform: "translateY(-1px)" }}
        >
          <Text as="span" wordBreak="break-word">{message.text}</Text>
          <Flex
            as="span"
            float="right"
            ml="10px"
            mt="4px"
            align="center"
            gap="3px"
            fontSize="11px"
            color={isMe ? "whiteAlpha.700" : "gray.400"}
            lineHeight="1"
            userSelect="none"
          >
            <Text as="span">{message.time}</Text>
            {isMe && <Check size={13} strokeWidth={2.5} style={{ opacity: 0.7 }} />}
          </Flex>
        </Box>
      </Flex>
    </MotionBox>
  );
};
