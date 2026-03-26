"use client";
import { FC } from "react";
import { Box, Flex } from "@chakra-ui/react";

interface TypingIndicatorProps {
  name?: string;
}

export const TypingIndicator: FC<TypingIndicatorProps> = ({ name = "" }) => (
  <Flex gap="8px" align="flex-end">
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
      {name.charAt(0).toUpperCase() || "?"}
    </Box>
    <Box
      bg="white"
      borderRadius="22px 22px 22px 6px"
      boxShadow="0 2px 8px -1px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)"
      px="18px"
      py="14px"
      display="flex"
      gap="5px"
      alignItems="center"
    >
      <Box className="typing-dot" w="7px" h="7px" borderRadius="50%" bg="gray.300" style={{ animationDelay: "0s" }} />
      <Box className="typing-dot" w="7px" h="7px" borderRadius="50%" bg="gray.300" style={{ animationDelay: "0.15s" }} />
      <Box className="typing-dot" w="7px" h="7px" borderRadius="50%" bg="gray.300" style={{ animationDelay: "0.3s" }} />
    </Box>
  </Flex>
);
