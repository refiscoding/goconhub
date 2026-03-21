"use client";
import { FC } from "react";
import { Box, Flex } from "@chakra-ui/react";
import { Avatar } from "@/components/ui";

interface TypingIndicatorProps {
  name?: string;
}

export const TypingIndicator: FC<TypingIndicatorProps> = ({ name = "" }) => (
  <Flex gap="6px" align="flex-end">
    <Avatar name={name} size={24} />
    <Box
      bg="white"
      borderRadius="10px 10px 10px 2px"
      boxShadow="0 1px 2px rgba(0,0,0,0.06)"
      px="14px"
      py="10px"
      display="flex"
      gap="4px"
      alignItems="center"
    >
      <Box className="typing-dot" w="6px" h="6px" borderRadius="50%" bg="gray.400" style={{ animationDelay: "0s" }} />
      <Box className="typing-dot" w="6px" h="6px" borderRadius="50%" bg="gray.400" style={{ animationDelay: "0.15s" }} />
      <Box className="typing-dot" w="6px" h="6px" borderRadius="50%" bg="gray.400" style={{ animationDelay: "0.3s" }} />
    </Box>
  </Flex>
);
