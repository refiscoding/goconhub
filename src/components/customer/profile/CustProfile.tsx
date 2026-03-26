"use client";
import { FC, useState, ChangeEvent, useEffect, useCallback } from "react";
import {
  Box, Flex, VStack, HStack, Grid, GridItem,
  Text, Heading, Button, Input, InputGroup, InputRightElement,
  Badge, Divider,
} from "@chakra-ui/react";
import {
  User, MapPin, Mail, Phone, Shield, Wallet,
  Edit2, Check, Bell, Lock, Eye, EyeOff, X,
  FileText, ShieldCheck, Cookie, ExternalLink, RotateCcw,
} from "lucide-react";
import { Toast, AvatarUpload, PageSpinner } from "@/components/ui";
import { useToast } from "@/hooks/useToast";
import { useUser } from "@/context/UserContext";
import type { ProfileData } from "@/lib/types";
import { fmtPrice } from "@/lib/fmt";


const EMPTY: ProfileData = { fn: "", ln: "", email: "", phone: "", city: "", area: "", bio: "" };

type StrField = Extract<{ [K in keyof ProfileData]: ProfileData[K] extends string ? K : never }[keyof ProfileData], string>;

interface FieldProps {
  label: string; field: StrField; type?: string; full?: boolean;
  editing: boolean; draft: ProfileData; profile: ProfileData;
  onChange: (f: StrField, v: string) => void;
}
const Field: FC<FieldProps> = ({ label, field, type = "text", full, editing, draft, profile, onChange }) => (
  <div style={full ? { gridColumn: "1/-1" } : {}}>
    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--ink3)", textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 6 }}>{label}</label>
    {editing
      ? <input type={type} className="field" value={draft[field] as string} onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(field, e.target.value)} />
      : <p style={{ fontSize: 15, fontWeight: 500, padding: "2px 0", color: "var(--ink)" }}>{(profile[field] as string) || <span style={{ color: "var(--ink3)" }}>Not set</span>}</p>}
  </div>
);

type TabId = "profile" | "security" | "payments" | "privacy";

export const CustProfile: FC = () => {
  const { user, loading: userLoading, refresh } = useUser();
  const [toast, showToast] = useToast();
  const [editing, setEditing] = useState(false);
  const [busy,    setBusy]    = useState(false);
  const [profile, setProfile] = useState<ProfileData>(EMPTY);
  const [draft,   setDraft]   = useState<ProfileData>(EMPTY);
  const [avatar,  setAvatar]  = useState<string | null>(null);
  const [tab,     setTab]     = useState<TabId>("profile");

  // Change password
  const [pwOpen,    setPwOpen]    = useState(false);
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew,     setPwNew]     = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwBusy,    setPwBusy]    = useState(false);
  const [showCur,   setShowCur]   = useState(false);
  const [showNew,   setShowNew]   = useState(false);
  const [showConf,  setShowConf]  = useState(false);

  // Payment history
  interface PayRecord { id: string; serviceName: string; amount: number; paidAt: string | null; paymentMethod: string | null; vendor: { user: { firstName: string; lastName: string } } }
  const [payments, setPayments] = useState<PayRecord[]>([]);
  const loadPayments = useCallback(() => {
    fetch("/api/customer/payments").then((r) => r.json()).then((d) => setPayments(d.payments ?? [])).catch(() => showToast("Failed to load payments", "err"));
  }, []);
  useEffect(() => { loadPayments(); }, [loadPayments]);

  const METHOD_NAMES: Record<string, string> = { dpo: "DPO Pay", orange: "Orange Money", ewallet: "eWallet" };

  useEffect(() => {
    if (user) {
      const p: ProfileData = {
        fn: user.firstName, ln: user.lastName,
        email: user.email, phone: user.phone ?? "",
        city: user.city ?? "", area: user.area ?? "", bio: "",
      };
      setProfile(p); setDraft(p);
      setAvatar(user.avatarUrl ?? null);
    }
  }, [user]);

  const save = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: draft.fn, lastName: draft.ln, phone: draft.phone, city: draft.city, area: draft.area }),
      });
      if (!res.ok) { showToast("Failed to save profile", "err"); return; }
      await refresh();
      setEditing(false);
      showToast("Profile updated", "ok");
    } catch { showToast("Network error", "err"); }
    finally { setBusy(false); }
  };

  const handleAvatarUpload = async (croppedDataUrl: string) => {
    try {
      // Try storage upload first
      const blob = await fetch(croppedDataUrl).then((r) => r.blob());
      const form = new FormData();
      form.append("file", blob, `avatar.${blob.type.split("/")[1] || "jpg"}`);
      form.append("bucket", "avatars");
      form.append("type", "avatar");

      const upRes = await fetch("/api/upload", { method: "POST", body: form });
      const avatarUrl = upRes.ok
        ? (await upRes.json()).url
        : croppedDataUrl; // fallback to base64 if storage not configured

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl }),
      });
      if (!res.ok) { showToast("Upload failed", "err"); return; }
      setAvatar(avatarUrl);
      await refresh();
      showToast("Photo updated", "ok");
    } catch {
      showToast("Upload failed", "err");
    }
  };


  const changePassword = async () => {
    if (!pwCurrent || !pwNew || !pwConfirm) { showToast("Fill in all fields", "err"); return; }
    if (pwNew !== pwConfirm) { showToast("New passwords do not match", "err"); return; }
    if (pwNew.length < 8)    { showToast("Password must be at least 8 characters", "err"); return; }
    setPwBusy(true);
    try {
      const res  = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwCurrent, newPassword: pwNew }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.message ?? "Failed", "err"); return; }
      showToast("Password changed", "ok");
      setPwOpen(false); setPwCurrent(""); setPwNew(""); setPwConfirm("");
    } catch { showToast("Network error", "err"); }
    finally { setPwBusy(false); }
  };

  const onFieldChange = (f: StrField, v: string) => setDraft((d) => ({ ...d, [f]: v }));

  const fullName = `${profile.fn} ${profile.ln}`.trim();

  if (userLoading) {
    return <PageSpinner paddingY="120px" />;
  }

  const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "profile",  label: "Profile",  icon: <User       size={14} /> },
    { id: "security", label: "Security", icon: <Shield     size={14} /> },
    { id: "payments", label: "Payments", icon: <Wallet     size={14} /> },
    { id: "privacy",  label: "Privacy",  icon: <ShieldCheck size={14} /> },
  ];

  return (
    <Box minH="100vh" bg="var(--bg)" pb="100px">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* ── Hero banner ── */}
      <Box
        h="180px"
        bgGradient="linear(135deg, #d97706 0%, #b45309 55%, #1e40af 100%)"
        position="relative"
        overflow="hidden"
      >
        {/* decorative circles */}
        <Box position="absolute" top="-40px" right="-40px" w="200px" h="200px" borderRadius="full" bg="rgba(255,255,255,.08)" />
        <Box position="absolute" bottom="-60px" left="-20px" w="160px" h="160px" borderRadius="full" bg="rgba(0,0,0,.1)" />
        <Box position="absolute" top="-20px" left="40%" w="120px" h="120px" borderRadius="full" bg="rgba(255,255,255,.05)" />

        {/* Edit / Save button */}
        <Box position="absolute" top={4} right={4}>
          <Button
            onClick={() => editing ? save() : setEditing(true)}
            isLoading={busy}
            size="sm"
            leftIcon={editing ? <Check size={14} /> : <Edit2 size={14} />}
            bg="rgba(255,255,255,.18)"
            backdropFilter="blur(10px)"
            border="1.5px solid rgba(255,255,255,.35)"
            color="white"
            borderRadius="full"
            fontWeight={700}
            fontSize={13}
            px={5}
            _hover={{ bg: "rgba(255,255,255,.28)" }}
            _active={{ bg: "rgba(255,255,255,.32)" }}
          >
            {editing ? (busy ? "Saving…" : "Save") : "Edit Profile"}
          </Button>
          {editing && (
            <Button
              ml={2}
              onClick={() => { setEditing(false); setDraft(profile); }}
              size="sm"
              leftIcon={<X size={14} />}
              bg="rgba(0,0,0,.2)"
              backdropFilter="blur(10px)"
              border="1.5px solid rgba(255,255,255,.2)"
              color="white"
              borderRadius="full"
              fontWeight={700}
              fontSize={13}
              px={4}
              _hover={{ bg: "rgba(0,0,0,.32)" }}
            >
              Cancel
            </Button>
          )}
        </Box>
      </Box>

      {/* ── Avatar (overlaps hero) ── */}
      <Flex justify="center" mt="-50px" position="relative" zIndex={10}>
        <Box p="4px" bg="var(--bg)" borderRadius="full" boxShadow="0 4px 20px rgba(0,0,0,.18)">
          <AvatarUpload src={avatar} name={fullName || "?"} size={100} onUpload={handleAvatarUpload} />
        </Box>
      </Flex>

      {/* ── Name + location + badge ── */}
      <VStack spacing={1} pt={3} px={6} textAlign="center">
        <Heading fontSize="24px" fontWeight={800} letterSpacing="-0.02em" color="var(--ink)">
          {fullName || "Your Name"}
        </Heading>
        <HStack spacing={1} color="var(--ink3)" fontSize="13px">
          <MapPin size={13} />
          <Text>
            {profile.city || "Gaborone"}{profile.area ? `, ${profile.area}` : ""}
          </Text>
        </HStack>
        <HStack
          spacing={2}
          mt={1}
          px={3}
          py="4px"
          borderRadius="full"
          bg="var(--green-bg)"
          border="1px solid rgba(12,166,120,.2)"
          display="inline-flex"
        >
          <Box w="7px" h="7px" borderRadius="full" bg="var(--green)" />
          <Text fontSize="11px" fontWeight={700} color="var(--green)">Active</Text>
        </HStack>
      </VStack>

      {/* ── Contact quick-info ── */}
      <Grid templateColumns="1fr 1fr" gap={2} mx={4} mt={5}>
        <GridItem>
          <Box bg="white" borderRadius="2xl" boxShadow="sm" p={4} textAlign="center">
            <Flex justify="center" mb={2}>
              <Box p="8px" borderRadius="xl" bg="rgba(217,119,6,.1)">
                <Mail size={16} color="#d97706" />
              </Box>
            </Flex>
            <Text fontSize="11px" fontWeight={700} color="var(--ink3)" textTransform="uppercase" letterSpacing=".05em" mb={1}>Email</Text>
            <Text fontSize="12px" fontWeight={600} color="var(--ink)" wordBreak="break-all" noOfLines={1}>{profile.email || "—"}</Text>
          </Box>
        </GridItem>
        <GridItem>
          <Box bg="white" borderRadius="2xl" boxShadow="sm" p={4} textAlign="center">
            <Flex justify="center" mb={2}>
              <Box p="8px" borderRadius="xl" bg="rgba(217,119,6,.1)">
                <Phone size={16} color="#d97706" />
              </Box>
            </Flex>
            <Text fontSize="11px" fontWeight={700} color="var(--ink3)" textTransform="uppercase" letterSpacing=".05em" mb={1}>Phone</Text>
            <Text fontSize="12px" fontWeight={600} color="var(--ink)">{profile.phone || "—"}</Text>
          </Box>
        </GridItem>
      </Grid>

      {/* ── Tab switcher ── */}
      <Box mx={4} mt={6}>
        <Box bg="white" borderRadius="2xl" boxShadow="sm" overflow="hidden">
          <Flex borderBottom="1px solid var(--border)">
            {TABS.map((t) => (
              <Box
                key={t.id}
                as="button"
                flex={1}
                py={3}
                onClick={() => setTab(t.id)}
                position="relative"
                _focus={{ outline: "none" }}
                transition="color .15s"
              >
                <Flex direction="column" align="center" gap="4px">
                  <Box color={tab === t.id ? "var(--acc)" : "var(--ink3)"} transition="color .15s">
                    {t.icon}
                  </Box>
                  <Text
                    fontSize="12px"
                    fontWeight={700}
                    color={tab === t.id ? "var(--acc)" : "var(--ink3)"}
                    transition="color .15s"
                  >
                    {t.label}
                  </Text>
                </Flex>
                {tab === t.id && (
                  <Box
                    position="absolute"
                    bottom={0}
                    left="10%"
                    w="80%"
                    h="2.5px"
                    bg="var(--acc)"
                    borderRadius="full"
                  />
                )}
              </Box>
            ))}
          </Flex>

          {/* ── Profile tab ── */}
          {tab === "profile" && (
            <Box>
              {/* Personal info */}
              <Box px={5} pt={5} pb={2}>
                <HStack spacing={3} mb={4}>
                  <Flex w="32px" h="32px" borderRadius="xl" bg="var(--acc-bg)" align="center" justify="center" flexShrink={0}>
                    <User size={16} color="var(--acc)" />
                  </Flex>
                  <Text fontWeight={700} fontSize="14px" color="var(--ink)">Personal Information</Text>
                </HStack>
                <Grid templateColumns="1fr 1fr" gap={5}>
                  <Field label="First Name" field="fn"    editing={editing} draft={draft} profile={profile} onChange={onFieldChange} />
                  <Field label="Last Name"  field="ln"    editing={editing} draft={draft} profile={profile} onChange={onFieldChange} />
                  <Field label="Email"      field="email" editing={editing} draft={draft} profile={profile} onChange={onFieldChange} type="email" full />
                  <Field label="Phone"      field="phone" editing={editing} draft={draft} profile={profile} onChange={onFieldChange} type="tel" />
                  <Field label="City"       field="city"  editing={editing} draft={draft} profile={profile} onChange={onFieldChange} />
                  <Field label="Area"       field="area"  editing={editing} draft={draft} profile={profile} onChange={onFieldChange} />
                </Grid>
              </Box>

              <Divider borderColor="var(--border)" my={4} />

              {/* Preferences */}
              <Box px={5} pb={5}>
                <HStack spacing={3} mb={4}>
                  <Flex w="32px" h="32px" borderRadius="xl" bg="rgba(99,102,241,.1)" align="center" justify="center" flexShrink={0}>
                    <Bell size={16} color="#6366f1" />
                  </Flex>
                  <Text fontWeight={700} fontSize="14px" color="var(--ink)">Preferences</Text>
                </HStack>
                {(user?.preferredServices?.length ?? 0) > 0 ? (
                  <Flex flexWrap="wrap" gap={2}>
                    {user!.preferredServices.map((s) => (
                      <Badge
                        key={s}
                        px={3} py={1}
                        borderRadius="full"
                        bg="var(--acc-bg)"
                        border="1px solid var(--acc-bd)"
                        fontSize="12px"
                        fontWeight={600}
                        color="var(--acc)"
                        textTransform="none"
                      >
                        {s}
                      </Badge>
                    ))}
                  </Flex>
                ) : (
                  <Text fontSize="13px" color="var(--ink3)">No preferred services set yet.</Text>
                )}
              </Box>
            </Box>
          )}

          {/* ── Security tab ── */}
          {tab === "security" && (
            <Box px={5} py={5}>
              <HStack spacing={3} mb={5}>
                <Flex w="32px" h="32px" borderRadius="xl" bg="var(--green-bg)" align="center" justify="center" flexShrink={0}>
                  <Shield size={16} color="var(--green)" />
                </Flex>
                <Text fontWeight={700} fontSize="14px" color="var(--ink)">Account Security</Text>
              </HStack>

              <Box bg="var(--bg)" borderRadius="xl" p={4}>
                <Flex justify="space-between" align="center">
                  <HStack spacing={3}>
                    <Flex w="36px" h="36px" borderRadius="xl" bg="rgba(217,119,6,.1)" align="center" justify="center" flexShrink={0}>
                      <Lock size={16} color="#d97706" />
                    </Flex>
                    <Box>
                      <Text fontWeight={600} fontSize="14px" color="var(--ink)">Password</Text>
                      <Text fontSize="12px" color="var(--ink3)" mt="2px">Change your account password</Text>
                    </Box>
                  </HStack>
                  <Button
                    onClick={() => setPwOpen((o) => !o)}
                    size="sm"
                    variant="ghost"
                    colorScheme={pwOpen ? "gray" : "orange"}
                    borderRadius="full"
                    fontWeight={700}
                    fontSize="12px"
                    leftIcon={pwOpen ? <X size={12} /> : <Edit2 size={12} />}
                  >
                    {pwOpen ? "Cancel" : "Change"}
                  </Button>
                </Flex>

                {pwOpen && (
                  <VStack spacing={4} mt={5} align="stretch">
                    <Box>
                      <Text as="label" fontSize="11px" fontWeight={700} color="var(--ink3)" textTransform="uppercase" letterSpacing=".06em" display="block" mb={2}>
                        Current Password
                      </Text>
                      <InputGroup>
                        <Input
                          type={showCur ? "text" : "password"}
                          placeholder="••••••••"
                          value={pwCurrent}
                          onChange={(e) => setPwCurrent(e.target.value)}
                          borderRadius="xl"
                          fontSize="14px"
                          bg="white"
                        />
                        <InputRightElement>
                          <Box as="button" type="button" onClick={() => setShowCur((v) => !v)} color="var(--ink3)" p={1}>
                            {showCur ? <EyeOff size={15} /> : <Eye size={15} />}
                          </Box>
                        </InputRightElement>
                      </InputGroup>
                    </Box>
                    <Box>
                      <Text as="label" fontSize="11px" fontWeight={700} color="var(--ink3)" textTransform="uppercase" letterSpacing=".06em" display="block" mb={2}>
                        New Password
                      </Text>
                      <InputGroup>
                        <Input
                          type={showNew ? "text" : "password"}
                          placeholder="Min 8 characters"
                          value={pwNew}
                          onChange={(e) => setPwNew(e.target.value)}
                          borderRadius="xl"
                          fontSize="14px"
                          bg="white"
                        />
                        <InputRightElement>
                          <Box as="button" type="button" onClick={() => setShowNew((v) => !v)} color="var(--ink3)" p={1}>
                            {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                          </Box>
                        </InputRightElement>
                      </InputGroup>
                    </Box>
                    <Box>
                      <Text as="label" fontSize="11px" fontWeight={700} color="var(--ink3)" textTransform="uppercase" letterSpacing=".06em" display="block" mb={2}>
                        Confirm New Password
                      </Text>
                      <InputGroup>
                        <Input
                          type={showConf ? "text" : "password"}
                          placeholder="Repeat new password"
                          value={pwConfirm}
                          onChange={(e) => setPwConfirm(e.target.value)}
                          borderRadius="xl"
                          fontSize="14px"
                          bg="white"
                        />
                        <InputRightElement>
                          <Box as="button" type="button" onClick={() => setShowConf((v) => !v)} color="var(--ink3)" p={1}>
                            {showConf ? <EyeOff size={15} /> : <Eye size={15} />}
                          </Box>
                        </InputRightElement>
                      </InputGroup>
                    </Box>
                    <Button
                      onClick={changePassword}
                      isLoading={pwBusy}
                      colorScheme="orange"
                      borderRadius="xl"
                      fontWeight={700}
                      fontSize="14px"
                      leftIcon={<Check size={15} />}
                      py={6}
                    >
                      Update Password
                    </Button>
                  </VStack>
                )}
              </Box>
            </Box>
          )}

          {/* ── Payments tab ── */}
          {tab === "payments" && (
            <Box>
              <Flex px={5} pt={5} pb={3} align="center" gap={3}>
                <Flex w="32px" h="32px" borderRadius="xl" bg="rgba(99,102,241,.1)" align="center" justify="center" flexShrink={0}>
                  <Wallet size={16} color="#6366f1" />
                </Flex>
                <Text fontWeight={700} fontSize="14px" color="var(--ink)">Payment History</Text>
              </Flex>

              {payments.length === 0 ? (
                <Box px={5} pb={5}>
                  <Flex direction="column" align="center" py={8} gap={3}>
                    <Box p={4} borderRadius="full" bg="rgba(99,102,241,.08)">
                      <Wallet size={28} color="#6366f1" />
                    </Box>
                    <Text fontSize="14px" color="var(--ink3)" fontWeight={500}>No payments yet.</Text>
                  </Flex>
                </Box>
              ) : (
                <VStack spacing={0} align="stretch" pb={2}>
                  {payments.map((p, i) => (
                    <Box key={p.id}>
                      {i > 0 && <Divider borderColor="var(--border)" />}
                      <Flex px={5} py={4} justify="space-between" align="flex-start">
                        <Box flex={1} mr={4}>
                          <Text fontWeight={700} fontSize="14px" color="var(--ink)">{p.serviceName}</Text>
                          <Text fontSize="12px" color="var(--ink3)" mt="2px">
                            {p.vendor.user.firstName} {p.vendor.user.lastName}
                          </Text>
                          <HStack spacing={2} mt={2} flexWrap="wrap">
                            {p.paymentMethod && (
                              <Badge
                                px={2} py="2px"
                                borderRadius="full"
                                bg="rgba(99,102,241,.1)"
                                color="#6366f1"
                                fontSize="11px"
                                fontWeight={700}
                                textTransform="none"
                              >
                                {METHOD_NAMES[p.paymentMethod] ?? p.paymentMethod}
                              </Badge>
                            )}
                            {p.paidAt && (
                              <Text fontSize="11px" color="var(--ink3)">
                                {new Date(p.paidAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                                {" · "}
                                {new Date(p.paidAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                              </Text>
                            )}
                          </HStack>
                        </Box>
                        <Text fontWeight={800} fontSize="16px" color="var(--acc)" flexShrink={0}>
                          {fmtPrice(p.amount)}
                        </Text>
                      </Flex>
                    </Box>
                  ))}
                </VStack>
              )}
            </Box>
          )}
          {/* ── Privacy Centre tab ── */}
          {tab === "privacy" && (
            <Box px={5} py={5}>
              <HStack spacing={3} mb={5}>
                <Flex w="32px" h="32px" borderRadius="xl" bg="rgba(13,148,136,.1)" align="center" justify="center" flexShrink={0}>
                  <ShieldCheck size={16} color="#0d9488" />
                </Flex>
                <Text fontWeight={700} fontSize="14px" color="var(--ink)">Privacy Centre</Text>
              </HStack>

              {/* Policy links */}
              <VStack spacing={3} align="stretch" mb={6}>
                {[
                  { href: "/legal/privacy", icon: <ShieldCheck size={16} color="#0d9488" />, label: "Privacy Policy", desc: "How we collect and use your data", bg: "rgba(13,148,136,.08)", color: "#0d9488" },
                  { href: "/legal/terms",   icon: <FileText    size={16} color="#d97706" />, label: "Terms & Conditions", desc: "Your rights and obligations as a customer", bg: "rgba(217,119,6,.08)", color: "#d97706" },
                  { href: "/legal/cookies", icon: <Cookie      size={16} color="#6366f1" />, label: "Cookie Policy", desc: "How we use cookies and local storage", bg: "rgba(99,102,241,.08)", color: "#6366f1" },
                ].map((item) => (
                  <Box
                    key={item.href}
                    as="a"
                    href={item.href}
                    display="flex"
                    alignItems="center"
                    gap={3}
                    p={4}
                    borderRadius="xl"
                    bg="var(--bg)"
                    border="1px solid var(--border)"
                    style={{ textDecoration: "none", cursor: "pointer" }}
                    _hover={{ bg: "var(--bg2)" }}
                    transition="background .15s"
                  >
                    <Flex w="36px" h="36px" borderRadius="xl" bg={item.bg} align="center" justify="center" flexShrink={0}>
                      {item.icon}
                    </Flex>
                    <Box flex={1}>
                      <Text fontWeight={700} fontSize="13px" color="var(--ink)">{item.label}</Text>
                      <Text fontSize="11px" color="var(--ink3)" mt="1px">{item.desc}</Text>
                    </Box>
                    <ExternalLink size={14} color="var(--ink3)" />
                  </Box>
                ))}
              </VStack>

              {/* Cookie preferences */}
              <Box bg="var(--bg)" borderRadius="xl" p={4} border="1px solid var(--border)">
                <HStack spacing={3} mb={3}>
                  <Flex w="32px" h="32px" borderRadius="xl" bg="rgba(99,102,241,.08)" align="center" justify="center" flexShrink={0}>
                    <Cookie size={15} color="#6366f1" />
                  </Flex>
                  <Box>
                    <Text fontWeight={700} fontSize="13px" color="var(--ink)">Cookie Preferences</Text>
                    <Text fontSize="11px" color="var(--ink3)">Manage your consent settings</Text>
                  </Box>
                </HStack>
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="purple"
                  borderRadius="full"
                  fontWeight={700}
                  fontSize="12px"
                  leftIcon={<RotateCcw size={12} />}
                  onClick={() => {
                    localStorage.removeItem("hh_cookie_consent");
                    window.location.reload();
                  }}
                >
                  Reset Cookie Consent
                </Button>
              </Box>

              {/* Data request */}
              <Box mt={4} p={4} borderRadius="xl" bg="#fffbeb" border="1px solid #fde68a">
                <Text fontWeight={700} fontSize="13px" color="#d97706" mb={1}>Your Data Rights</Text>
                <Text fontSize="12px" color="#44403c" lineHeight={1.6}>
                  You have the right to access, correct, or delete your personal data.
                  To submit a data request, contact us at{" "}
                  <a href="mailto:privacy@handyhub.co.bw" style={{ color: "#d97706", fontWeight: 700 }}>privacy@handyhub.co.bw</a>
                </Text>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

    </Box>
  );
};
