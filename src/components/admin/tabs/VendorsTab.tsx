"use client";
import { FC, useState } from "react";
import {
  Box, Flex, Text, Badge, Button, ButtonGroup, Collapse, Divider,
  Card, CardBody,
} from "@chakra-ui/react";
import { CircleCheck, X, ShieldCheck, CircleDot, CircleCheckBig } from "lucide-react";
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

const Row: FC<{ label: string; value?: string | null; mono?: boolean }> = ({ label, value, mono }) => (
  <Flex gap={2} fontSize="12px">
    <Text color="var(--ink3)" minW="90px" flexShrink={0}>{label}</Text>
    <Text color="var(--ink)" fontFamily={mono ? "'DM Mono', monospace" : undefined} fontSize={mono ? "11px" : "12px"}>
      {value || "—"}
    </Text>
  </Flex>
);

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
        {vendors.map((v) => {
          const isIndividual = !v.entityType || v.entityType === "individual";
          const hasDoc = isIndividual ? !!v.idDocumentUrl : !!v.cipaDocumentUrl;
          const docLabel = isIndividual ? "Omang / Passport" : "CIPA Certificate";

          return (
            <Card key={v.id} bg="var(--card)" borderRadius="14px" shadow="md">
              <CardBody p={4}>
                {/* Header row */}
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

                {/* Meta row */}
                <Flex justify="space-between" fontSize="12px" color="var(--ink3)" mb={3}>
                  <Text>Joined: {v.joined}</Text>
                  <Text>{v.bookings} booking{v.bookings !== 1 ? "s" : ""}</Text>
                </Flex>

                {/* Identity & verification status */}
                <Flex align="center" gap={2} mb={hasDoc ? 2 : 3}>
                  {hasDoc
                    ? <CircleCheck size={15} color="#50fb64" />
                    : <X size={15} color="#f31212" />}
                  <Text fontSize="12px" fontWeight={600} color={hasDoc ? "#50fb64" : "#f31212"}>
                    {docLabel}
                  </Text>
                  <Box flex={1} />
                  {v.verified
                    ? <Flex align="center" gap={1}><CircleCheckBig size={14} color="#449235" /><Text fontSize="11px" fontWeight={700} color="#449235">Verified</Text></Flex>
                    : <Flex align="center" gap={1}><CircleDot size={14} color="#d1aa1f" /><Text fontSize="11px" fontWeight={700} color="#d1aa1f">Pending</Text></Flex>}
                </Flex>

                {/* Expanded details */}
                <Collapse in={expanded === v.id} animateOpacity>
                  <Divider borderColor="var(--border)" mb={3} />
                  <Flex direction="column" gap="8px" mb={3}>
                    <Row label="Phone"    value={v.phone} />
                    <Row label="Category" value={v.category} />
                    <Row label="Location" value={v.location} />
                    <Row label="Entity"   value={v.entityType ?? "individual"} />
                    {!isIndividual && (
                      <>
                        <Row label="Company"  value={v.companyName} />
                        <Row label="Reg. No." value={v.companyRegNumber} />
                      </>
                    )}
                    <Divider borderColor="var(--border)" my={1} />
                    <Row label="Bank"     value={v.bankName} />
                    <Row label="Acct No." value={v.accountNumber} mono />
                    <Divider borderColor="var(--border)" my={1} />

                    {/* Identity document */}
                    <Text fontSize="11px" fontWeight={700} color="var(--ink3)"
                      textTransform="uppercase" letterSpacing=".06em" mb={1}>
                      {docLabel}
                    </Text>
                    {(() => {
                      const docUrl = isIndividual ? v.idDocumentUrl : v.cipaDocumentUrl;
                      if (!docUrl) {
                        return (
                          <Flex align="center" gap={2} bg="var(--bg2)" borderRadius="8px" p={3}>
                            <X size={14} color="var(--red)" />
                            <Text fontSize="12px" color="var(--ink3)">No document uploaded yet</Text>
                          </Flex>
                        );
                      }
                      const isPdf = docUrl.startsWith("data:application/pdf") || docUrl.startsWith("data:application/octet");
                      if (isPdf) {
                        return (
                          <Flex align="center" gap={2} bg="var(--bg2)" borderRadius="8px" p={3}>
                            <CircleCheck size={14} color="var(--green)" />
                            <Text fontSize="12px" color="var(--ink)" flex={1}>PDF document uploaded</Text>
                            <a href={docUrl} download={`${v.name.replace(/\s+/g,"-")}-doc.pdf`}
                              style={{ fontSize: 11, fontWeight: 700, color: "var(--acc)", textDecoration: "none" }}>
                              Download
                            </a>
                          </Flex>
                        );
                      }
                      return (
                        <Box borderRadius="10px" overflow="hidden" border="1px solid var(--border)" position="relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={docUrl} alt={docLabel}
                            style={{ width: "100%", maxHeight: 220, objectFit: "cover", display: "block" }} />
                          <Flex position="absolute" bottom={0} left={0} right={0}
                            bg="rgba(0,0,0,.55)" px={3} py={2} justify="space-between" align="center">
                            <Text fontSize="11px" color="rgba(255,255,255,.8)" fontWeight={600}>{docLabel}</Text>
                            <a href={docUrl} target="_blank" rel="noreferrer"
                              style={{ fontSize: 11, fontWeight: 700, color: "#fff", textDecoration: "none",
                                background: "rgba(255,255,255,.2)", borderRadius: 6, padding: "3px 10px" }}>
                              Full View
                            </a>
                          </Flex>
                        </Box>
                      );
                    })()}

                    <Divider borderColor="var(--border)" my={1} />
                    <Row label="User ID"  value={v.id} mono />
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
                  {!v.verified && (
                    <Button flex={1} colorScheme="teal" variant="outline" fontSize="12px"
                      leftIcon={<ShieldCheck size={13} />}
                      onClick={() => { if (window.confirm(`Verify ${v.name}?`)) onVerify(v.id); }}>
                      Verify
                    </Button>
                  )}
                  {v.verified && (
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
          );
        })}
      </Flex>
    </Box>
  );
};
