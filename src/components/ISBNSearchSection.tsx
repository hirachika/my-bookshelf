"use client";

import { useState } from "react";
import { Box, Button, Input } from "@chakra-ui/react";
import type { GoogleBookItem } from "@/types/book";
import BookCard from "./BookCard";

interface Props {
  existingIds: Set<string>;
}

export default function ISBNSearchSection({ existingIds }: Props) {
  const [isbn, setIsbn] = useState("");
  const [result, setResult] = useState<GoogleBookItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [localAdded, setLocalAdded] = useState<Set<string>>(new Set());

  const search = async () => {
    const cleaned = isbn.replace(/[-\s]/g, "");
    if (!cleaned) return;
    setLoading(true);
    setError("");
    setSearched(true);
    setResult(null);
    try {
      const res = await fetch(`/api/isbn?isbn=${encodeURIComponent(cleaned)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "API error");
      setResult(data.item ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "検索に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const onAdded = (id: string) => {
    setLocalAdded((prev) => new Set([...prev, id]));
  };

  return (
    <div>
      <div className="grid grid-cols-[1fr_4rem] gap-4">
        <Input
          type="text"
          value={isbn}
          onChange={(e) => setIsbn(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="ISBN-10 / ISBN-13（ハイフン可）"
          px="2"
          py="2"
          fontSize="sm"
          color="gray.700"
          bg="white"
          flex="1"
        />
        <Button
          onClick={search}
          disabled={loading || !isbn.trim()}
          loading={loading}
          loadingText="検索中..."
          colorPalette="orange"
          size="sm"
          className="shrink-0"
          _disabled={{ bg: "orange.300", color: "white", opacity: 1, cursor: "not-allowed" }}
        >
          検索
        </Button>
      </div>

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      {result && (
        <Box w="206px" mt="3">
          <BookCard book={result} isAdded={existingIds.has(result.id) || localAdded.has(result.id)} onAdded={onAdded} />
        </Box>
      )}

      {!loading && searched && !result && !error && (
        <p className="text-gray-400 text-sm py-4">該当する書籍が見つかりませんでした</p>
      )}
    </div>
  );
}
