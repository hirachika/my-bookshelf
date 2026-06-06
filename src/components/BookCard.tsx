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
    <Flex direction="row" align="flex-start" p="8px" gap="8px" minH="88px" bg="white" rounded="lg" overflow="hidden">
      {/* サムネイル */}
      <Image
        src={thumbnail || "/no-image.jpg"}
        alt={volumeInfo.title}
        w="64px"
        flexShrink={0}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = "/no-image.jpg";
        }}
      />

      {/* コンテンツ */}
      <Flex direction="column" flex="1" minW="0" h="full" justify="space-between">
        <Box>
          <Text fontSize="xs" fontWeight="semibold" color="gray.900" lineHeight="tight" lineClamp={2} mb="0.5">
            {volumeInfo.title || "タイトル不明"}
          </Text>
          <Text fontSize="xs" color="gray.400" truncate>
            {author}
          </Text>
          {volumeInfo.categories && volumeInfo.categories.length > 0 && (
            <Badge colorPalette="orange" variant="subtle" size="sm" truncate mt="0.5">
              {volumeInfo.categories[0]}
            </Badge>
          )}
        </Box>
        {isAdded ? (
          <Button disabled colorPalette="gray" variant="subtle" size="xs" width="full">
            追加済み
          </Button>
        ) : (
          <Grid templateColumns="1fr 1fr" gap="1">
            <Button
              onClick={() => handleAdd("want")}
              disabled={isPending}
              loading={isPending}
              colorPalette="orange"
              variant="outline"
              size="xs"
              h="24px"
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
              h="24px"
            >
              読書中
            </Button>
          </Grid>
        )}
      </Flex>
    </Flex>
  );
}
