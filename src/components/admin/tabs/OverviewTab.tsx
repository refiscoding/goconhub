"use client";
import { FC, useState, useEffect } from "react";
import {
  Box, SimpleGrid, Card, CardBody, Stat, StatLabel, StatHelpText,
  Flex, Text, Heading, Badge, Stack,
} from "@chakra-ui/react";
import { CreditCard, TrendingUp, Banknote, PiggyBank } from "lucide-react";
import type { Booking, Dispute } from "@/lib/types";

interface OverviewTabProps {
  bookings: Booking[];
  disputes: Dispute[];
  vendorCount: number;
  customerCount: number;
  pendingVendors: number;
}

interface RevenueData {
  totalRevenue: number;
  totalTransacted: number;
  totalVendorPaid: number;
  count: number;
}

const fmt = (n: number) =>
  n >= 1000 ? `P${(n / 1000).toFixed(1)}k` : `P${n.toFixed(0)}`;

const SECTION_LABEL: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: "var(--ink3)",
  textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 10,
};

const STATUS_COLOR: Record<string, string> = {
  confirmed: "blue", pending: "orange", completed: "green",
  cancelled: "red", disputed: "purple",
};

export const OverviewTab: FC<OverviewTabProps> = ({
  bookings, disputes, vendorCount, customerCount, pendingVendors,
}) => {
  const [rev, setRev] = useState<RevenueData | null>(null);

  useEffect(() => {
    fetch("/api/admin/revenue")
      .then((r) => r.json())
      .then((d: RevenueData) => setRev(d))
      .catch(() => {});
  }, []);

  const openDisputes  = disputes.filter((d) => d.status === "open").length;
  const completedBkgs = bookings.filter((b) => b.status === "completed").length;
  const completionRate = bookings.length
    ? `${Math.round((completedBkgs / bookings.length) * 100)}%`
    : "—";

  const FINANCE = [
    { label: "Gross Transacted", value: rev ? fmt(rev.totalTransacted) : "—", sub: `${rev?.count ?? 0} confirmed payments`, icon: <CreditCard  size={18} />, accent: "#0077B6" },
    { label: "Platform Revenue",  value: rev ? fmt(rev.totalRevenue)    : "—", sub: "5% fee on transactions",                icon: <TrendingUp  size={18} />, accent: "#2D9A4E" },
    { label: "Vendor Payouts",    value: rev ? fmt(rev.totalVendorPaid) : "—", sub: "95% disbursed to vendors",               icon: <Banknote    size={18} />, accent: "#C9A84C" },
    { label: "Net Profit",        value: rev ? fmt(rev.totalRevenue)    : "—", sub: "After all payouts",                      icon: <PiggyBank   size={18} />, accent: "#2D9A4E" },
  ];

  const PLATFORM = [
    { label: "Total Customers",  value: customerCount,    accent: "var(--acc)"   },
    { label: "Total Vendors",    value: vendorCount,      accent: "var(--acc)"   },
    { label: "Pending Approval", value: pendingVendors,   accent: "var(--amber)" },
    { label: "Open Disputes",    value: openDisputes,     accent: "var(--red)"   },
    { label: "Total Bookings",   value: bookings.length,  accent: "var(--ink)"   },
    { label: "Completion Rate",  value: completionRate,   accent: "var(--green)" },
  ];

  return (
    <Box className="page-enter" maxW="1100px" w="100%">
      {/* Page header */}
      <Box mb={6}>
        <Heading size="lg" fontFamily="'Sora', sans-serif" letterSpacing="-0.02em" color="var(--ink)">
          Overview
        </Heading>
        <Text fontSize="sm" color="var(--ink3)" mt={1}>
          Platform-wide metrics and recent activity
        </Text>
      </Box>

      {/* Finance stat cards */}
      <Box mb={2} style={SECTION_LABEL as React.CSSProperties}>Financials</Box>
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3} mb={6}>
        {FINANCE.map((s) => (
          <Card
            key={s.label}
            bg="var(--card)"
            borderColor="var(--border)"
            borderWidth="1px"
            borderRadius="14px"
            shadow="none"
            _hover={{ shadow: "sm" }}
            transition="box-shadow .2s"
          >
            <CardBody p={4}>
              <Flex justify="space-between" align="flex-start" mb={3}>
                <Box color={s.accent} opacity={0.85}>{s.icon}</Box>
                <Text
                  fontFamily="'DM Mono', monospace"
                  fontSize="lg"
                  fontWeight="800"
                  color={s.accent}
                  letterSpacing="-0.02em"
                >
                  {s.value}
                </Text>
              </Flex>
              <Stat>
                <StatLabel
                  fontSize="12px"
                  fontWeight="700"
                  color="var(--ink)"
                  fontFamily="'Nunito', sans-serif"
                >
                  {s.label}
                </StatLabel>
                <StatHelpText fontSize="11px" color="var(--ink3)" mt={0.5} mb={0}>
                  {s.sub}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      {/* Two-column section: metrics + recent bookings */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>

        {/* Platform metrics */}
        <Box>
          <Box mb={2} style={SECTION_LABEL as React.CSSProperties}>Platform Metrics</Box>
          <Card
            bg="var(--card)"
            borderColor="var(--border)"
            borderWidth="1px"
            borderRadius="14px"
            shadow="none"
            overflow="hidden"
          >
            <CardBody p={0}>
              {PLATFORM.map((m, i) => (
                <Flex
                  key={m.label}
                  justify="space-between"
                  align="center"
                  px={5}
                  py={3}
                  borderTopWidth={i > 0 ? "1px" : "0"}
                  borderColor="var(--border)"
                >
                  <Text fontSize="13px" color="var(--ink2)" fontWeight="500">
                    {m.label}
                  </Text>
                  <Text
                    fontFamily="'DM Mono', monospace"
                    fontSize="15px"
                    fontWeight="800"
                    color={m.accent}
                  >
                    {m.value}
                  </Text>
                </Flex>
              ))}
            </CardBody>
          </Card>
        </Box>

        {/* Recent bookings */}
        <Box>
          <Box mb={2} style={SECTION_LABEL as React.CSSProperties}>Recent Bookings</Box>
          <Card
            bg="var(--card)"
            borderColor="var(--border)"
            borderWidth="1px"
            borderRadius="14px"
            shadow="none"
            overflow="hidden"
          >
            <CardBody p={0}>
              {bookings.length === 0 ? (
                <Text px={5} py={5} fontSize="13px" color="var(--ink3)">
                  No bookings yet.
                </Text>
              ) : (
                bookings.slice(0, 6).map((b, i) => (
                  <Flex
                    key={b.id}
                    justify="space-between"
                    align="center"
                    px={5}
                    py={3}
                    borderTopWidth={i > 0 ? "1px" : "0"}
                    borderColor="var(--border)"
                    gap={2}
                  >
                    <Box minW={0}>
                      <Text fontSize="13px" fontWeight="600" color="var(--ink)" noOfLines={1}>
                        {b.customer}
                      </Text>
                      <Text fontSize="11px" color="var(--ink3)" mt={0.5} noOfLines={1}>
                        {b.service} · {b.vendor}
                      </Text>
                    </Box>
                    <Stack align="flex-end" spacing={1} flexShrink={0}>
                      <Badge
                        colorScheme={STATUS_COLOR[b.status] ?? "gray"}
                        fontSize="10px"
                        borderRadius="full"
                        px={2}
                        textTransform="capitalize"
                      >
                        {b.status}
                      </Badge>
                      <Text
                        fontFamily="'DM Mono', monospace"
                        fontSize="12px"
                        fontWeight="700"
                        color="var(--acc)"
                      >
                        P{b.amount}
                      </Text>
                    </Stack>
                  </Flex>
                ))
              )}
            </CardBody>
          </Card>
        </Box>

      </SimpleGrid>
    </Box>
  );
};
