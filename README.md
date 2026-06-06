# My Bookshelf

あなただけの読書記録アプリ。Googleアカウントでログインして、読んだ本・読みたい本を管理できます。

## 機能

- **Googleログイン** — Firebase Authentication によるシンプルな認証
- **本棚管理** — 本を「読みたい / 読書中 / 読了 / 中断」の4ステータスで管理
- **書籍検索** — キーワードまたはISBN（10桁・13桁）でGoogle Books APIから検索・追加
- **星評価 / 読了日** — 読み終えた本に5段階評価と読了日を記録
- **読書グラフ** — 月ごとの読了冊数をグラフで可視化

## 技術スタック

| 項目 | 使用技術 |
|------|----------|
| フレームワーク | Next.js 16 (App Router) |
| 言語 | TypeScript |
| UI | Chakra UI v3, Recharts |
| 認証 | Firebase Authentication (Google) |
| DB | Cloud Firestore |
| 書籍データ | Google Books API |
| デプロイ | Google Cloud Run |

## 環境変数

`.env.local` に以下を設定してください。

```
# Firebase Admin SDK（サーバーサイド）
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Google Books API（任意・未設定でも動作）
GOOGLE_BOOKS_API_KEY=
```

## 開発環境の起動

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) で確認できます。

## ビルド & デプロイ

```bash
npm run build   # standalone ビルド
```

Cloud Run へのデプロイは Dockerfile を使用しています。
