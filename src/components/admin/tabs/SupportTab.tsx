"use client";
import { FC, useState, useEffect, useCallback } from "react";
import {
  Box, Flex, Text, Badge, Textarea, Button, Collapse, Divider,
  Card, CardBody, Select,
} from "@chakra-ui/react";
import { LifeBuoy, ChevronDown, ChevronUp, Save } from "lucide-react";
import type { SupportTicket, TicketStatus } from "@/lib/types";

const STATUS_SCHEME: Record<TicketStatus, string> = {
  open: "red", in_progress: "orange", resolved: "green",
};
const STATUS_LABEL: Record<TicketStatus, string> = {
  open: "Open", in_progress: "In Progress", resolved: "Resolved",
};
const ISSUE_LABEL: Record<string, string> = {
  billing: "Billing & Payments", booking: "Booking Issue",
  account: "Account Access", verification: "Vendor Verification", other: "Other",
};

interface RowProps { tickets: SupportTicket[]; onUpdate: (id: string, status: TicketStatus, note: string) => Promise<void> }

const TicketRow: FC<{ ticket: SupportTicket; onUpdate: RowProps["onUpdate"] }> = ({ ticket, onUpdate }) => {
  const [open,   setOpen]   = useState(false);
  const [status, setStatus] = useState<TicketStatus>(ticket.status);
  const [note,   setNote]   = useState(ticket.adminNote ?? "");
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const save = async () => {
    setSaving(true);
    await onUpdate(ticket.id, status, note);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const dirty = status !== ticket.status || note !== (ticket.adminNote ?? "");

  return (
    <Card bg="var(--card)" borderRadius="12px" shadow="sm" border="1px solid var(--border)">
      <CardBody p={0}>
        {/* Summary row — always visible */}
        <Flex
          align="center" gap={3} px={4} py={3} cursor="pointer"
          onClick={() => setOpen((o) => !o)}
          _hover={{ bg: "var(--bg2)" }}
          borderRadius={open ? "12px 12px 0 0" : "12px"}
          transition="background .14s"
        >
          <Box flex={1} minW={0}>
            <Flex align="center" gap={2} flexWrap="wrap">
              <Text fontSize="13px" fontWeight={700} color="var(--ink)" noOfLines={1}>{ticket.name}</Text>
              <Text fontSize="11px" color="var(--ink3)">{ticket.email}</Text>
            </Flex>
            <Flex align="center" gap={2} mt={1} flexWrap="wrap">
              <Badge
                fontSize="10px" borderRadius="full" px={2} textTransform="capitalize"
                colorScheme={STATUS_SCHEME[ticket.status]}
              >
                {STATUS_LABEL[ticket.status]}
              </Badge>
              <Text fontSize="11px" color="var(--ink3)">{ISSUE_LABEL[ticket.issueType] ?? ticket.issueType}</Text>
              <Text fontSize="11px" color="var(--ink3)">·</Text>
              <Text fontSize="11px" color="var(--ink3)" textTransform="capitalize">{ticket.role}</Text>
            </Flex>
          </Box>
          <Flex align="center" gap={2} flexShrink={0}>
            <Text fontSize="11px" color="var(--ink3)" display={{ base: "none", sm: "block" }}>
              {new Date(ticket.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            </Text>
            {open ? <ChevronUp size={15} color="var(--ink3)" /> : <ChevronDown size={15} color="var(--ink3)" />}
          </Flex>
        </Flex>

        {/* Expanded detail */}
        <Collapse in={open} animateOpacity>
          <Divider borderColor="var(--border)" />
          <Box px={4} py={4}>
            {/* Message */}
            <Text fontSize="11px" fontWeight={700} color="var(--ink3)" textTransform="uppercase" letterSpacing=".06em" mb={2}>
              Message
            </Text>
            <Box bg="var(--bg2)" borderRadius="9px" px={3} py={3} mb={4}>
              <Text fontSize="13px" color="var(--ink)" lineHeight={1.7} whiteSpace="pre-wrap">{ticket.message}</Text>
            </Box>

            {/* Admin controls */}
            <Flex gap={3} direction={{ base: "column", sm: "row" }} align={{ sm: "flex-end" }}>
              <Box flex={1}>
                <Text fontSize="11px" fontWeight={700} color="var(--ink3)" textTransform="uppercase" letterSpacing=".06em" mb={2}>
                  Status
                </Text>
                <Select
                  className="field"
                  size="sm"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TicketStatus)}
                  style={{ fontSize: 13 }}
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </Select>
              </Box>
              <Box flex={2}>
                <Text fontSize="11px" fontWeight={700} color="var(--ink3)" textTransform="uppercase" letterSpacing=".06em" mb={2}>
                  Internal Note
                </Text>
                <Textarea
                  className="field"
                  size="sm"
                  rows={2}
                  placeholder="Add an internal note (not visible to user)…"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  style={{ fontSize: 13, resize: "vertical" }}
                />
              </Box>
            </Flex>

            <Flex justify="flex-end" mt={3}>
              <Button
                size="sm"
                leftIcon={<Save size={13} />}
                onClick={save}
                isLoading={saving}
                isDisabled={!dirty}
                colorScheme={saved ? "green" : "blue"}
                variant="outline"
                fontSize="12px"
              >
                {saved ? "Saved" : "Save Changes"}
              </Button>
            </Flex>
          </Box>
        </Collapse>
      </CardBody>
    </Card>
  );
};

const FILTERS: { value: string; label: string }[] = [
  { value: "all",         label: "All"         },
  { value: "open",        label: "Open"        },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved",    label: "Resolved"    },
];

export const SupportTab: FC = () => {
  const [tickets,  setTickets]  = useState<SupportTicket[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/support");
      const d   = await res.json();
      setTickets((d.tickets ?? []).map((t: SupportTicket) => ({ ...t, createdAt: t.createdAt })));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleUpdate = async (id: string, status: TicketStatus, adminNote: string) => {
    const res = await fetch(`/api/admin/support/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminNote }),
    });
    if (res.ok) {
      setTickets((prev) => prev.map((t) => t.id === id ? { ...t, status, adminNote } : t));
    }
  };

  const visible = filter === "all" ? tickets : tickets.filter((t) => t.status === filter);
  const counts  = {
    all: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    in_progress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
  };

  return (
    <Box className="page-enter">
      {/* Header */}
      <Flex align="center" gap={3} mb={5}>
        <Box p={2} bg="var(--acc-bg)" borderRadius="10px" border="1px solid var(--acc-bd)">
          <LifeBuoy size={18} color="var(--acc)" />
        </Box>
        <Box>
          <Text fontFamily="'Sora', sans-serif" fontSize="22px" fontWeight="800"
            letterSpacing="-0.02em" color="var(--ink)">
            Support Tickets
          </Text>
          <Text fontSize="12px" color="var(--ink3)" mt={0.5}>
            {counts.open} open · {counts.in_progress} in progress · {counts.resolved} resolved
          </Text>
        </Box>
      </Flex>

      {/* Filter chips */}
      <Flex gap={2} flexWrap="wrap" mb={4}>
        {FILTERS.map((f) => (
          <button
            key={f.value}
            className={`chip${filter === f.value ? " on" : ""}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
            <span style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 17, height: 17, borderRadius: "50%", fontSize: 10, fontWeight: 800,
              background: filter === f.value ? "rgba(255,255,255,.25)" : "var(--bg3)",
              color: filter === f.value ? "#fff" : "var(--ink3)",
            }}>
              {counts[f.value as keyof typeof counts]}
            </span>
          </button>
        ))}
      </Flex>

      {/* Ticket list */}
      {loading ? (
        <Text color="var(--ink3)" fontSize="13px" py={6} textAlign="center">Loading tickets…</Text>
      ) : visible.length === 0 ? (
        <Box textAlign="center" py={12}>
          <LifeBuoy size={32} color="var(--ink3)" style={{ margin: "0 auto 12px" }} />
          <Text color="var(--ink3)" fontSize="13px">No {filter !== "all" ? filter.replace("_", " ") : ""} tickets</Text>
        </Box>
      ) : (
        <Flex direction="column" gap={3}>
          {visible.map((t) => (
            <TicketRow key={t.id} ticket={t} onUpdate={handleUpdate} />
          ))}
        </Flex>
      )}
    </Box>
  );
};
