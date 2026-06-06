"use client";

import { useState, useTransition } from "react";
import { Badge, Box, Button, Flex, IconButton, Image, NativeSelect, Text } from "@chakra-ui/react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { changeStatus, deleteFromShelf, updateFinishedAt, updateRating } from "@/app/actions";
import StarRating from "./StarRating";
import FinishedAtPicker from "./FinishedAtPicker";
import type { Book, BookStatus } from "@/types/book";

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

  return (
    <Box>
      <Flex gap="2" px="3" pt="3" pb="1" flexWrap="wrap">
        {FILTERS.map((f) => (
          <Button
            key={f.value}
            onClick={() => setFilter(f.value)}
            variant={filter === f.value ? "solid" : "outline"}
            colorPalette={filter === f.value ? "orange" : "gray"}
            bg={filter === f.value ? undefined : "white"}
            size="xs"
            borderRadius="full"
            px="3"
          >
            {f.label}
            <Text as="span" ml="1" opacity={filter === f.value ? 0.7 : 0.5} fontSize="xs">
              {counts[f.value]}
            </Text>
          </Button>
        ))}
      </Flex>

      <Flex direction="column" gap="2" p="3">
        {filtered.length === 0 ? (
          <Box py="12" textAlign="center">
            <Text color="gray.300" fontSize="sm">
              まだ本がありません
            </Text>
          </Box>
        ) : (
          filtered.map((book) => (
            <Flex
              key={book.id}
              direction="row"
              justify="space-between"
              align="center"
              px="12px"
              py="15px"
              gap="2"
              minH="100px"
              bg="white"
              rounded="lg"
            >
              <Image
                src={book.thumbnail ? book.thumbnail.replace("http://", "https://") : "/no-image.jpg"}
                alt={book.title}
                h="70px"
                w="48px"
                fit="cover"
                rounded="sm"
                flexShrink={0}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/no-image.jpg";
                }}
              />

              <Box flex="1" minW="0" overflow="hidden">
                <Text fontSize="sm" fontWeight="bold" color="gray.800" lineHeight="tight" mb="0.5">
                  {book.title}
                </Text>
                <Text fontSize="xs" color="gray.400" truncate>
                  {book.author}
                </Text>
                <StarRating
                  value={book.rating ?? null}
                  onChange={(r) => handleRatingChange(book.id, r)}
                  disabled={book.status !== "read"}
                />
                {book.categories.length > 0 && (
                  <Flex flexWrap="wrap" gap="1" mt="0.5">
                    {book.categories.slice(0, 2).map((cat) => (
                      <Badge key={cat} colorPalette="orange" variant="subtle" size="sm">
                        {cat}
                      </Badge>
                    ))}
                  </Flex>
                )}
              </Box>

              <Flex align="center" gap="1.5" flexShrink={0}>
                <FinishedAtPicker
                  value={book.finishedAt}
                  onChange={(v) => handleFinishedAtChange(book.id, v ? v : "")}
                  disabled={book.status !== "read"}
                />
                <NativeSelect.Root disabled={isPending} width="100px">
                  <NativeSelect.Field
                    value={book.status}
                    onChange={(e) => handleStatusChange(book.id, e.target.value as BookStatus)}
                    px="2"
                    py="2"
                    fontSize="sm"
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
              </Flex>
            </Flex>
          ))
        )}
      </Flex>
    </Box>
  );
}
