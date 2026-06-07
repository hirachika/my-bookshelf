"use client";

import { useState, useTransition } from "react";
import { Badge, Box, Button, Flex, IconButton, Image, NativeSelect, Text } from "@chakra-ui/react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { changeStatus, deleteFromShelf, updateFinishedAt, updateRating } from "@/app/actions";
import dynamic from "next/dynamic";
import StarRating from "./StarRating";
import type { Book, BookStatus } from "@/types/book";

const FinishedAtPicker = dynamic(() => import("./FinishedAtPicker"), { ssr: false });

const FILTERS: Array<{ value: BookStatus | "all"; label: string }> = [
  { value: "all", label: "全て" },
  { value: "want", label: "読みたい" },
  { value: "reading", label: "読書中" },
  { value: "read", label: "読了" },
  { value: "dropped", label: "挫折" },
];

export default function BookshelfList({ books }: { books: Book[] }) {
  const [filter, setFilter] = useState<BookStatus | "all">("all");
  const [isPending, startTransition] = useTransition();

  const filtered = (filter === "all" ? books : books.filter((b) => b.status === filter)).slice().sort((a, b) => {
    const ta = a.finishedAt ? new Date(a.finishedAt).getTime() : 0;
    const tb = b.finishedAt ? new Date(b.finishedAt).getTime() : 0;
    return tb - ta;
  });

  const counts: Record<string, number> = {
    all: books.length,
    want: books.filter((b) => b.status === "want").length,
    reading: books.filter((b) => b.status === "reading").length,
    read: books.filter((b) => b.status === "read").length,
    dropped: books.filter((b) => b.status === "dropped").length,
  };

  const handleStatusChange = (id: string, status: BookStatus) => {
    startTransition(async () => {
      await changeStatus(id, status);
    });
  };

  const handleFinishedAtChange = (id: string, value: string) => {
    startTransition(async () => {
      await updateFinishedAt(id, value ? new Date(value + "T00:00:00Z").toISOString() : null);
    });
  };

  const handleRatingChange = (id: string, rating: number) => {
    startTransition(async () => {
      await updateRating(id, rating === 0 ? null : rating);
    });
  };

  const handleDelete = (id: string, title: string) => {
    if (!window.confirm(`「${title}」を本棚から削除しますか？`)) return;
    startTransition(async () => {
      await deleteFromShelf(id);
    });
  };

  const thumbSrc = (book: Book) => (book.thumbnail ? book.thumbnail.replace("http://", "https://") : "/no-image.jpg");

  const statusSelect = (book: Book, width: string, fontSize: "sm" | "xs" = "sm") => (
    <NativeSelect.Root disabled={isPending} width={width}>
      <NativeSelect.Field
        value={book.status}
        onChange={(e) => handleStatusChange(book.id, e.target.value as BookStatus)}
        px="2"
        py="1.5"
        fontSize={fontSize}
        color="gray.700"
        bg="white"
      >
        <option value="want">読みたい</option>
        <option value="reading">読書中</option>
        <option value="read">読了</option>
        <option value="dropped">挫折</option>
      </NativeSelect.Field>
      <NativeSelect.Indicator />
    </NativeSelect.Root>
  );

  const deleteBtn = (book: Book) => (
    <IconButton
      onClick={() => handleDelete(book.id, book.title)}
      disabled={isPending}
      aria-label="削除"
      variant="ghost"
      size="xs"
      color="gray.300"
      _hover={{ color: "red.400" }}
    >
      <RiDeleteBin6Line />
    </IconButton>
  );

  const empty = (
    <Box py="12" textAlign="center">
      <Text color="gray.300" fontSize="sm">
        まだ本がありません
      </Text>
    </Box>
  );

  return (
    <Box>
      {/* フィルターボタン */}
      <Flex gap="1" pb="2" flexWrap="wrap">
        {FILTERS.map((f) => (
          <Button
            key={f.value}
            onClick={() => setFilter(f.value)}
            variant={filter === f.value ? "solid" : "outline"}
            colorPalette={filter === f.value ? "orange" : "gray"}
            bg={filter === f.value ? undefined : "white"}
            size="xs"
            borderRadius="full"
            px="2"
          >
            {f.label}
            <Text as="span" ml="1" opacity={filter === f.value ? 0.7 : 0.5} fontSize="xs">
              {counts[f.value]}
            </Text>
          </Button>
        ))}
      </Flex>

      <Flex direction="column" gap="2">
        {filtered.length === 0
          ? empty
          : filtered.map((book) => (
              <Flex key={book.id} align="center" p="2" gap="8px" bg="white" rounded="8px">
                {/* Image */}
                <Image
                  src={thumbSrc(book)}
                  alt={book.title}
                  w="54px"
                  fit="cover"
                  flexShrink={0}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/no-image.jpg";
                  }}
                />

                <Flex flex="1" direction="column">
                  <Flex gap="2" alignItems="center">
                    <Box w="full">
                      <Text fontSize="sm" fontWeight="bold" color="gray.800">
                        {book.title}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {book.author}
                      </Text>
                    </Box>
                    {/* 削除ボタン */}
                    {deleteBtn(book)}
                  </Flex>

                  <Flex alignItems="center" justify="space-between" gap="2">
                    <Flex direction="column" minW="0" flex="1">
                      <Flex>
                        {book.categories[0] && (
                          <Badge colorPalette="orange" variant="subtle" size="sm" flexShrink={0}>
                            {book.categories[0]}
                          </Badge>
                        )}
                      </Flex>
                      <StarRating
                        value={book.rating ?? null}
                        onChange={(r) => handleRatingChange(book.id, r)}
                        disabled={book.status !== "read"}
                      />
                    </Flex>

                    <Flex gap="1" flexShrink={0} align="flex-end">
                      {statusSelect(book, "72px", "xs")}
                      <FinishedAtPicker
                        value={book.finishedAt}
                        onChange={(v) => handleFinishedAtChange(book.id, v ? v : "")}
                        disabled={book.status !== "read"}
                        width="90px"
                      />
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
            ))}
      </Flex>
    </Box>
  );
}
