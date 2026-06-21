# My Bookshelf

あなただけの読書記録アプリ。Googleアカウントでログインして、読んだ本・読みたい本を管理できます。

## 機能

- **Googleログイン** — Firebase Authentication によるシンプルな認証
- **本棚管理** — 本を「読みたい / 読書中 / 読了 / 中断」の4ステータスで管理
- **書籍検索** — キーワードまたはISBN（10桁・13桁）でGoogle Books APIから検索・追加
- **星評価 / 読了日** — 読み終えた本に5段階評価と読了日を記録
- **読書グラフ** — 月ごとの読了冊数をグラフで可視化

## Firebase の用途

このアプリでは Firebase をホスティングには使用していません。以下の2サービスのみ利用しています。

| サービス | 用途 |
|----------|------|
| **Firebase Authentication** | Google アカウントによるログイン・セッション管理 |
| **Cloud Firestore** | 本棚データの保存・取得 |

### Firestore のデータ構造

```
users/
  {uid}/
    books/
      {bookId}   ← Book ドキュメント（title, author, status, rating, finishedAt …）
```

### 認証フロー

1. クライアント: `signInWithPopup` で Google 認証 → Firebase ID トークン取得
2. サーバー (`/api/auth/session`): ID トークンを Firebase Admin SDK で検証 → セッションクッキー (`__session`) を発行
3. ミドルウェア: リクエストごとにクッキーを検証してアクセス制御

### デプロイ先

アプリ本体は **Google Cloud Run** で動作しています。Firebase はバックエンドサービス（認証・DB）としてのみ利用しており、Firebase Hosting は使用していません。

---

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

### 1. ローカルで変更をコミット・プッシュ

```bash
git add .
git commit -m "コミットメッセージ"
git push origin main
```

### 2. Cloud Shell でリポジトリを最新化

[Google Cloud Shell](https://shell.cloud.google.com) を開き、以下を実行：

```bash
cd my-bookshelf
git pull origin main
```

### 3. Cloud Run へデプロイ

```bash
bash deploy.sh
```

`deploy.sh` の内容（`FIREBASE_ADMIN_PRIVATE_KEY` は Cloud Run コンソールで別途設定）：

```bash
gcloud run deploy my-bookshelf \
  --project my-bookshelf-2f81d \
  --source . \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars GOOGLE_BOOKS_API_KEY=...,FIREBASE_ADMIN_PROJECT_ID=...,FIREBASE_ADMIN_CLIENT_EMAIL=...
```

### 4. デプロイ後のURL確認

```bash
gcloud run services describe my-bookshelf \
  --project my-bookshelf-2f81d \
  --region asia-northeast1 \
  --format="value(status.url)"
```

### 注意: FIREBASE_ADMIN_PRIVATE_KEY の設定

秘密鍵は **Google Cloud Secret Manager** で管理しています。`deploy.sh` の `--set-secrets` フラグで自動的に参照されるため、デプロイのたびに手動設定する必要はありません。

初回セットアップ時のみ以下を実行してください（Cloud Shell）：

```bash
# 秘密鍵をSecret Managerに登録
echo -n "-----BEGIN PRIVATE KEY-----\n..." | gcloud secrets create firebase-admin-private-key \
  --project my-bookshelf-2f81d \
  --data-file=-

# Cloud RunのサービスアカウントにSecret閲覧権限を付与
gcloud secrets add-iam-policy-binding firebase-admin-private-key \
  --project my-bookshelf-2f81d \
  --member="serviceAccount:firebase-adminsdk-fbsvc@my-bookshelf-2f81d.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## トラブルシューティング: 「このサイトにアクセスできません」

デプロイ成功後にブラウザで「このサイトにアクセスできません」と表示される場合、以下の手順で原因を特定してください。

### 手順1: 正しいURLにアクセスしているか確認

Firebase Hosting と Cloud Run は別サービスです。正しい Cloud Run の URL を確認します：

```bash
gcloud run services describe my-bookshelf \
  --project my-bookshelf-2f81d \
  --region asia-northeast1 \
  --format="value(status.url)"
```

表示された URL（`https://my-bookshelf-....run.app` 形式）にアクセスしてください。

### 手順2: Cloud Run のログでエラーを確認

```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=my-bookshelf" \
  --project my-bookshelf-2f81d \
  --limit 50 \
  --format "value(textPayload)"
```

または [Cloud Run コンソール](https://console.cloud.google.com/run) → サービス選択 → 「ログ」タブで確認できます。

### 手順3: よくある原因と対処法

| 症状 | 原因 | 対処 |
|------|------|------|
| ログに `FIREBASE_ADMIN_PRIVATE_KEY` 関連エラー | 秘密鍵が未設定でアプリが起動クラッシュ | Cloud Run コンソール →「変数とシークレット」で `FIREBASE_ADMIN_PRIVATE_KEY` を設定して再デプロイ |
| ログに `Cannot find module` などのエラー | ビルド失敗 | Cloud Shell で `bash deploy.sh` を再実行し、エラー出力を確認 |
| ログにエラーなし・コンテナが起動していない | デプロイがまだ完了していない | 数分待ってから再アクセス |
| ログに `Port 8080` 関連エラー | ポート設定の問題 | `deploy.sh` に `--port 8080` が含まれているか確認 |

### FIREBASE_ADMIN_PRIVATE_KEY が消える場合

`--set-env-vars` で環境変数を指定すると、**デプロイのたびに全ての環境変数が上書き**されます。手動でCloud Runコンソールに設定しても次のデプロイで消えてしまいます。

対処法: `deploy.sh` の `--set-secrets` フラグでSecret Managerを参照する方式に切り替えてください（上記「注意」セクション参照）。
