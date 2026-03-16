"use client";
import { FC, useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import type { Role, AuthMode } from "@/lib/types";
import {
  Box, Button, Flex, FormControl, FormLabel, Heading,
  HStack, Input, InputGroup, InputLeftElement, InputRightElement, IconButton,
  Stack, Text, VStack, useToast,
} from "@chakra-ui/react";
import {
  Wrench, Eye, EyeOff, Check, Mail, Lock, User, UserCog,
  ChevronRight, Star, Zap, Shield,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MotionBox   = motion(Box   as any);
const MotionFlex  = motion(Flex  as any);
const MotionVStack = motion(VStack as any);

/* ─── data ───────────────────────────────────────────── */
const ROLES: { id: Role; label: string; desc: string; icon: React.ReactNode }[] = [
  { id: "customer", label: "Customer",  desc: "I need a handyman", icon: <User    size={16} /> },
  { id: "vendor",   label: "Handyman",  desc: "I offer services",  icon: <UserCog size={16} /> },
];

const FEATURES = [
  "Find trusted handymen near you",
  "Book services in minutes",
  "Secure payments & reviews",
];

const STATS = [
  { icon: <Star size={14} />,   value: "4.9★",    label: "Rating"   },
  { icon: <Zap  size={14} />,   value: "2 min",   label: "Booking"  },
  { icon: <Shield size={14} />, value: "100%",    label: "Secure"   },
];

/* ─── shared logic hook ─────────────────────────────── */
function useAuthLogic() {
  const router       = useRouter();
  const { refresh }  = useUser();
  const toast        = useToast();

  const [mode,  setMode]  = useState<AuthMode>("login");
  const [role,  setRole]  = useState<Role>("customer");
  const [fn,    setFn]    = useState("");
  const [ln,    setLn]    = useState("");
  const [email, setEmail] = useState("");
  const [pass,  setPass]  = useState("");
  const [show,  setShow]  = useState(false);
  const [busy,  setBusy]  = useState(false);

  const handleSubmit = async () => {
    if (!email || !pass) {
      toast({ title: "Email and password are required.", status: "error", duration: 3000, isClosable: true, position: "top" });
      return;
    }
    if (mode === "register" && (!fn || !ln)) {
      toast({ title: "First and last name are required.", status: "error", duration: 3000, isClosable: true, position: "top" });
      return;
    }
    setBusy(true);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body     = mode === "login"
        ? { email, password: pass }
        : { email, password: pass, firstName: fn, lastName: ln, role };

      const res  = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();

      if (!res.ok) {
        toast({ title: data.message ?? "Something went wrong.", status: "error", duration: 3500, isClosable: true, position: "top" });
        return;
      }
      await refresh();
      if (mode === "login") {
        const userRole = data.user?.role ?? role;
        if      (userRole === "vendor") router.push("/vendor/dashboard");
        else if (userRole === "admin")  router.push("/admin/dashboard");
        else                            router.push("/customer/explore");
      } else {
        router.push(role === "vendor" ? "/onboarding/vendor" : "/onboarding/customer");
      }
    } catch {
      toast({ title: "Network error. Please try again.", status: "error", duration: 3000, isClosable: true, position: "top" });
    } finally {
      setBusy(false);
    }
  };

  return { mode, setMode, role, setRole, fn, setFn, ln, setLn, email, setEmail, pass, setPass, show, setShow, busy, handleSubmit };
}

/* ─── Shared SVG Illustration ───────────────────────── */
const HandymanSVG: FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <svg viewBox="0 0 600 300" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", display: "block", ...style }} aria-hidden="true">
    <defs>
      <radialGradient id="wL" cx="52%" cy="80%" r="48%">
        <stop offset="0%"   stopColor="#e07b39" stopOpacity="0.55" />
        <stop offset="40%"  stopColor="#c1440e" stopOpacity="0.22" />
        <stop offset="100%" stopColor="#0f0a04" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="sG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0f0a04" /><stop offset="100%" stopColor="#1e1006" />
      </linearGradient>
      <linearGradient id="gG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1a0d04" /><stop offset="100%" stopColor="#0d0602" />
      </linearGradient>
      <linearGradient id="fG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#4a2008" /><stop offset="100%" stopColor="#2a0e03" />
      </linearGradient>
      <linearGradient id="hG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#e07b39" /><stop offset="100%" stopColor="#b55a20" />
      </linearGradient>
      <linearGradient id="bG" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#c1440e" /><stop offset="100%" stopColor="#e07b39" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="600" height="300" fill="url(#sG)" />
    {[[30,18],[72,8],[140,22],[200,10],[265,30],[320,14],[388,8],[450,20],[510,12],[560,25],[55,45],[110,55],[175,40],[240,58],[295,44],[360,50],[420,38],[480,52],[540,42],[590,48],[20,70],[90,80],[160,68],[230,82],[300,72],[370,85],[440,74],[515,88],[575,70],[15,95],[80,105],[155,92],[225,108],[310,98],[390,110],[460,95],[530,105],[580,92],[45,130]].map(([cx,cy],i) => (
      <circle key={i} cx={cx} cy={cy} r={i%3===0?1.2:0.7} fill="#fff" fillOpacity={0.3+(i%5)*0.1} />
    ))}
    <circle cx="520" cy="38" r="14" fill="none" stroke="#e07b39" strokeWidth="1.5" strokeOpacity="0.25" />
    <circle cx="520" cy="38" r="10" fill="#1e1006" />
    <circle cx="514" cy="34" r="8"  fill="#231208" />
    <rect x="0" y="0" width="600" height="300" fill="url(#wL)" />
    <rect x="0"   y="210" width="60"  height="90"  fill="#160c03" />
    <rect x="58"  y="225" width="45"  height="75"  fill="#130a02" />
    <rect x="100" y="200" width="55"  height="100" fill="#160c03" />
    <rect x="152" y="218" width="40"  height="82"  fill="#120902" />
    <rect x="380" y="205" width="50"  height="95"  fill="#160c03" />
    <rect x="428" y="220" width="40"  height="80"  fill="#130a02" />
    <rect x="465" y="195" width="65"  height="105" fill="#180d03" />
    <rect x="528" y="215" width="72"  height="85"  fill="#130a02" />
    <rect x="15"  y="245" width="55"  height="55"  fill="#1e1005" />
    <polygon points="15,245 42,215 70,245" fill="#271507" />
    <rect x="80"  y="252" width="48"  height="48"  fill="#1c0e04" />
    <polygon points="80,252 104,226 128,252" fill="#231306" />
    <rect x="98"  y="260" width="12"  height="10"  fill="#e07b39" fillOpacity="0.18" rx="1" />
    <rect x="420" y="248" width="52"  height="52"  fill="#1e1005" />
    <polygon points="420,248 446,218 472,248" fill="#271507" />
    <rect x="432" y="258" width="13"  height="10"  fill="#e07b39" fillOpacity="0.2" rx="1" />
    <rect x="490" y="255" width="60"  height="45"  fill="#1c0e04" />
    <polygon points="490,255 520,228 550,255" fill="#231306" />
    <rect x="555" y="260" width="50"  height="40"  fill="#1a0d03" />
    <polygon points="555,260 580,238 605,260" fill="#201004" />
    <rect x="0" y="278" width="600" height="22" fill="url(#gG)" />
    <line x1="0" y1="278" x2="600" y2="278" stroke="#3d1a06" strokeWidth="1" strokeOpacity="0.6" />
    <ellipse cx="302" cy="282" rx="38" ry="6" fill="#0d0602" fillOpacity="0.6" />
    <rect x="284" y="230" width="16" height="52" rx="5" fill="url(#fG)" />
    <rect x="304" y="230" width="16" height="52" rx="5" fill="url(#fG)" />
    <rect x="281" y="272" width="22" height="12" rx="4" fill="#1a0903" />
    <rect x="301" y="272" width="22" height="12" rx="4" fill="#1a0903" />
    <rect x="276" y="168" width="52" height="68" rx="8" fill="url(#fG)" />
    <rect x="274" y="224" width="56" height="10" rx="3" fill="url(#bG)" />
    <rect x="297" y="225" width="10" height="8"  rx="2" fill="#e07b39" />
    <rect x="278" y="225" width="9"  height="9"  rx="2" fill="#2a1005" stroke="#e07b39" strokeWidth="0.8" strokeOpacity="0.6" />
    <rect x="317" y="225" width="9"  height="9"  rx="2" fill="#2a1005" stroke="#e07b39" strokeWidth="0.8" strokeOpacity="0.6" />
    <rect x="257" y="170" width="18" height="48" rx="7" fill="url(#fG)" />
    <circle cx="266" cy="222" r="8" fill="#3d1a06" />
    <rect x="329" y="132" width="18" height="55" rx="7" fill="url(#fG)" transform="rotate(-18 338 160)" />
    <circle cx="357" cy="144" r="8" fill="#3d1a06" />
    <rect x="293" y="154" width="18" height="18" rx="4" fill="#3d1a06" />
    <ellipse cx="302" cy="144" rx="22" ry="20" fill="#3d1a06" />
    <ellipse cx="302" cy="142" rx="14" ry="12" fill="#4a2008" fillOpacity="0.5" />
    <ellipse cx="302" cy="128" rx="26" ry="8"  fill="url(#hG)" />
    <ellipse cx="302" cy="124" rx="20" ry="12" fill="url(#hG)" />
    <ellipse cx="302" cy="128" rx="26" ry="5"  fill="#e07b39" fillOpacity="0.25" />
    <rect x="282" y="122" width="40" height="4" rx="2" fill="#fff" fillOpacity="0.15" />
    <g transform="rotate(-35 355 130)">
      <rect x="348" y="90"  width="9"  height="42" rx="4" fill="#d97706" />
      <rect x="340" y="82"  width="25" height="14" rx="5" fill="#d97706" />
      <rect x="344" y="86"  width="8"  height="10" rx="2" fill="#1a0903" />
      <rect x="340" y="106" width="25" height="10" rx="4" fill="#c1440e" />
      <rect x="344" y="108" width="8"  height="8"  rx="2" fill="#1a0903" />
      <rect x="350" y="94"  width="3"  height="30" rx="1.5" fill="#fff" fillOpacity="0.18" />
    </g>
    <g transform="translate(220,155) rotate(30)">
      <rect x="-4" y="-18" width="8"  height="22" rx="3" fill="none" stroke="#e07b39" strokeWidth="1.8" strokeOpacity="0.7" />
      <rect x="-10" y="-26" width="20" height="12" rx="3" fill="none" stroke="#e07b39" strokeWidth="1.8" strokeOpacity="0.7" />
    </g>
    <circle cx="226" cy="146" r="16" fill="#e07b39" fillOpacity="0.06" />
    <g transform="translate(395,170) rotate(-15)">
      <line x1="0" y1="0"  x2="0"  y2="30" stroke="#e07b39" strokeWidth="2" strokeOpacity="0.7" strokeLinecap="round" />
      <line x1="0" y1="6"  x2="18" y2="6"  stroke="#e07b39" strokeWidth="2" strokeOpacity="0.7" strokeLinecap="round" />
      <rect x="14" y="-2" width="16" height="16" rx="4" fill="none" stroke="#e07b39" strokeWidth="1.8" strokeOpacity="0.7" />
    </g>
    <circle cx="248" cy="135" r="2.5" fill="#e07b39" fillOpacity="0.6" />
    <circle cx="365" cy="120" r="2"   fill="#e07b39" fillOpacity="0.5" />
    <circle cx="375" cy="155" r="1.5" fill="#d97706" fillOpacity="0.55" />
    <circle cx="235" cy="175" r="1.8" fill="#d97706" fillOpacity="0.5" />
    <circle cx="340" cy="100" r="2"   fill="#e07b39" fillOpacity="0.4" />
    <circle cx="268" cy="110" r="1.5" fill="#e07b39" fillOpacity="0.45" />
  </svg>
);

/* ─── Google Icon ────────────────────────────────────── */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

/* ─── Facebook Icon ──────────────────────────────────── */
const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="#1877F2" style={{ flexShrink: 0 }}>
    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
  </svg>
);

/* ═══════════════════════════════════════════════════════
   MOBILE VIEW  (base → lg)
   Layout: full-bleed dark hero → floating bottom-sheet form
═══════════════════════════════════════════════════════ */
const MobileAuthView: FC = () => {
  const router = useRouter();
  const { mode, setMode, role, setRole, fn, setFn, ln, setLn, email, setEmail, pass, setPass, show, setShow, busy, handleSubmit } = useAuthLogic();

  return (
    <Flex
      direction="column"
      minH="100vh"
      position="relative"
      bg="#0f0a04"
      overflowX="hidden"
    >
      {/* ── Ambient glow orbs ────────────────────────── */}
      <Box
        position="absolute" top="-60px" left="-60px"
        w="260px" h="260px" borderRadius="full"
        bg="radial-gradient(circle, rgba(224,123,57,0.18) 0%, transparent 70%)"
        pointerEvents="none"
        zIndex={0}
      />
      <Box
        position="absolute" top="80px" right="-80px"
        w="220px" h="220px" borderRadius="full"
        bg="radial-gradient(circle, rgba(193,68,14,0.12) 0%, transparent 70%)"
        pointerEvents="none"
        zIndex={0}
      />

      {/* ── Hero header ──────────────────────────────── */}
      <MotionBox
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        position="relative"
        zIndex={1}
        px={6}
        pt={12}
        pb={2}
      >
        {/* Brand row */}
        <HStack spacing={3} mb={6}>
          <MotionFlex
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.45, type: "spring", stiffness: 200 }}
            w={11} h={11}
            bg="linear-gradient(135deg, #e07b39, #c1440e)"
            borderRadius="2xl"
            align="center" justify="center"
            color="white"
            boxShadow="0 6px 24px rgba(193,68,14,.55)"
          >
            <Wrench size={22} />
          </MotionFlex>
          <Text color="white" fontSize="2xl" fontWeight={800} letterSpacing="tight" fontFamily="heading">
            HandyHub
          </Text>
        </HStack>

        {/* Headline */}
        <MotionBox
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
        >
          <Heading
            color="white" fontSize="3xl" fontWeight={800}
            lineHeight={1.1} letterSpacing="tight" fontFamily="heading" mb={2}
          >
            {mode === "login" ? "Welcome\nback." : "Join the\nplatform."}
            <Box as="span" display="block" color="#e07b39" mt={1} fontSize="2xl">
              Built for Botswana.
            </Box>
          </Heading>
          <Text color="whiteAlpha.500" fontSize="sm" lineHeight={1.65} mb={6}>
            Connect with skilled handymen across Gaborone &amp; beyond.
          </Text>
        </MotionBox>

        {/* Stats strip */}
        <MotionBox
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.45 }}
        >
          <HStack
            spacing={0}
            bg="rgba(255,255,255,0.04)"
            border="1px solid rgba(255,255,255,0.08)"
            borderRadius="2xl"
            overflow="hidden"
            mb={2}
          >
            {STATS.map((s, i) => (
              <Flex
                key={s.label}
                flex={1}
                direction="column"
                align="center"
                py={3}
                borderRight={i < STATS.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none"}
              >
                <Flex color="#e07b39" mb={1}>{s.icon}</Flex>
                <Text color="white" fontSize="sm" fontWeight={800}>{s.value}</Text>
                <Text color="whiteAlpha.400" fontSize="10px" fontWeight={600} textTransform="uppercase" letterSpacing="wide">
                  {s.label}
                </Text>
              </Flex>
            ))}
          </HStack>
        </MotionBox>
      </MotionBox>

      {/* ── SVG Illustration ─────────────────────────── */}
      <MotionBox
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.7 }}
        position="relative"
        zIndex={1}
        mt={-2}
      >
        <HandymanSVG />
        {/* Fade the bottom of the SVG into the form card */}
        <Box
          position="absolute" bottom={0} left={0} right={0} h="60px"
          bg="linear-gradient(to top, #131313, transparent)"
          pointerEvents="none"
        />
      </MotionBox>

      {/* ── Bottom-sheet form card ────────────────────── */}
      <MotionBox
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0,  opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        flex={1}
        bg="white"
        borderTopRadius="3xl"
        mt="-24px"
        position="relative"
        zIndex={2}
        pb={10}
        boxShadow="0 -12px 60px rgba(0,0,0,0.35)"
      >
        {/* Drag handle indicator */}
        <Flex justify="center" pt={3} pb={2}>
          <Box w={10} h={1} bg="gray.200" borderRadius="full" />
        </Flex>

        <VStack spacing={5} px={6} pt={2} align="stretch">

          {/* Mode toggle */}
          <Box
            bg="gray.100" borderRadius="2xl" p={1}
            display="flex" position="relative"
          >
            {/* Animated sliding pill */}
            <MotionBox
              layout
              layoutId="mobileModePill"
              position="absolute"
              top={1} bottom={1}
              borderRadius="xl"
              bg="white"
              boxShadow="0 2px 8px rgba(0,0,0,0.12)"
              style={{
                left: mode === "login" ? "4px" : "calc(50% + 2px)",
                width: "calc(50% - 6px)",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
            />
            {(["login", "register"] as AuthMode[]).map((m) => (
              <Box
                key={m}
                flex={1}
                textAlign="center"
                py="10px"
                borderRadius="xl"
                fontWeight={700}
                fontSize="sm"
                cursor="pointer"
                color={mode === m ? "gray.800" : "gray.500"}
                position="relative"
                zIndex={1}
                transition="color .2s"
                onClick={() => setMode(m)}
                style={{ userSelect: "none" }}
                textTransform="capitalize"
              >
                {m}
              </Box>
            ))}
          </Box>

          {/* AnimatePresence — form fields transition */}
          <AnimatePresence mode="wait">
            <MotionVStack
              key={mode}
              initial={{ opacity: 0, x: mode === "login" ? -16 : 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === "login" ? 16 : -16 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              spacing={4}
              align="stretch"
            >

              {/* Role picker — register only */}
              {mode === "register" && (
                <Stack spacing={2}>
                  <Text fontSize="11px" fontWeight={700} color="gray.400" textTransform="uppercase" letterSpacing="widest">
                    I am a…
                  </Text>
                  <HStack spacing={3}>
                    {ROLES.map((r) => (
                      <Flex
                        key={r.id}
                        flex={1}
                        direction="column"
                        align="center"
                        gap={2}
                        py={4}
                        borderRadius="2xl"
                        border="2px solid"
                        borderColor={role === r.id ? "#e07b39" : "gray.150"}
                        bg={role === r.id ? "orange.50" : "gray.50"}
                        cursor="pointer"
                        transition="all .2s"
                        onClick={() => setRole(r.id)}
                        position="relative"
                        overflow="hidden"
                      >
                        {/* Selected glow bg */}
                        {role === r.id && (
                          <Box
                            position="absolute" inset={0}
                            bg="linear-gradient(135deg, rgba(224,123,57,0.08), rgba(193,68,14,0.04))"
                            pointerEvents="none"
                          />
                        )}
                        <Flex
                          w={10} h={10} borderRadius="xl"
                          bg={role === r.id ? "linear-gradient(135deg, #e07b39, #c1440e)" : "white"}
                          border={role === r.id ? "none" : "1.5px solid"}
                          borderColor="gray.200"
                          color={role === r.id ? "white" : "gray.500"}
                          align="center" justify="center"
                          boxShadow={role === r.id ? "0 4px 12px rgba(193,68,14,.35)" : "none"}
                          transition="all .2s"
                        >
                          {r.icon}
                        </Flex>
                        <Text fontSize="sm" fontWeight={700} color={role === r.id ? "orange.800" : "gray.700"}>
                          {r.label}
                        </Text>
                        <Text fontSize="10px" color="gray.400" textAlign="center" px={2} lineHeight={1.4}>
                          {r.desc}
                        </Text>
                        {role === r.id && (
                          <Box position="absolute" top={2} right={2}>
                            <Check size={12} color="#c1440e" />
                          </Box>
                        )}
                      </Flex>
                    ))}
                  </HStack>
                </Stack>
              )}

              {/* Name fields — register only */}
              {mode === "register" && (
                <HStack spacing={3}>
                  <FormControl>
                    <FormLabel fontSize="xs" fontWeight={700} color="gray.600" mb={1}>First name</FormLabel>
                    <InputGroup>
                      <InputLeftElement h={14} pl={1} color="gray.400" pointerEvents="none">
                        <User size={16} />
                      </InputLeftElement>
                      <Input
                        placeholder="First" value={fn}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setFn(e.target.value)}
                        bg="gray.50" border="1.5px solid" borderColor="gray.200"
                        borderRadius="xl" h={14} fontSize="md"
                        _focus={{ borderColor: "#e07b39", bg: "white", boxShadow: "0 0 0 3px rgba(224,123,57,.12)" }}
                      />
                    </InputGroup>
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="xs" fontWeight={700} color="gray.600" mb={1}>Last name</FormLabel>
                    <Input
                      placeholder="Last" value={ln}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setLn(e.target.value)}
                      bg="gray.50" border="1.5px solid" borderColor="gray.200"
                      borderRadius="xl" h={14} fontSize="md"
                      _focus={{ borderColor: "#e07b39", bg: "white", boxShadow: "0 0 0 3px rgba(224,123,57,.12)" }}
                    />
                  </FormControl>
                </HStack>
              )}

              {/* Email */}
              <FormControl>
                <FormLabel fontSize="xs" fontWeight={700} color="gray.600" mb={1}>Email address</FormLabel>
                <InputGroup>
                  <InputLeftElement h={14} pl={1} color="gray.400" pointerEvents="none">
                    <Mail size={18} />
                  </InputLeftElement>
                  <Input
                    type="email" placeholder="you@example.com" value={email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    bg="gray.50" border="1.5px solid" borderColor="gray.200"
                    borderRadius="xl" h={14} fontSize="md"
                    _focus={{ borderColor: "#e07b39", bg: "white", boxShadow: "0 0 0 3px rgba(224,123,57,.12)" }}
                  />
                </InputGroup>
              </FormControl>

              {/* Password */}
              <FormControl>
                <FormLabel fontSize="xs" fontWeight={700} color="gray.600" mb={1}>Password</FormLabel>
                <InputGroup>
                  <InputLeftElement h={14} pl={1} color="gray.400" pointerEvents="none">
                    <Lock size={18} />
                  </InputLeftElement>
                  <Input
                    type={show ? "text" : "password"} pr={14}
                    placeholder="••••••••" value={pass}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPass(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    bg="gray.50" border="1.5px solid" borderColor="gray.200"
                    borderRadius="xl" h={14} fontSize="md"
                    _focus={{ borderColor: "#e07b39", bg: "white", boxShadow: "0 0 0 3px rgba(224,123,57,.12)" }}
                  />
                  <InputRightElement h={14} pr={2}>
                    <IconButton
                      aria-label={show ? "Hide password" : "Show password"}
                      icon={show ? <EyeOff size={16} /> : <Eye size={16} />}
                      variant="ghost" size="sm" color="gray.400"
                      onClick={() => setShow(!show)}
                      _hover={{ color: "gray.600", bg: "transparent" }}
                      minW={8} h={8}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              {/* Forgot password */}
              {mode === "login" && (
                <Flex justify="flex-end" mt={-2}>
                  <Text
                    fontSize="xs" color="#c1440e" fontWeight={700} cursor="pointer"
                    onClick={() => router.push(`/forgot-password?role=${role}`)}
                  >
                    Forgot password?
                  </Text>
                </Flex>
              )}

              {/* Primary CTA — full width, large touch target */}
              <Button
                h={14}
                borderRadius="2xl"
                bg="linear-gradient(135deg, #e07b39 0%, #c1440e 100%)"
                color="white"
                fontWeight={800}
                fontSize="md"
                letterSpacing="tight"
                rightIcon={<ChevronRight size={20} />}
                onClick={handleSubmit}
                isLoading={busy}
                loadingText="Please wait…"
                boxShadow="0 6px 24px rgba(193,68,14,.4)"
                _hover={{ boxShadow: "0 8px 32px rgba(193,68,14,.5)", transform: "translateY(-1px)" }}
                _active={{ transform: "translateY(0)", boxShadow: "0 4px 16px rgba(193,68,14,.35)" }}
                transition="all .2s"
                w="full"
              >
                {mode === "login" ? "Sign in" : "Create account"}
              </Button>

              {/* Divider */}
              <HStack spacing={3}>
                <Box flex={1} h="1px" bg="gray.150" />
                <Text fontSize="xs" color="gray.400" fontWeight={600} px={1}>or continue with</Text>
                <Box flex={1} h="1px" bg="gray.150" />
              </HStack>

              {/* Social buttons */}
              <Flex direction="column" gap={2}>
                <Flex
                  as="button"
                  align="center"
                  justify="center"
                  gap={3}
                  h="48px"
                  w="100%"
                  borderRadius="xl"
                  border="1.5px solid"
                  borderColor="gray.200"
                  bg="white"
                  color="gray.700"
                  fontWeight={600}
                  fontSize="sm"
                  cursor="pointer"
                  transition="all .18s"
                  style={{ outline: "none" }}
                  _hover={{ bg: "gray.50", borderColor: "gray.300" }}
                >
                  <GoogleIcon />
                  Continue with Google
                </Flex>
                <Flex
                  as="button"
                  align="center"
                  justify="center"
                  gap={3}
                  h="48px"
                  w="100%"
                  borderRadius="xl"
                  border="1.5px solid"
                  borderColor="#1877F2"
                  bg="white"
                  color="#1877F2"
                  fontWeight={600}
                  fontSize="sm"
                  cursor="pointer"
                  transition="all .18s"
                  style={{ outline: "none" }}
                  _hover={{ bg: "#f0f4ff" }}
                >
                  <FacebookIcon />
                  Continue with Facebook
                </Flex>
              </Flex>

            </MotionVStack>
          </AnimatePresence>

          {/* Legal footer */}
          <HStack justify="center" spacing={0} flexWrap="wrap" pt={1}>
            {[
              { label: "Terms",   href: "/legal/terms"   },
              { label: "Privacy", href: "/legal/privacy" },
              { label: "Cookies", href: "/legal/cookies" },
            ].map((l, i) => (
              <HStack key={l.href} spacing={2}>
                {i > 0 && <Text fontSize="10px" color="gray.300" px={1}>·</Text>}
                <Link href={l.href} style={{ fontSize: 11, color: "#9CA3AF", textDecoration: "none" }}>
                  {l.label}
                </Link>
              </HStack>
            ))}
          </HStack>

        </VStack>
      </MotionBox>
    </Flex>
  );
};

/* ═══════════════════════════════════════════════════════
   DESKTOP VIEW  (lg+)
   Layout: left dark hero panel | right form panel
═══════════════════════════════════════════════════════ */
const DesktopAuthView: FC = () => {
  const router = useRouter();
  const { mode, setMode, role, setRole, fn, setFn, ln, setLn, email, setEmail, pass, setPass, show, setShow, busy, handleSubmit } = useAuthLogic();

  return (
    <Flex minH="100vh" overflow="hidden">

      {/* ── Left hero panel ─────────────────────────── */}
      <Box
        flexDir="column"
        w="45%"
        position="relative"
        bg="linear-gradient(160deg, #0f0a04 0%, #1a1209 50%, #2a1608 100%)"
        overflow="hidden"
        px={10}
        pt={10}
        display="flex"
      >
        <HStack spacing={3} mb={8} position="relative" zIndex={2}>
          <Flex
            w={10} h={10}
            bg="linear-gradient(135deg, #e07b39, #c1440e)"
            borderRadius="xl"
            align="center" justify="center"
            color="white"
            boxShadow="0 4px 18px rgba(193,68,14,.5)"
          >
            <Wrench size={20} />
          </Flex>
          <Text color="white" fontSize="xl" fontWeight={800} letterSpacing="tight" fontFamily="heading">
            HandyHub
          </Text>
        </HStack>

        <Box position="relative" zIndex={2}>
          <Heading
            color="white" fontSize={{ lg: "3xl", xl: "4xl" }}
            fontWeight={700} lineHeight={1.15} letterSpacing="tight"
            fontFamily="heading" mb={4}
          >
            {mode === "login" ? "Welcome back." : "Join the platform."}<br />
            <Box as="span" color="brand.500">Built for Botswana.</Box>
          </Heading>
          <Text color="whiteAlpha.500" fontSize="sm" lineHeight={1.75} maxW="300px" mb={8}>
            Connect with skilled handymen across Gaborone, Francistown &amp; beyond.
          </Text>
          <VStack align="flex-start" spacing={3}>
            {FEATURES.map((feat) => (
              <HStack key={feat} spacing={3}>
                <Flex
                  w={6} h={6} borderRadius="full"
                  bg="rgba(224,123,57,.15)"
                  border="1px solid rgba(224,123,57,.3)"
                  align="center" justify="center"
                  flexShrink={0}
                >
                  <Check size={12} color="#e07b39" />
                </Flex>
                <Text color="whiteAlpha.700" fontSize="sm">{feat}</Text>
              </HStack>
            ))}
          </VStack>
        </Box>

        <Box position="absolute" bottom={0} left={0} right={0} zIndex={1}>
          <HandymanSVG />
        </Box>
        <Box position="absolute" bottom={0} left={0} right={0} h="80px" zIndex={1} pointerEvents="none"
          bgGradient="linear(to-t, rgba(15,10,4,0.7), transparent)" />
      </Box>

      {/* ── Right form panel ────────────────────────── */}
      <Flex
        flex={1}
        align="center"
        justify="center"
        bg="gray.50"
        px={10}
        py={10}
        overflowY="auto"
      >
        <VStack w="full" maxW="420px" spacing={6} align="stretch">

          <Box>
            <Text fontSize="xs" fontWeight={700} color="gray.400" textTransform="uppercase" letterSpacing="widest" mb={1}>
              HandyHub
            </Text>
            <Heading size="lg" color="gray.800" fontFamily="heading" letterSpacing="tight">
              {mode === "login" ? "Sign in to your account" : "Create your account"}
            </Heading>
          </Box>

          {/* Mode toggle */}
          <HStack bg="gray.100" borderRadius="full" p={1} spacing={0}>
            {(["login", "register"] as AuthMode[]).map((m) => (
              <Box
                key={m} flex={1} textAlign="center" py={2} borderRadius="full"
                fontWeight={700} fontSize="sm" cursor="pointer"
                bg={mode === m ? "white" : "transparent"}
                color={mode === m ? "gray.800" : "gray.500"}
                boxShadow={mode === m ? "sm" : "none"}
                transition="all .2s"
                onClick={() => setMode(m)}
                style={{ userSelect: "none" }}
                textTransform="capitalize"
              >
                {m}
              </Box>
            ))}
          </HStack>

          {/* Role picker */}
          {mode === "register" && (
            <Stack spacing={3}>
              <Text fontSize="xs" fontWeight={700} color="gray.500" textTransform="uppercase" letterSpacing="widest">I am a…</Text>
              {ROLES.map((r) => (
                <Flex
                  key={r.id} align="center" gap={4} p={4} borderRadius="xl" cursor="pointer"
                  border="1.5px solid"
                  borderColor={role === r.id ? "brand.500" : "gray.200"}
                  bg={role === r.id ? "orange.50" : "white"}
                  transition="all .2s"
                  onClick={() => setRole(r.id)}
                  _hover={{ borderColor: "brand.400", bg: role === r.id ? "orange.50" : "gray.50" }}
                >
                  <Flex
                    w={9} h={9} borderRadius="lg" flexShrink={0}
                    bg={role === r.id ? "brand.500" : "gray.100"}
                    color={role === r.id ? "white" : "gray.500"}
                    align="center" justify="center"
                    transition="all .2s"
                  >
                    {r.icon}
                  </Flex>
                  <Box flex={1}>
                    <Text fontWeight={700} fontSize="sm" color={role === r.id ? "orange.800" : "gray.800"}>{r.label}</Text>
                    <Text fontSize="xs" color="gray.500" mt={0.5}>{r.desc}</Text>
                  </Box>
                  {role === r.id && <Check size={16} color="#c1440e" />}
                </Flex>
              ))}
            </Stack>
          )}

          {/* Name fields */}
          {mode === "register" && (
            <HStack spacing={3}>
              <FormControl>
                <FormLabel fontSize="xs" fontWeight={600} color="gray.600" mb={1}>First name</FormLabel>
                <InputGroup>
                  <Input pl={10} placeholder="First name" value={fn}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFn(e.target.value)}
                    bg="white" borderRadius="xl" h={12} />
                  <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" color="gray.400" pointerEvents="none" zIndex={1}>
                    <User size={16} />
                  </Box>
                </InputGroup>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="xs" fontWeight={600} color="gray.600" mb={1}>Last name</FormLabel>
                <Input placeholder="Last name" value={ln}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setLn(e.target.value)}
                  bg="white" borderRadius="xl" h={12} />
              </FormControl>
            </HStack>
          )}

          {/* Email */}
          <FormControl>
            <FormLabel fontSize="xs" fontWeight={600} color="gray.600" mb={1}>Email address</FormLabel>
            <InputGroup>
              <Input type="email" pl={10} placeholder="you@example.com" value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                bg="white" borderRadius="xl" h={12} />
              <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" color="gray.400" pointerEvents="none" zIndex={1}>
                <Mail size={16} />
              </Box>
            </InputGroup>
          </FormControl>

          {/* Password */}
          <FormControl>
            <FormLabel fontSize="xs" fontWeight={600} color="gray.600" mb={1}>Password</FormLabel>
            <InputGroup>
              <Input type={show ? "text" : "password"} pl={10} pr={12}
                placeholder="••••••••" value={pass}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPass(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                bg="white" borderRadius="xl" h={12} />
              <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" color="gray.400" pointerEvents="none" zIndex={1}>
                <Lock size={16} />
              </Box>
              <InputRightElement h={12} pr={1}>
                <IconButton
                  aria-label={show ? "Hide password" : "Show password"}
                  icon={show ? <EyeOff size={16} /> : <Eye size={16} />}
                  variant="ghost" size="sm" color="gray.400"
                  onClick={() => setShow(!show)}
                  _hover={{ color: "gray.600", bg: "transparent" }}
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>

          {/* CTA */}
          <Button
            h={12} borderRadius="xl"
            bg="linear-gradient(135deg, #e07b39, #c1440e)"
            color="white" fontWeight={700} fontSize="sm"
            rightIcon={<ChevronRight size={18} />}
            onClick={handleSubmit}
            isLoading={busy}
            loadingText="Please wait…"
            _hover={{ transform: "translateY(-1px)", boxShadow: "0 6px 20px rgba(193,68,14,.4)" }}
            _active={{ transform: "translateY(0)" }}
            transition="all .2s"
          >
            {mode === "login" ? "Sign in" : "Create account"}
          </Button>

          {/* Divider */}
          <HStack spacing={3}>
            <Box flex={1} h="1px" bg="gray.200" />
            <Text fontSize="xs" color="gray.400" fontWeight={600}>or</Text>
            <Box flex={1} h="1px" bg="gray.200" />
          </HStack>

          {/* Social buttons */}
          <Flex direction="column" gap={2}>
            <Flex as="button" align="center" justify="center" gap={3}
              h="48px" w="100%" borderRadius="xl"
              border="1.5px solid" borderColor="gray.200"
              bg="white" color="gray.700" fontWeight={600} fontSize="sm"
              cursor="pointer" transition="all .18s" style={{ outline: "none" }}
              _hover={{ bg: "gray.50", borderColor: "gray.300" }}>
              <GoogleIcon />
              Continue with Google
            </Flex>
            <Flex as="button" align="center" justify="center" gap={3}
              h="48px" w="100%" borderRadius="xl"
              border="1.5px solid" borderColor="#1877F2"
              bg="white" color="#1877F2" fontWeight={600} fontSize="sm"
              cursor="pointer" transition="all .18s" style={{ outline: "none" }}
              _hover={{ bg: "#f0f4ff" }}>
              <FacebookIcon />
              Continue with Facebook
            </Flex>
          </Flex>

          {mode === "login" && (
            <Text textAlign="center" fontSize="xs" color="gray.500">
              Forgot your password?{" "}
              <Box as="span" color="brand.600" fontWeight={700} cursor="pointer"
                onClick={() => router.push(`/forgot-password?role=${role}`)}
                _hover={{ textDecoration: "underline" }}>
                Reset it
              </Box>
            </Text>
          )}

          <HStack justify="center" spacing={3} flexWrap="wrap" pt={2}>
            {[
              { label: "Terms",   href: "/legal/terms"   },
              { label: "Privacy", href: "/legal/privacy" },
              { label: "Cookies", href: "/legal/cookies" },
            ].map((l, i) => (
              <HStack key={l.href} spacing={3}>
                {i > 0 && <Text fontSize="xs" color="gray.300">·</Text>}
                <Link href={l.href} style={{ fontSize: 11, color: "#9CA3AF", textDecoration: "none" }}>
                  {l.label}
                </Link>
              </HStack>
            ))}
          </HStack>

        </VStack>
      </Flex>
    </Flex>
  );
};

/* ═══════════════════════════════════════════════════════
   ROOT — responsive switcher
═══════════════════════════════════════════════════════ */
export const AuthPage: FC = () => (
  <>
    <Box display={{ base: "block", lg: "none"  }}><MobileAuthView  /></Box>
    <Box display={{ base: "none",  lg: "block" }}><DesktopAuthView /></Box>
  </>
);
