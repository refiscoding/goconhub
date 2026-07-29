"use client";

import { ChangeEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Alert, AlertDescription, AlertIcon, Box, Button, FormControl, FormLabel,
  HStack, IconButton, Input, InputGroup, InputLeftElement, InputRightElement,
  Radio, RadioGroup, Stack, Text,
} from "@chakra-ui/react";
import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useUser } from "@/context/UserContext";
import type { AuthMode, Role } from "@/lib/types";

export function AuthPage() {
  const router = useRouter();
  const { refresh } = useUser();
  const [mode, setMode] = useState<AuthMode>("login");
  const [role, setRole] = useState<Role>("customer");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    if (!email || !password) return setError("Enter your email address and password.");
    if (mode === "register" && (!firstName || !lastName)) return setError("Enter your first and last name.");
    setBusy(true);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body = mode === "login"
        ? { email, password }
        : { email, password, firstName, lastName, role };
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) return setError(data.message ?? "We couldn’t complete that request.");
      await refresh();
      if (mode === "register") {
        window.location.href = role === "vendor" ? "/onboarding/vendor" : "/onboarding/customer";
      } else {
        const userRole = data.user?.role ?? role;
        window.location.href = userRole === "vendor"
          ? "/vendor/dashboard"
          : userRole === "admin" ? "/admin/dashboard" : "/customer/explore";
      }
    } catch {
      setError("Connection problem. Check your internet and try again.");
    } finally {
      setBusy(false);
    }
  }

  const fieldProps = {
    h: "48px",
    borderRadius: "10px",
    borderColor: "gray.300",
    bg: "white",
    _hover: { borderColor: "gray.500" },
    _focusVisible: { borderColor: "black", boxShadow: "0 0 0 3px rgba(0,0,0,.14)" },
  };

  return (
    <Box minH="100svh" position="relative" overflow="hidden">
      <Image
        src="/brand/contractor-login.png"
        alt=""
        fill
        priority
        sizes="100vw"
        style={{ objectFit: "cover", objectPosition: "center" }}
      />
      <Box position="absolute" inset={0} bg="rgba(255,255,255,.78)" />
      <Box position="absolute" inset={0} bg="linear-gradient(90deg, rgba(255,255,255,.22), rgba(255,255,255,.08))" />

      <Box
        position="relative"
        zIndex={1}
        minH="100svh"
        display="grid"
        placeItems="center"
        px={{ base: 4, md: 8 }}
        py={{ base: 6, md: 10 }}
      >
        <Box
          as="main"
          w="full"
          maxW="460px"
          bg="rgba(255,255,255,.94)"
          border="1px solid"
          borderColor="rgba(0,0,0,.14)"
          borderRadius={{ base: "20px", md: "24px" }}
          boxShadow="0 24px 70px rgba(0,0,0,.18)"
          backdropFilter="blur(12px)"
          px={{ base: 6, md: 10 }}
          py={{ base: 7, md: 9 }}
        >
          <Stack spacing={6}>
            <Box textAlign="center">
              <Image src="/brand/gocon-logo.svg" alt="GoCon" width={132} height={132} priority style={{ margin: "0 auto" }} />
              <Text mt={2} fontSize={{ base: "xl", md: "2xl" }} fontWeight="800" letterSpacing="-0.03em">
                {mode === "login" ? "Welcome back" : "Create your account"}
              </Text>
              <Text mt={1} color="gray.600" fontSize="sm">
                Botswana&apos;s trusted contractor marketplace
              </Text>
            </Box>

            <HStack spacing={1} bg="gray.100" p={1} borderRadius="12px" aria-label="Authentication mode">
              {(["login", "register"] as AuthMode[]).map((item) => (
                <Button
                  key={item}
                  flex={1}
                  h="40px"
                  borderRadius="9px"
                  variant="ghost"
                  bg={mode === item ? "black" : "transparent"}
                  color={mode === item ? "white" : "gray.600"}
                  _hover={{ bg: mode === item ? "gray.800" : "gray.200" }}
                  _focusVisible={{ boxShadow: "0 0 0 3px rgba(0,0,0,.2)" }}
                  onClick={() => { setMode(item); setError(""); }}
                >
                  {item === "login" ? "Sign in" : "Register"}
                </Button>
              ))}
            </HStack>

            {error && (
              <Alert status="error" borderRadius="10px" bg="gray.100" border="1px solid" borderColor="black" color="black">
                <AlertIcon color="black" />
                <AlertDescription fontSize="sm" fontWeight="600">{error}</AlertDescription>
              </Alert>
            )}

            <Stack spacing={4}>
              {mode === "register" && (
                <>
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="700">I want to</FormLabel>
                    <RadioGroup value={role} onChange={(value) => setRole(value as Role)}>
                      <HStack spacing={5}>
                        <Radio value="customer" colorScheme="blackAlpha">Hire a contractor</Radio>
                        <Radio value="vendor" colorScheme="blackAlpha">Offer services</Radio>
                      </HStack>
                    </RadioGroup>
                  </FormControl>
                  <HStack align="start">
                    <FormControl isRequired>
                      <FormLabel fontSize="sm" fontWeight="700">First name</FormLabel>
                      <Input value={firstName} onChange={(e: ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)} {...fieldProps} />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel fontSize="sm" fontWeight="700">Last name</FormLabel>
                      <Input value={lastName} onChange={(e: ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)} {...fieldProps} />
                    </FormControl>
                  </HStack>
                </>
              )}

              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="700">Email address</FormLabel>
                <InputGroup>
                  <InputLeftElement h="48px" color="gray.500"><Mail size={17} /></InputLeftElement>
                  <Input type="email" value={email} placeholder="you@example.com" onChange={(e) => setEmail(e.target.value)} {...fieldProps} />
                </InputGroup>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="700">Password</FormLabel>
                <InputGroup>
                  <InputLeftElement h="48px" color="gray.500"><LockKeyhole size={17} /></InputLeftElement>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    placeholder="Enter your password"
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                    {...fieldProps}
                  />
                  <InputRightElement h="48px">
                    <IconButton
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      icon={showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword((value) => !value)}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              {mode === "login" && (
                <Text textAlign="right" fontSize="sm">
                  <Link href={`/forgot-password?role=${role}`} style={{ color: "#111", fontWeight: 700, textDecoration: "underline" }}>
                    Forgot password?
                  </Link>
                </Text>
              )}

              <Button
                h="50px"
                bg="black"
                color="white"
                borderRadius="10px"
                leftIcon={<UserRound size={17} />}
                isLoading={busy}
                loadingText="Please wait"
                onClick={submit}
                _hover={{ bg: "gray.700" }}
                _active={{ bg: "gray.800" }}
                _focusVisible={{ boxShadow: "0 0 0 4px rgba(0,0,0,.2)" }}
              >
                {mode === "login" ? "Sign in to GoCon" : "Create GoCon account"}
              </Button>
            </Stack>

            <Text textAlign="center" color="gray.600" fontSize="xs">
              By continuing, you agree to our{" "}
              <Link href="/legal/terms" style={{ color: "#111", textDecoration: "underline" }}>Terms</Link>
              {" "}and{" "}
              <Link href="/legal/privacy" style={{ color: "#111", textDecoration: "underline" }}>Privacy Policy</Link>.
            </Text>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
