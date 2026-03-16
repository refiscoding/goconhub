"use client";
import { FC, useState } from "react";
import {
  Box, Flex, Text, Badge, Button, ButtonGroup, Collapse, Divider,
  Card, CardBody,
} from "@chakra-ui/react";
import { CircleCheck, X, ShieldCheck } from "lucide-react";
import { Avatar } from "@/components/ui";
import type { AppUser } from "@/lib/types";

interface VendorsTabProps {
  vendors: AppUser[];
  onApprove: (id: string) => void;
  onSuspend: (id: string) => void;
  onDelete:  (id: string) => void;
  onVerify:  (id: string) => void;
}

const STATUS_SCHEME: Record<string, string> = {
  active: "green", suspended: "red", pending: "orange",
};

export const VendorsTab: FC<VendorsTabProps> = ({ vendors, onApprove, onSuspend, onDelete, onVerify }) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const toggle = (id: string) => setExpanded((prev) => (prev === id ? null : id));

  const pending = vendors.filter((v) => v.status === "pending");

  return (
    <Box className="page-enter">
      <Text fontFamily="'Sora', sans-serif" fontSize="22px" fontWeight="800"
        letterSpacing="-0.02em" color="var(--ink)" mb={5}>
        Vendor Management
      </Text>

      {pending.length > 0 && (
        <Box bg="var(--amber-bg)" border="1px solid rgba(251,191,36,.2)"
          borderRadius="12px" px={4} py={3} mb={4} fontSize="13px"
          color="var(--amber)" fontWeight={600}>
          {pending.length} vendor{pending.length > 1 ? "s" : ""} awaiting approval
        </Box>
      )}

      {vendors.length === 0 && (
        <Text textAlign="center" color="var(--ink3)" py={10}>No vendors yet</Text>
      )}

      <Flex direction="column" gap={3}>
        {vendors.map((v) => (
          <Card key={v.id} bg="var(--card)" borderRadius="14px" shadow="md">
            <CardBody p={4}>
              <Flex align="center" gap={3} mb={3}>
                <Avatar name={v.name} size={40} />
                <Box flex={1} minW={0}>
                  <Text fontWeight={700} fontSize="14px" color="var(--ink)" noOfLines={1}>{v.name}</Text>
                  <Text fontSize="12px" color="var(--ink2)" mt="2px" noOfLines={1}>{v.email}</Text>
                </Box>
                <Badge colorScheme={STATUS_SCHEME[v.status] ?? "gray"} borderRadius="full"
                  px={2} fontSize="11px" textTransform="capitalize">
                  {v.status}
                </Badge>
              </Flex>

              <Flex justify="space-between" fontSize="12px" color="var(--ink3)" mb={3}>
                <Text>Joined: {v.joined}</Text>
                <Text>{v.bookings} booking{v.bookings !== 1 ? "s" : ""}</Text>
              </Flex>

              {/* Identity verification badge */}
              {v.role === "vendor" && (() => {
                const isIndividual = !v.entityType || v.entityType === "individual";
                const hasDoc = isIndividual ? !!v.idDocumentUrl : !!v.cipaDocumentUrl;
                const label  = isIndividual ? "Identity Verification" : "Company Certificate";
                return (
                  <Flex align="center" gap={2} mb={3}>
                    {hasDoc
                      ? <CircleCheck size={15} color="#50fb64" />
                      : <X size={15} color="#f31212" />}
                    <Text fontSize="12px" fontWeight={600} color={hasDoc ? "#50fb64" : "#f31212"}>
                      {label}
                    </Text>
                  </Flex>
                );
              })()}

              <Collapse in={expanded === v.id} animateOpacity>
                <Divider borderColor="var(--border)" mb={3} />
                <Flex direction="column" gap={1} mb={3} fontSize="12px">
                  <Flex gap={2}>
                    <Text color="var(--ink3)" w="60px">Phone</Text>
                    <Text color="var(--ink)">{v.phone || "—"}</Text>
                  </Flex>
                  <Flex gap={2}>
                    <Text color="var(--ink3)" w="60px">Role</Text>
                    <Text color="var(--ink)" textTransform="capitalize">{v.role}</Text>
                  </Flex>
                  <Flex gap={2}>
                    <Text color="var(--ink3)" w="60px">ID</Text>
                    <Text color="var(--ink2)" fontFamily="'DM Mono', monospace" fontSize="11px">{v.id}</Text>
                  </Flex>
                  <Flex gap={2}>
                    <Text color="var(--ink3)" w="60px">Type</Text>
                    <Text color="var(--ink)" textTransform="capitalize">{v.entityType ?? "individual"}</Text>
                  </Flex>
                </Flex>
              </Collapse>

              <ButtonGroup size="sm" spacing={2} w="100%" flexWrap="wrap">
                <Button flex={1} variant="outline" borderColor="var(--border)" color="var(--ink)"
                  fontSize="12px" onClick={() => toggle(v.id)}>
                  {expanded === v.id ? "Hide" : "View"}
                </Button>
                {v.status === "pending" && (
                  <Button flex={1} colorScheme="green" variant="outline" fontSize="12px"
                    onClick={() => onApprove(v.id)}>
                    Approve
                  </Button>
                )}
                {v.status === "active" && (
                  <Button flex={1} colorScheme="orange" variant="outline" fontSize="12px"
                    onClick={() => onSuspend(v.id)}>
                    Suspend
                  </Button>
                )}
                {v.status === "suspended" && (
                  <Button flex={1} colorScheme="green" variant="outline" fontSize="12px"
                    onClick={() => onApprove(v.id)}>
                    Reactivate
                  </Button>
                )}
                {v.role === "vendor" && !v.verified && (
                  <Button flex={1} colorScheme="teal" variant="outline" fontSize="12px"
                    leftIcon={<ShieldCheck size={13} />}
                    onClick={() => { if (window.confirm(`Verify ${v.name}?`)) onVerify(v.id); }}>
                    Verify
                  </Button>
                )}
                {v.role === "vendor" && v.verified && (
                  <Button flex={1} variant="outline" fontSize="12px" isDisabled
                    leftIcon={<ShieldCheck size={13} />}
                    borderColor="var(--green)" color="var(--green)">
                    Verified
                  </Button>
                )}
                <Button flex={1} colorScheme="red" variant="outline" fontSize="12px"
                  onClick={() => {
                    if (window.confirm(`Delete ${v.name}? This cannot be undone.`)) onDelete(v.id);
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
