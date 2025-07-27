# 家族専用SNS

家族メンバー専用のプライベートなSNSアプリケーションです。

## 機能

- 👨‍👩‍👧‍👦 家族メンバーの登録・管理
- 📝 投稿・コメント・いいね機能
- 📸 写真・動画共有
- 📅 家族カレンダー
- 💬 プライベートメッセージ
- 🔔 通知機能
- 📱 モバイル対応

## 技術スタック

- **フロントエンド**: React + TypeScript + Tailwind CSS
- **バックエンド**: Node.js + Express + TypeScript
- **データベース**: SQLite (開発) / PostgreSQL (本番)
- **認証**: JWT
- **リアルタイム通信**: Socket.io

## セットアップ

### 前提条件
- Node.js (v18以上)
- npm

### インストール

```bash
# 依存関係をインストール
npm run install:all

# 開発サーバーを起動
npm run dev
```

### 環境変数

`.env`ファイルを作成して以下の環境変数を設定してください：

```env
# サーバー設定
PORT=5000
NODE_ENV=development

# データベース
DATABASE_URL=sqlite:./family_sns.db

# JWT設定
JWT_SECRET=your-secret-key

# ファイルアップロード
UPLOAD_PATH=./uploads
```

## 開発

- フロントエンド: http://localhost:3000
- バックエンド: http://localhost:5000

## ライセンス

MIT 