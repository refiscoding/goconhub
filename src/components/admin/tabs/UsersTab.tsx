"use client";
import { FC, useState } from "react";
import {
  Box, Flex, Text, Badge, Button, ButtonGroup, Collapse, Divider,
  Card, CardBody,
} from "@chakra-ui/react";
import { Avatar } from "@/components/ui";
import type { AppUser } from "@/lib/types";

interface UsersTabProps {
  customers: AppUser[];
  onApprove: (id: string) => void;
  onSuspend: (id: string) => void;
  onDelete:  (id: string) => void;
}

const STATUS_SCHEME: Record<string, string> = {
  active: "green", suspended: "red", pending: "orange",
};

export const UsersTab: FC<UsersTabProps> = ({ customers, onApprove, onSuspend, onDelete }) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const toggle = (id: string) => setExpanded((prev) => (prev === id ? null : id));

  return (
    <Box className="page-enter">
      <Text fontFamily="'Sora', sans-serif" fontSize="22px" fontWeight="800"
        letterSpacing="-0.02em" color="var(--ink)" mb={5}>
        Customer Accounts
      </Text>

      {customers.length === 0 && (
        <Text textAlign="center" color="var(--ink3)" py={10}>No customers yet</Text>
      )}

      <Flex direction="column" gap={3}>
        {customers.map((u) => (
          <Card key={u.id} bg="var(--card)" borderRadius="14px" shadow="md">
            <CardBody p={4}>
              <Flex align="center" gap={3} mb={3}>
                <Avatar name={u.name} size={40} />
                <Box flex={1} minW={0}>
                  <Text fontWeight={700} fontSize="14px" color="var(--ink)" noOfLines={1}>{u.name}</Text>
                  <Text fontSize="12px" color="var(--ink2)" mt="2px" noOfLines={1}>{u.email}</Text>
                </Box>
                <Badge colorScheme={STATUS_SCHEME[u.status] ?? "gray"} borderRadius="full"
                  px={2} fontSize="11px" textTransform="capitalize">
                  {u.status}
                </Badge>
              </Flex>

              <Flex justify="space-between" fontSize="12px" color="var(--ink3)" mb={3}>
                <Text>Joined: {u.joined}</Text>
                <Text>{u.bookings} booking{u.bookings !== 1 ? "s" : ""}</Text>
              </Flex>

              <Collapse in={expanded === u.id} animateOpacity>
                <Divider borderColor="var(--border)" mb={3} />
                <Flex direction="column" gap={1} mb={3} fontSize="12px">
                  <Flex gap={2}>
                    <Text color="var(--ink3)" w="60px">Phone</Text>
                    <Text color="var(--ink)">{u.phone || "—"}</Text>
                  </Flex>
                  <Flex gap={2}>
                    <Text color="var(--ink3)" w="60px">Role</Text>
                    <Text color="var(--ink)" textTransform="capitalize">{u.role}</Text>
                  </Flex>
                  <Flex gap={2}>
                    <Text color="var(--ink3)" w="60px">ID</Text>
                    <Text color="var(--ink2)" fontFamily="'DM Mono', monospace" fontSize="11px">{u.id}</Text>
                  </Flex>
                </Flex>
              </Collapse>

              <ButtonGroup size="sm" spacing={2} w="100%">
                <Button flex={1} variant="outline" borderColor="var(--border)" color="var(--ink)"
                  fontSize="12px" onClick={() => toggle(u.id)}>
                  {expanded === u.id ? "Hide" : "View"}
                </Button>
                {u.status === "active" && (
                  <Button flex={1} colorScheme="gray" variant="outline" fontSize="12px"
                    onClick={() => onSuspend(u.id)}>
                    Suspend
                  </Button>
                )}
                {u.status === "suspended" && (
                  <Button flex={1} colorScheme="green" variant="outline" fontSize="12px"
                    onClick={() => onApprove(u.id)}>
                    Reactivate
                  </Button>
                )}
                <Button flex={1} colorScheme="red" variant="outline" fontSize="12px"
                  onClick={() => {
                    if (window.confirm(`Delete ${u.name}? This cannot be undone.`)) onDelete(u.id);
                  }}>
                  Delete
                </Button>
              </ButtonGroup>
            </CardBody>
          </Card>
        ))}
      </Flex>
    </Box>
  );
};
