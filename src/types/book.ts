export type BookStatus = 'want' | 'reading' | 'read' | 'dropped';

export interface Book {
  id: string;
  title: string;
  author: string;
  publisher: string;
  description: string;
  status: BookStatus;
  thumbnail: string;
  categories: string[];
  startedAt: string | null;
  finishedAt: string | null;
  addedAt: string;
  rating: number | null;
}

export interface GoogleBookItem {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    publisher?: string;
    description?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    categories?: string[];
  };
}
