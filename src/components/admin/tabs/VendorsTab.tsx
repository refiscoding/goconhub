"use client";
import { FC, useState, useMemo } from "react";
import {
  Box, Flex, Text, Badge, Button, ButtonGroup, Collapse, Divider,
  Card, CardBody, Select,
} from "@chakra-ui/react";
import { CircleCheck, X, ShieldCheck, CircleDot, CircleCheckBig, Download, ChevronLeft, ChevronRight, FileText, FileSpreadsheet } from "lucide-react";
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

const PAGE_SIZES = [10, 25, 50];

function vendorsToCsv(vendors: AppUser[]): string {
  const headers = ["Name","Email","Phone","Status","Verified","Entity Type","Category","Location","Company","Reg. No.","Bank","Account No.","Bookings","Joined"];
  const rows = vendors.map((v) => [
    v.name, v.email, v.phone, v.status, v.verified ? "Yes" : "No",
    v.entityType ?? "individual", v.category ?? "", v.location ?? "",
    v.companyName ?? "", v.companyRegNumber ?? "", v.bankName ?? "",
    v.accountNumber ?? "", String(v.bookings), v.joined,
  ]);
  const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
  return [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n");
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function downloadCsv(vendors: AppUser[]) {
  const csv = vendorsToCsv(vendors);
  downloadBlob(new Blob([csv], { type: "text/csv" }), `vendors-${new Date().toISOString().slice(0, 10)}.csv`);
}

function downloadPdf(vendors: AppUser[]) {
  // Build a printable HTML table and open in a new window for print/save-as-PDF
  const rows = vendors.map((v) => `<tr>
    <td>${v.name}</td><td>${v.email}</td><td>${v.phone}</td>
    <td>${v.status}</td><td>${v.verified ? "Yes" : "No"}</td>
    <td>${v.entityType ?? "individual"}</td><td>${v.category ?? ""}</td>
    <td>${v.location ?? ""}</td><td>${v.companyName ?? ""}</td>
    <td>${v.companyRegNumber ?? ""}</td><td>${v.bankName ?? ""}</td>
    <td>${v.accountNumber ?? ""}</td><td>${v.bookings}</td><td>${v.joined}</td>
  </tr>`).join("");
  const html = `<!DOCTYPE html><html><head><title>Vendors Report</title>
    <style>body{font-family:Arial,sans-serif;padding:20px}h1{font-size:18px;margin-bottom:12px}
    table{width:100%;border-collapse:collapse;font-size:11px}th,td{border:1px solid #ddd;padding:6px 8px;text-align:left}
    th{background:#f5f5f5;font-weight:700}tr:nth-child(even){background:#fafafa}
    @media print{body{padding:0}}</style></head>
    <body><h1>Vendor Report — ${new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}</h1>
    <p style="font-size:12px;color:#666;margin-bottom:12px">${vendors.length} vendor${vendors.length!==1?"s":""}</p>
    <table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Verified</th>
    <th>Entity</th><th>Category</th><th>Location</th><th>Company</th><th>Reg. No.</th>
    <th>Bank</th><th>Account</th><th>Bookings</th><th>Joined</th></tr></thead>
    <tbody>${rows}</tbody></table></body></html>`;
  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); w.print(); }
}

export const VendorsTab: FC<VendorsTabProps> = ({ vendors, onApprove, onSuspend, onDelete, onVerify }) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const toggle = (id: string) => setExpanded((prev) => (prev === id ? null : id));

  const pending = vendors.filter((v) => v.status === "pending");
  const totalPages = Math.max(1, Math.ceil(vendors.length / pageSize));
  const pagedVendors = useMemo(
    () => vendors.slice(page * pageSize, (page + 1) * pageSize),
    [vendors, page, pageSize],
  );

  return (
    <Box className="page-enter">
      <Flex justify="space-between" align="center" mb={5} flexWrap="wrap" gap={3}>
        <Text fontFamily="'Sora', sans-serif" fontSize="22px" fontWeight="800"
          letterSpacing="-0.02em" color="var(--ink)">
          Vendor Management
        </Text>
        <Flex gap={2}>
          <Button size="sm" variant="outline" borderColor="var(--border)" color="var(--ink)"
            fontSize="12px" leftIcon={<FileSpreadsheet size={13} />}
            onClick={() => downloadCsv(vendors)}>
            Export CSV
          </Button>
          <Button size="sm" variant="outline" borderColor="var(--border)" color="var(--ink)"
            fontSize="12px" leftIcon={<FileText size={13} />}
            onClick={() => downloadPdf(vendors)}>
            Export PDF
          </Button>
        </Flex>
      </Flex>

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
        {pagedVendors.map((v) => {
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
                      const isBase64 = docUrl.startsWith("data:");
                      const sizeKB = isBase64 ? Math.round((docUrl.length * 3) / 4 / 1024) : 0;
                      return (
                        <Box>
                          {isBase64 && sizeKB > 500 && (
                            <Text fontSize="10px" color="var(--red)" mb={1} fontWeight={600}>
                              Large file ({(sizeKB / 1024).toFixed(1)} MB) — stored as base64 in database
                            </Text>
                          )}
                          <Box borderRadius="10px" overflow="hidden" border="1px solid var(--border)" position="relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={docUrl} alt={docLabel}
                              style={{ width: "100%", maxHeight: 160, objectFit: "contain", display: "block", background: "#f9fafb" }} />
                            <Flex position="absolute" bottom={0} left={0} right={0}
                              bg="rgba(0,0,0,.55)" px={3} py={2} justify="space-between" align="center">
                              <Text fontSize="11px" color="rgba(255,255,255,.8)" fontWeight={600}>
                                {docLabel}{isBase64 && sizeKB > 0 ? ` (${sizeKB > 1024 ? `${(sizeKB/1024).toFixed(1)} MB` : `${sizeKB} KB`})` : ""}
                              </Text>
                              <a href={docUrl} target="_blank" rel="noreferrer"
                                style={{ fontSize: 11, fontWeight: 700, color: "#fff", textDecoration: "none",
                                  background: "rgba(255,255,255,.2)", borderRadius: 6, padding: "3px 10px" }}>
                                Full View
                              </a>
                            </Flex>
                          </Box>
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

      {/* Pagination */}
      {vendors.length > PAGE_SIZES[0] && (
        <Flex justify="space-between" align="center" mt={4} flexWrap="wrap" gap={3}>
          <Flex align="center" gap={2} fontSize="12px" color="var(--ink3)">
            <Text>Show</Text>
            <Select size="sm" w="70px" borderColor="var(--border)" value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}>
              {PAGE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
            <Text>of {vendors.length} vendors</Text>
          </Flex>
          <Flex align="center" gap={2}>
            <Button size="sm" variant="outline" borderColor="var(--border)" color="var(--ink)"
              isDisabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft size={14} />
            </Button>
            <Text fontSize="12px" color="var(--ink2)" fontWeight={600} minW="80px" textAlign="center">
              Page {page + 1} of {totalPages}
            </Text>
            <Button size="sm" variant="outline" borderColor="var(--border)" color="var(--ink)"
              isDisabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight size={14} />
            </Button>
          </Flex>
        </Flex>
      )}
    </Box>
  );
};
