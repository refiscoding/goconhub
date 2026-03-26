"use client";
import { FC, useState, useEffect } from "react";
import {
  Box, Flex, Text, Button, Input, FormControl, FormLabel,
  FormHelperText, Spinner, Divider,
} from "@chakra-ui/react";

export const SettingsTab: FC = () => {
  const [commissionRate, setCommissionRate] = useState("");
  const [adminEmail,     setAdminEmail]     = useState("");
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch("/api/admin/settings");
        const data = await res.json();
        setCommissionRate(data.commissionRate ?? "");
        setAdminEmail(data.adminEmail ?? "");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commissionRate, adminEmail }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box className="page-enter" maxW="480px">
      <Text fontFamily="'Sora', sans-serif" fontSize="22px" fontWeight="800"
        letterSpacing="-0.02em" color="var(--ink)" mb={5}>
        Platform Settings
      </Text>

      {loading ? (
        <Flex justify="center" py={10}><Spinner size="md" color="var(--acc)" /></Flex>
      ) : (
        <Box bg="var(--card)" borderRadius="14px" boxShadow="md" p={6}>
          <Flex direction="column" gap={5}>
            <FormControl>
              <FormLabel fontSize="13px" fontWeight={600} color="var(--ink)" mb={1}>
                Platform Commission Rate (%)
              </FormLabel>
              <Input
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                type="number"
                min={0}
                max={100}
                step={0.1}
                placeholder="e.g. 10"
                fontSize="14px"
                borderColor="var(--border)"
              />
              <FormHelperText fontSize="11px" color="var(--ink3)" mt={1}>
                Percentage deducted from each transaction as platform fee.
              </FormHelperText>
            </FormControl>

            <Divider borderColor="var(--border)" />

            <FormControl>
              <FormLabel fontSize="13px" fontWeight={600} color="var(--ink)" mb={1}>
                Admin Email
              </FormLabel>
              <Input
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                type="email"
                placeholder="admin@example.com"
                fontSize="14px"
                borderColor="var(--border)"
              />
              <FormHelperText fontSize="11px" color="var(--ink3)" mt={1}>
                Receives platform notifications and dispute alerts.
              </FormHelperText>
            </FormControl>

            <Button
              colorScheme={saved ? "green" : "blue"}
              size="sm"
              fontSize="13px"
              isLoading={saving}
              onClick={handleSave}
              alignSelf="flex-start"
              px={6}
            >
              {saved ? "Saved" : "Save Settings"}
            </Button>
          </Flex>
        </Box>
      )}
    </Box>
  );
};
