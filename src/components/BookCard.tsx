"use client";

import { useTransition } from "react";
import { Badge, Box, Button, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { addToShelf } from "@/app/actions";
import type { BookStatus, GoogleBookItem } from "@/types/book";

interface Props {
  book: GoogleBookItem;
  isAdded: boolean;
  onAdded: (id: string) => void;
}

export default function BookCard({ book, isAdded, onAdded }: Props) {
  const { volumeInfo } = book;
  const [isPending, startTransition] = useTransition();
  const thumbnail = volumeInfo.imageLinks?.thumbnail?.replace("http://", "https://") || "";
  const author = (volumeInfo.authors || []).join(", ") || "著者不明";

  const handleAdd = (status: BookStatus) => {
    startTransition(async () => {
      await addToShelf(
        {
          id: book.id,
          title: volumeInfo.title || "タイトル不明",
          author,
          publisher: volumeInfo.publisher || "",
          description: volumeInfo.description || "",
          thumbnail,
          categories: volumeInfo.categories || [],
        },
        status,
      );
      onAdded(book.id);
    });
  };

  return (
    <Flex direction="row" align="flex-start" p="10px" gap="10px" bg="white" rounded="lg" overflow="hidden">
      {/* サムネイル */}
      <Image
        src={thumbnail || "/no-image.jpg"}
        alt={volumeInfo.title}
        w="56px"
        h="72px"
        fit="cover"
        rounded="sm"
        flexShrink={0}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = "/no-image.jpg";
        }}
      />

      {/* コンテンツ */}
      <Flex direction="column" flex="1" minW="0" gap="6px">
        {/* タイトル・著者 */}
        <Box>
          <Text fontSize="sm" fontWeight="bold" color="gray.900" lineHeight="tight" lineClamp={2} mb="2px">
            {volumeInfo.title || "タイトル不明"}
          </Text>
          <Text fontSize="xs" color="gray.400" truncate>
            {author}
          </Text>
        </Box>

        {/* カテゴリバッジ */}
        {volumeInfo.categories && volumeInfo.categories.length > 0 && (
          <Flex gap="1" flexWrap="wrap">
            {volumeInfo.categories.slice(0, 2).map((cat) => (
              <Badge key={cat} colorPalette="orange" size="sm">
                {cat}
              </Badge>
            ))}
          </Flex>
        )}

        {/* ボタン */}
        {isAdded ? (
          <Button disabled colorPalette="gray" variant="subtle" size="xs" width="full">
            追加済み
          </Button>
        ) : (
          <Grid templateColumns="1fr 1fr" gap="1.5">
            <Button
              onClick={() => handleAdd("want")}
              disabled={isPending}
              loading={isPending}
              colorPalette="orange"
              variant="outline"
              size="xs"
            >
              読みたい
            </Button>
            <Button
              onClick={() => handleAdd("reading")}
              disabled={isPending}
              loading={isPending}
              colorPalette="orange"
              variant="solid"
              size="xs"
            >
              読書中
            </Button>
          </Grid>
        )}
      </Flex>
    </Flex>
  );
}
