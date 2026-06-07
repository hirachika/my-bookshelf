import { NextRequest, NextResponse } from 'next/server';

const PER_PAGE = 12;

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q');
  const startIndex = Number(req.nextUrl.searchParams.get('startIndex') ?? 0);

  if (!q?.trim()) {
    return NextResponse.json({ items: [], totalItems: 0 });
  }

  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  const keyParam = apiKey ? `&key=${apiKey}` : '';
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=${PER_PAGE}&startIndex=${startIndex}${keyParam}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const message = err?.error?.message || `API error ${res.status}`;
      console.error('[search] Google Books API error:', res.status, message);
      return NextResponse.json({ error: message }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json({
      items: data.items || [],
      totalItems: data.totalItems ?? 0,
    });
  } catch (e) {
    console.error('[search] fetch failed:', e);
    return NextResponse.json({ error: 'Network error' }, { status: 500 });
  }
}
