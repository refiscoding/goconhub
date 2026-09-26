"use client";
import { FC, useState, useEffect } from "react";
import {
  Box, Flex, Text, Button, Input, IconButton, Spinner,
  Card, CardBody,
} from "@chakra-ui/react";
import { Pencil, Trash2, Plus, Check, X, Tag } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

export const CategoriesTab: FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [addName, setAddName]       = useState("");
  const [adding, setAdding]         = useState(false);
  const [editId, setEditId]         = useState<string | null>(null);
  const [editName, setEditName]     = useState("");
  const [saving, setSaving]         = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/categories");
      const data = await res.json();
      setCategories(data.categories ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    const name = addName.trim();
    if (!name) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        const data = await res.json();
        setCategories((prev) => [...prev, data.category]);
        setAddName("");
        setAdding(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (id: string) => {
    const name = editName.trim();
    if (!name) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        setCategories((prev) => prev.map((c) => c.id === id ? { ...c, name } : c));
        setEditId(null);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (res.ok) setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <Box className="page-enter">
      <Flex align="center" justify="space-between" mb={5}>
        <Text fontFamily="'Sora', sans-serif" fontSize="22px" fontWeight="800"
          letterSpacing="-0.02em" color="var(--ink)">
          Service Categories
        </Text>
        {!adding && (
          <Button size="sm" colorScheme="blue" leftIcon={<Plus size={14} />}
            fontSize="12px" onClick={() => setAdding(true)}>
            Add Category
          </Button>
        )}
      </Flex>

      {adding && (
        <Card bg="var(--card)" borderRadius="14px" shadow="md" mb={3}>
          <CardBody p={4}>
            <Flex gap={2} align="center">
              <Input
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                placeholder="Category name (e.g. Plumbing)"
                fontSize="13px"
                size="sm"
                borderColor="var(--border)"
                onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") { setAdding(false); setAddName(""); } }}
                autoFocus
              />
              <IconButton aria-label="Save" icon={<Check size={14} />} size="sm"
                colorScheme="green" isLoading={saving} onClick={handleAdd} />
              <IconButton aria-label="Cancel" icon={<X size={14} />} size="sm"
                variant="outline" borderColor="var(--border)"
                onClick={() => { setAdding(false); setAddName(""); }} />
            </Flex>
          </CardBody>
        </Card>
      )}

      {loading ? (
        <Flex justify="center" py={10}><Spinner size={{ base: "sm", md: "md" }} color="var(--navy)" thickness="3px" speed="0.65s" /></Flex>
      ) : categories.length === 0 ? (
        <Text textAlign="center" color="var(--ink3)" py={10}>No categories yet</Text>
      ) : (
        <Flex direction="column" gap={1.5}>
          {categories.map((cat) => (
            <Card key={cat.id} bg="var(--card)" borderRadius="10px" shadow="sm">
              <CardBody px={3} py={2}>
                {editId === cat.id ? (
                  <Flex gap={2} align="center">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      fontSize="12px"
                      size="sm"
                      borderColor="var(--border)"
                      onKeyDown={(e) => { if (e.key === "Enter") handleEdit(cat.id); if (e.key === "Escape") setEditId(null); }}
                      autoFocus
                    />
                    <IconButton aria-label="Save" icon={<Check size={13} />} size="xs"
                      colorScheme="green" isLoading={saving} onClick={() => handleEdit(cat.id)} />
                    <IconButton aria-label="Cancel" icon={<X size={13} />} size="xs"
                      variant="outline" borderColor="var(--border)"
                      onClick={() => setEditId(null)} />
                  </Flex>
                ) : (
                  <Flex align="center" justify="space-between">
                    <Flex align="center" gap={2}>
                      <Flex align="center" justify="center"
                        w="26px" h="26px" borderRadius="7px"
                        bg="var(--acc-bg, var(--navy-soft))" flexShrink={0}>
                        <Tag size={13} color="var(--acc, var(--navy))" />
                      </Flex>
                      <Text fontSize="13px" fontWeight={600} color="var(--ink)">{cat.name}</Text>
                    </Flex>
                    <Flex gap={0.5}>
                      <IconButton aria-label="Edit" icon={<Pencil size={12} />} size="xs"
                        variant="ghost" color="var(--ink3)"
                        onClick={() => { setEditId(cat.id); setEditName(cat.name); }} />
                      <IconButton aria-label="Delete" icon={<Trash2 size={12} />} size="xs"
                        variant="ghost" color="red.400"
                        onClick={() => handleDelete(cat.id, cat.name)} />
                    </Flex>
                  </Flex>
                )}
              </CardBody>
            </Card>
          ))}
        </Flex>
      )}
    </Box>
  );
};
