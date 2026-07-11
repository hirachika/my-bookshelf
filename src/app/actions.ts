"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getAdminAuth } from "@/lib/firebase-admin";
import { addBook, deleteBook, getBooks, updateBook } from "@/lib/firestore";
import type { Book, BookStatus } from "@/types/book";

const CATEGORY_MAP: Record<string, string> = {
  Fiction: "フィクション",
  "Literary Fiction": "文芸小説",
  "Short Stories": "短編小説",
  Classics: "古典",
  Poetry: "詩",
  Drama: "戯曲",
  "Comics & Graphic Novels": "コミック・マンガ",
  Manga: "マンガ",
  "Juvenile Fiction": "児童書",
  "Young Adult Fiction": "ヤングアダルト",
  "Children's Books": "子供向け",
  "Mystery & Detective": "ミステリー",
  Mystery: "ミステリー",
  Thriller: "スリラー",
  Horror: "ホラー",
  Romance: "ロマンス",
  "Science Fiction": "SF",
  Fantasy: "ファンタジー",
  Adventure: "冒険",
  "Biography & Autobiography": "伝記・自叙伝",
  History: "歴史",
  "Social Science": "社会科学",
  "Political Science": "政治学",
  Philosophy: "哲学",
  Psychology: "心理学",
  Religion: "宗教",
  Science: "科学",
  Nature: "自然",
  Mathematics: "数学",
  "Technology & Engineering": "技術・工学",
  Computers: "コンピュータ",
  Medical: "医学",
  "Health & Fitness": "健康・フィットネス",
  "Business & Economics": "ビジネス・経済",
  "Self-Help": "自己啓発",
  Education: "教育",
  "Language Arts & Disciplines": "言語・語学",
  Law: "法律",
  Art: "アート",
  Music: "音楽",
  "Performing Arts": "舞台芸術",
  "Sports & Recreation": "スポーツ",
  Travel: "旅行",
  Cooking: "料理",
  Humor: "ユーモア",
  Reference: "参考書",
  "Literary Collections": "文学",
  "Literary Criticism": "文学批評",
  Nonfiction: "ノンフィクション",
  "True Crime": "ノンフィクション犯罪",
  "Games & Activities": "ゲーム・趣味",
  Design: "デザイン",
  Photography: "写真",
  Architecture: "建築",
  "Body, Mind & Spirit": "精神・スピリチュアル",
  "Family & Relationships": "家族・人間関係",
  "House & Home": "住まい・インテリア",
  Gardening: "園芸",
  "Antiques & Collectibles": "アンティーク・コレクション",
  "Crafts & Hobbies": "クラフト・趣味",
  "Japanese fiction": "日本文学",
  "Japanese poetry": "日本詩",
  Islam: "イスラム",
};

function toJapaneseCategories(categories: string[]): string[] {
  return categories.map((cat) => CATEGORY_MAP[cat] ?? cat);
}

async function getCurrentUserId(): Promise<string> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("__session")?.value;
  if (!sessionCookie) throw new Error("Unauthorized");
  const decoded = await getAdminAuth().verifySessionCookie(sessionCookie, true);
  return decoded.uid;
}

export async function addToShelf(
  data: Omit<Book, "status" | "addedAt" | "startedAt" | "finishedAt" | "rating">,
  status: BookStatus = "want",
): Promise<void> {
  const uid = await getCurrentUserId();
  const existing = await getBooks(uid);
  if (existing.some((b) => b.id === data.id)) return;

  const now = new Date().toISOString();
  await addBook(uid, {
    ...data,
    categories: toJapaneseCategories(data.categories),
    status,
    rating: null,
    addedAt: now,
    startedAt: status === "reading" ? now : null,
    finishedAt: null,
  });
  revalidatePath("/");
}

export async function changeStatus(id: string, status: BookStatus): Promise<void> {
  const uid = await getCurrentUserId();
  const books = await getBooks(uid);
  const book = books.find((b) => b.id === id);
  if (!book) return;

  const now = new Date().toISOString();
  const updates: Partial<Book> = { status };
  if (status === "reading" && !book.startedAt) updates.startedAt = now;
  if (status === "read") {
    if (!book.startedAt) updates.startedAt = now;
    if (!book.finishedAt) updates.finishedAt = now;
  }

  await updateBook(uid, id, updates);
  revalidatePath("/");
}

export async function updateFinishedAt(id: string, finishedAt: string | null): Promise<void> {
  const uid = await getCurrentUserId();
  await updateBook(uid, id, { finishedAt });
  revalidatePath("/");
}

export async function updateRating(id: string, rating: number | null): Promise<void> {
  const uid = await getCurrentUserId();
  await updateBook(uid, id, { rating });
  revalidatePath("/");
}

export async function updateComment(id: string, comment: string | null): Promise<void> {
  const uid = await getCurrentUserId();
  await updateBook(uid, id, { comment });
  revalidatePath("/");
}

export async function deleteFromShelf(id: string): Promise<void> {
  const uid = await getCurrentUserId();
  await deleteBook(uid, id);
  revalidatePath("/");
}
