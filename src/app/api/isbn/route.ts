import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('isbn') ?? '';
  const isbn = raw.replace(/[-\s]/g, '');

  if (!/^\d{10}$|^\d{13}$/.test(isbn)) {
    return NextResponse.json(
      { error: 'ISBN は10桁または13桁の数字で入力してください' },
      { status: 400 },
    );
  }

  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  const keyParam = apiKey ? `&key=${apiKey}` : '';
  const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}${keyParam}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err?.error?.message || `API error ${res.status}` },
        { status: res.status },
      );
    }
    const data = await res.json();
    const item = data.items?.[0] ?? null;
    return NextResponse.json({ item });
  } catch (e) {
    console.error('[isbn] fetch failed:', e);
    return NextResponse.json({ error: 'Network error' }, { status: 500 });
  }
}
