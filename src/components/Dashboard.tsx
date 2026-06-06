"use client";

import dynamic from "next/dynamic";
import { Box, Heading, Separator, Stack, Tabs } from "@chakra-ui/react";
import type { Book } from "@/types/book";
import BookSearchSection from "./BookSearchSection";
import ISBNSearchSection from "./ISBNSearchSection";
import BookshelfList from "./BookshelfList";
import SignOutButton from "./SignOutButton";

const ReadingGraph = dynamic(() => import("./ReadingGraph"), { ssr: false });

export default function Dashboard({ books }: { books: Book[] }) {
  const existingIds = new Set(books.map((b) => b.id));

  return (
    <Box minH="100vh" bg="gray.50">
      <Tabs.Root defaultValue="shelf" variant="line" colorPalette="orange">
        {/* 固定ヘッダー */}
        <Box as="header" position="fixed" top="0" left="0" right="0" zIndex="10" bg="orange.500">
          <Box maxW="2xl" mx="auto" h="48px" display="flex" alignItems="center" justifyContent="space-between">
            <Heading as="h1" size="md" color="white">
              My Bookshelf
            </Heading>
            <SignOutButton />
          </Box>
        </Box>

        {/* 固定タブバー */}
        <Box
          position="fixed"
          top="48px"
          left="0"
          right="0"
          zIndex="9"
          bg="white"
          borderBottomWidth="1px"
          borderColor="gray.100"
        >
          <Box maxW="2xl" mx="auto">
            <Tabs.List bg="transparent" gap="0">
              <Tabs.Trigger
                value="shelf"
                width="calc(100%/3)"
                justifyContent="center"
                color="gray.400"
                _selected={{ color: "orange.500" }}
              >
                あなたの本棚
              </Tabs.Trigger>
              <Tabs.Trigger
                value="search"
                width="calc(100%/3)"
                justifyContent="center"
                color="gray.400"
                _selected={{ color: "orange.500" }}
              >
                書籍検索
              </Tabs.Trigger>
              <Tabs.Trigger
                value="graph"
                width="calc(100%/3)"
                justifyContent="center"
                color="gray.400"
                _selected={{ color: "orange.500" }}
              >
                読書グラフ
              </Tabs.Trigger>
            </Tabs.List>
          </Box>
        </Box>

        {/* メインコンテンツ（固定ヘッダー分の余白を追加） */}
        <Box
          as="main"
          maxW="2xl"
          mx="auto"
          pt="96px"
          minH="100vh"
          bg="white"
          style={{
            backgroundImage: "url('/bg-book.png')",
            backgroundSize: "cover",
            backgroundPosition: "top",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "fixed",
          }}
        >
          <Tabs.Content value="shelf">
            <BookshelfList books={books} />
          </Tabs.Content>

          <Tabs.Content value="search" p="4">
            <Stack gap="6">
              <Box as="section">
                <Heading as="h2" size="md" mb="3">
                  キーワードで検索
                </Heading>
                <BookSearchSection existingIds={existingIds} />
              </Box>
              <Separator />
              <Box as="section">
                <Heading as="h2" size="md" mb="3">
                  ISBNで検索
                </Heading>
                <ISBNSearchSection existingIds={existingIds} />
              </Box>
            </Stack>
          </Tabs.Content>

          <Tabs.Content value="graph" p="4">
            <ReadingGraph books={books} />
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </Box>
  );
}
