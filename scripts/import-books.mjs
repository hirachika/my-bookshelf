import { readFileSync } from 'fs';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Load env from .env.local manually
const envPath = join(__dirname, '../.env.local');
const envContent = readFileSync(envPath, 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const idx = line.indexOf('=');
  if (idx > 0 && !line.startsWith('#')) {
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
}

const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

const app = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: cert({
        projectId: env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });

const auth = getAuth(app);
const db = getFirestore(app);

const EMAIL = 'zhijiazip@gmail.com';
const books = JSON.parse(readFileSync(join(__dirname, '../data/books.json'), 'utf8'));

async function main() {
  const user = await auth.getUserByEmail(EMAIL);
  const uid = user.uid;
  console.log(`UID: ${uid}`);

  const booksRef = db.collection('users').doc(uid).collection('books');

  // Check existing books
  const existing = await booksRef.get();
  const existingIds = new Set(existing.docs.map((d) => d.id));
  console.log(`既存: ${existingIds.size}件, インポート対象: ${books.length}件`);

  let added = 0;
  let skipped = 0;
  for (const book of books) {
    if (existingIds.has(book.id)) {
      console.log(`  スキップ (既存): ${book.title}`);
      skipped++;
    } else {
      await booksRef.doc(book.id).set(book);
      console.log(`  追加: ${book.title}`);
      added++;
    }
  }

  console.log(`\n完了: 追加 ${added}件, スキップ ${skipped}件`);
}

main().catch((e) => {
  console.error('エラー:', e.message);
  process.exit(1);
});
