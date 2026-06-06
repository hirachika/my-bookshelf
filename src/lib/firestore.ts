import { getAdminDb } from './firebase-admin';
import type { Book } from '@/types/book';

function booksRef(uid: string) {
  return getAdminDb().collection('users').doc(uid).collection('books');
}

export async function getBooks(uid: string): Promise<Book[]> {
  const snapshot = await booksRef(uid).get();
  return snapshot.docs.map((doc) => doc.data() as Book);
}

export async function addBook(uid: string, book: Book): Promise<void> {
  await booksRef(uid).doc(book.id).set(book);
}

export async function updateBook(uid: string, id: string, updates: Partial<Book>): Promise<void> {
  await booksRef(uid).doc(id).update(updates);
}

export async function deleteBook(uid: string, id: string): Promise<void> {
  await booksRef(uid).doc(id).delete();
}
