"use client";
import { Spinner, Flex } from "@chakra-ui/react";

interface PageSpinnerProps {
  paddingY?: string | number;
  inline?: boolean;
}

export function PageSpinner({ paddingY = "80px", inline = false }: PageSpinnerProps) {
  if (inline) {
    return (
      <Spinner
        size={{ base: "sm", md: "md" }}
        color="#4A7CC7"
        thickness="3px"
        speed="0.65s"
      />
    );
  }
  return (
    <Flex justify="center" align="center" style={{ padding: `${paddingY} 0` }}>
      <Spinner
        size={{ base: "sm", md: "md" }}
        color="#4A7CC7"
        thickness="3px"
        speed="0.65s"
      />
    </Flex>
  );
}
