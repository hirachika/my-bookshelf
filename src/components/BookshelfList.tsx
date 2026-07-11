"use client";

import { useState, useTransition } from "react";
import {
  Badge,
  Box,
  Button,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogPositioner,
  DialogRoot,
  DialogTitle,
  Flex,
  IconButton,
  Image,
  NativeSelect,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { deleteFromShelf, saveBookEdits } from "@/app/actions";
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

const STATUS_LABELS: Record<BookStatus, string> = {
  want: "読みたい",
  reading: "読書中",
  read: "読了",
  dropped: "挫折",
};

const STATUS_COLORS: Record<BookStatus, string> = {
  want: "gray",
  reading: "blue",
  read: "green",
  dropped: "red",
};

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

interface EditDialogProps {
  book: Book;
  open: boolean;
  onClose: () => void;
}

function EditDialog({ book, open, onClose }: EditDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<BookStatus>(book.status);
  const [finishedAt, setFinishedAt] = useState<string | null>(book.finishedAt);
  const [rating, setRating] = useState<number | null>(book.rating ?? null);
  const [comment, setComment] = useState<string>(book.comment ?? "");

  const handleSave = () => {
    onClose();
    startTransition(async () => {
      await saveBookEdits(book.id, {
        status,
        finishedAt,
        rating,
        comment: comment.trim() || null,
      });
    });
  };

  const handleDelete = () => {
    if (!window.confirm(`「${book.title}」を本棚から削除しますか？`)) return;
    onClose();
    startTransition(async () => {
      await deleteFromShelf(book.id);
    });
  };

  return (
    <DialogRoot open={open} onOpenChange={({ open }) => !open && onClose()} placement="center">
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent maxW="sm" mx="4" py="6" px="4">
          <DialogHeader>
            <DialogTitle fontSize="sm" fontWeight="bold" color="gray.800" lineClamp={2} pr="6">
              {book.title}
            </DialogTitle>
          </DialogHeader>
          <DialogCloseTrigger />
          <DialogBody display="flex" flexDirection="column" gap="4">
            {/* ステータス */}
            <Box>
              <Text fontSize="xs" color="gray.500" mb="1">ステータス</Text>
              <NativeSelect.Root width="full">
                <NativeSelect.Field
                  value={status}
                  onChange={(e) => setStatus(e.target.value as BookStatus)}
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
            </Box>

            {/* 読了日 */}
            <Box>
              <Text fontSize="xs" color="gray.500" mb="1">読了日</Text>
              <FinishedAtPicker
                value={finishedAt}
                onChange={(v) => setFinishedAt(v)}
                disabled={status !== "read"}
              />
            </Box>

            {/* 星評価 */}
            <Box>
              <Text fontSize="xs" color="gray.500" mb="1">評価</Text>
              <StarRating
                value={rating}
                onChange={(r) => setRating(r === 0 ? null : r)}
                disabled={status !== "read"}
                size="md"
              />
            </Box>

            {/* 一言コメント */}
            <Box>
              <Flex justify="space-between" mb="1">
                <Text fontSize="xs" color="gray.500">一言コメント</Text>
                <Text fontSize="xs" color={comment.length > 25 ? "red.500" : "gray.400"}>
                  {comment.length}/25
                </Text>
              </Flex>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, 25))}
                placeholder="25文字以内で一言..."
                fontSize="sm"
                rows={2}
                resize="none"
                bg="white"
              />
            </Box>
          </DialogBody>

          <DialogFooter gap="2" flexWrap="wrap">
            <IconButton
              onClick={handleDelete}
              disabled={isPending}
              aria-label="削除"
              variant="ghost"
              color="red.400"
              _hover={{ bg: "red.50" }}
              mr="auto"
            >
              <RiDeleteBin6Line />
            </IconButton>
            <Button variant="outline" colorPalette="gray" onClick={onClose} disabled={isPending} size="sm">
              キャンセル
            </Button>
            <Button
              onClick={handleSave}
              disabled={isPending || comment.length > 25}
              loading={isPending}
              loadingText="保存中..."
              colorPalette="orange"
              size="sm"
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
}

export default function BookshelfList({ books }: { books: Book[] }) {
  const [filter, setFilter] = useState<BookStatus | "all">("all");
  const [editingBook, setEditingBook] = useState<Book | null>(null);

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

  const thumbSrc = (book: Book) => (book.thumbnail ? book.thumbnail.replace("http://", "https://") : "/no-image.jpg");

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
        {filtered.length === 0 ? (
          <Box py="12" textAlign="center">
            <Text color="gray.300" fontSize="sm">まだ本がありません</Text>
          </Box>
        ) : (
          filtered.map((book) => (
            <Flex
              key={book.id}
              p="3"
              bg="white"
              rounded="8px"
              gap="3"
              align="flex-start"
              onClick={() => setEditingBook(book)}
              cursor="pointer"
              _hover={{ bg: "orange.50" }}
              transition="background 0.15s"
            >
              {/* サムネイル */}
              {book.thumbnail ? (
                <Image
                  src={thumbSrc(book)}
                  alt={book.title}
                  w="56px"
                  minH="84px"
                  fit="cover"
                  flexShrink={0}
                  rounded="sm"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/no-image.jpg";
                  }}
                />
              ) : (
                <Flex
                  w="56px"
                  minH="84px"
                  flexShrink={0}
                  rounded="sm"
                  bg="gray.100"
                  align="center"
                  justify="center"
                  fontSize="xl"
                  color="gray.300"
                >
                  📚
                </Flex>
              )}

              {/* コンテンツ */}
              <Box flex="1" minW="0">
                <Text fontSize="md" fontWeight="bold" color="gray.800" lineClamp={2}>
                  {book.title}
                </Text>
                <Text fontSize="xs" color="gray.500" truncate>{book.author}</Text>

                <Flex gap="1" mt="1" align="center" flexWrap="nowrap" overflow="hidden">
                  {book.categories[0] && (
                    <Badge colorPalette="orange" variant="subtle" size="sm" flexShrink={0} px="1">
                      {book.categories[0]}
                    </Badge>
                  )}
                  <Badge colorPalette={STATUS_COLORS[book.status]} variant="subtle" size="sm" px="1" flexShrink={0}>
                    {STATUS_LABELS[book.status]}
                  </Badge>
                  <StarRating value={book.rating ?? null} disabled size="sm" />
                  {book.finishedAt && (
                    <Text fontSize="xs" color="gray.600" flexShrink={0}>{formatDate(book.finishedAt)}</Text>
                  )}
                </Flex>

                {book.comment && (
                  <Text fontSize="xs" color="gray.500" mt="1" lineClamp={1}>
                    {book.comment}
                  </Text>
                )}
              </Box>
            </Flex>
          ))
        )}
      </Flex>

      {editingBook && (
        <EditDialog
          book={editingBook}
          open={!!editingBook}
          onClose={() => setEditingBook(null)}
        />
      )}
    </Box>
  );
}
