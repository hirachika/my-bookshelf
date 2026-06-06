import fs from 'fs';
import path from 'path';
import type { Book } from '@/types/book';

const DB_PATH = path.join(process.cwd(), 'data', 'books.json');

function ensureDbExists(): void {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, '[]', 'utf-8');
}

export function getBooks(): Book[] {
  ensureDbExists();
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')) as Book[];
}

export function addBook(book: Book): void {
  const books = getBooks();
  books.push(book);
  fs.writeFileSync(DB_PATH, JSON.stringify(books, null, 2), 'utf-8');
}

export function updateBook(id: string, updates: Partial<Book>): void {
  const books = getBooks();
  const idx = books.findIndex((b) => b.id === id);
  if (idx !== -1) {
    books[idx] = { ...books[idx], ...updates };
    fs.writeFileSync(DB_PATH, JSON.stringify(books, null, 2), 'utf-8');
  }
}

export function deleteBook(id: string): void {
  const books = getBooks().filter((b) => b.id !== id);
  fs.writeFileSync(DB_PATH, JSON.stringify(books, null, 2), 'utf-8');
}
