"use client";

import { useState } from "react";
import { Box, Button, Flex, Grid, Input, NativeSelect, SimpleGrid, Text } from "@chakra-ui/react";
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

type SearchType = "" | "intitle" | "inauthor" | "inpublisher";

const SEARCH_TYPES: { value: SearchType; label: string }[] = [
  { value: "", label: "全て" },
  { value: "intitle", label: "タイトル" },
  { value: "inauthor", label: "著者" },
  { value: "inpublisher", label: "出版社" },
];

export default function BookSearchSection({ existingIds }: Props) {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("");
  const [results, setResults] = useState<GoogleBookItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [localAdded, setLocalAdded] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const totalPages = Math.ceil(Math.min(totalItems, 1000) / PER_PAGE);

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
      if (msg.includes("blocked") || msg.includes("PERMISSION_DENIED")) {
        setError("Books APIが有効化されていません。Google Cloud ConsoleでBooks APIを有効にしてください。");
      } else if (msg.includes("Quota") || msg.includes("quota")) {
        setError("APIのクォータ制限に達しました。しばらく待ってから再試行してください。");
      } else {
        setError("検索に失敗しました。もう一度お試しください。");
      }
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const buildQuery = (q: string) => (searchType ? `${searchType}:${q.trim()}` : q.trim());

  const search = () => {
    if (!query.trim()) return;
    setSearched(true);
    setPage(0);
    setTotalItems(0);
    fetchPage(buildQuery(query), 0);
  };

  const goToPage = (pageIndex: number) => {
    fetchPage(buildQuery(query), pageIndex);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onAdded = (id: string) => {
    setLocalAdded((prev) => new Set([...prev, id]));
  };

  return (
    <Box>
      <Grid templateColumns="1fr 1fr 4rem" gap="4">
        <NativeSelect.Root>
          <NativeSelect.Field
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as SearchType)}
            px="2"
            py="2"
            fontSize="sm"
            color="gray.700"
            bg="white"
          >
            {SEARCH_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder={
            searchType === "intitle"
              ? "タイトルで検索..."
              : searchType === "inauthor"
                ? "著者名で検索..."
                : searchType === "inpublisher"
                  ? "出版社名で検索..."
                  : "タイトル、著者名などで検索..."
          }
          px="2"
          py="2"
          fontSize="sm"
          color="gray.700"
          bg="white"
          flex="1"
        />
        <Button
          onClick={search}
          disabled={loading || !query.trim()}
          loading={loading}
          loadingText="検索中..."
          colorPalette="orange"
          size="sm"
          className="shrink-0"
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

          <SimpleGrid columns={2} gap="2" mb="6">
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
