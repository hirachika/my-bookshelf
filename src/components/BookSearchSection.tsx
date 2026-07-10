"use client";

import { useState } from "react";
import { Box, Button, Flex, Grid, Input, SimpleGrid, Text } from "@chakra-ui/react";
import type { GoogleBookItem } from "@/types/book";
import BookCard from "./BookCard";

const PER_PAGE = 12;

interface Props {
  existingIds: Set<string>;
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const pages: (number | "...")[] = [0];
  if (current > 3) pages.push("...");
  const start = Math.max(1, current - 2);
  const end = Math.min(total - 2, current + 2);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 4) pages.push("...");
  pages.push(total - 1);
  return pages;
}

export default function BookSearchSection({ existingIds }: Props) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [publisher, setPublisher] = useState("");
  const [results, setResults] = useState<GoogleBookItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [localAdded, setLocalAdded] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const totalPages = Math.ceil(Math.min(totalItems, 1000) / PER_PAGE);
  const hasInput = title.trim() || author.trim() || publisher.trim();

  const buildQuery = () => {
    const parts: string[] = [];
    if (title.trim()) parts.push(`intitle:${title.trim()}`);
    if (author.trim()) parts.push(`inauthor:${author.trim()}`);
    if (publisher.trim()) parts.push(`inpublisher:${publisher.trim()}`);
    return parts.join("+");
  };

  const fetchPage = async (q: string, pageIndex: number) => {
    setLoading(true);
    setError("");
    try {
      const startIndex = pageIndex * PER_PAGE;
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&startIndex=${startIndex}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "API error");
      setResults(data.items || []);
      setTotalItems(data.totalItems ?? 0);
      setPage(pageIndex);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("blocked") || msg.includes("PERMISSION_DENIED") || msg.includes("API key")) {
        setError("Google Books APIキーが無効または未設定です。Google Cloud ConsoleでAPIキーを確認してください。");
      } else if (
        msg.includes("Quota") ||
        msg.includes("quota") ||
        msg.includes("rateLimitExceeded") ||
        msg.includes("RATE_LIMIT")
      ) {
        setError("APIのクォータ制限に達しました。しばらく待ってから再試行してください。");
      } else {
        setError(`検索に失敗しました: ${msg || "不明なエラー"}`);
      }
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const search = () => {
    if (!hasInput) return;
    setSearched(true);
    setPage(0);
    setTotalItems(0);
    fetchPage(buildQuery(), 0);
  };

  const goToPage = (pageIndex: number) => {
    fetchPage(buildQuery(), pageIndex);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onAdded = (id: string) => {
    setLocalAdded((prev) => new Set([...prev, id]));
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") search();
  };

  return (
    <Box>
      <Grid gap="2" mb="2">
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="タイトル"
          px="2"
          py="2"
          fontSize="sm"
          color="gray.700"
          bg="white"
        />
        <Input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="著者名"
          px="2"
          py="2"
          fontSize="sm"
          color="gray.700"
          bg="white"
        />
        <Input
          type="text"
          value={publisher}
          onChange={(e) => setPublisher(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="出版社"
          px="2"
          py="2"
          fontSize="sm"
          color="gray.700"
          bg="white"
        />
        <Button
          onClick={search}
          disabled={loading || !hasInput}
          loading={loading}
          loadingText="検索中..."
          colorPalette="orange"
          size="sm"
          width="full"
        >
          検索
        </Button>
      </Grid>

      {error && (
        <Text color="red.500" fontSize="sm" mb="4">
          {error}
        </Text>
      )}

      {results.length > 0 && (
        <>
          <Flex align="center" justify="end" mb="3">
            <Text fontSize="xs" color="white">
              約{totalItems.toLocaleString()}件中 {page * PER_PAGE + 1}–{Math.min((page + 1) * PER_PAGE, totalItems)}件
            </Text>
          </Flex>

          <SimpleGrid columns={{ base: 1, md: 2 }} gap="2" mb="6">
            {results.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                isAdded={existingIds.has(book.id) || localAdded.has(book.id)}
                onAdded={onAdded}
              />
            ))}
          </SimpleGrid>

          {totalPages > 1 && (
            <Flex align="center" justify="center" gap=".5rem">
              <Button
                onClick={() => goToPage(page - 1)}
                disabled={page === 0 || loading}
                variant="outline"
                size="xs"
                colorPalette="gray"
                bg="white"
                p="2"
              >
                ← 前へ
              </Button>

              {getPageNumbers(page, totalPages).map((p, i) =>
                p === "..." ? (
                  <Text key={`ellipsis-${i}`} px="2" fontSize="xs" color="white">
                    ...
                  </Text>
                ) : (
                  <Button
                    key={p}
                    onClick={() => p !== page && goToPage(p as number)}
                    disabled={loading}
                    variant={p === page ? "solid" : "outline"}
                    colorPalette={p === page ? "orange" : "gray"}
                    bg={p === page ? "orange.500" : "white"}
                    color={p === page ? "white" : undefined}
                    size="xs"
                    minW="8"
                  >
                    {(p as number) + 1}
                  </Button>
                ),
              )}

              <Button
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages - 1 || loading}
                variant="outline"
                size="xs"
                colorPalette="gray"
                bg="white"
                p="2"
              >
                次へ →
              </Button>
            </Flex>
          )}
        </>
      )}

      {!loading && searched && results.length === 0 && !error && (
        <Text color="gray.400" fontSize="sm" textAlign="center" py="8">
          検索結果が見つかりませんでした
        </Text>
      )}
    </Box>
  );
}
