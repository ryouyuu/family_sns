import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../../family_sns.db');
const db = new sqlite3.Database(dbPath);

export async function initDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // 家族テーブル
      db.run(`
        CREATE TABLE IF NOT EXISTS families (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // ユーザーテーブル
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          family_id TEXT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT NOT NULL,
          avatar TEXT,
          role TEXT DEFAULT 'member',
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (family_id) REFERENCES families (id)
        )
      `);

      // 投稿テーブル
      db.run(`
        CREATE TABLE IF NOT EXISTS posts (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          family_id TEXT NOT NULL,
          content TEXT,
          image_url TEXT,
          likes_count INTEGER DEFAULT 0,
          comments_count INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id),
          FOREIGN KEY (family_id) REFERENCES families (id)
        )
      `);

      // いいねテーブル
      db.run(`
        CREATE TABLE IF NOT EXISTS likes (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          post_id TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id),
          FOREIGN KEY (post_id) REFERENCES posts (id),
          UNIQUE(user_id, post_id)
        )
      `);

      // コメントテーブル
      db.run(`
        CREATE TABLE IF NOT EXISTS comments (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          post_id TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id),
          FOREIGN KEY (post_id) REFERENCES posts (id)
        )
      `);

      // メッセージテーブル
      db.run(`
        CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          sender_id TEXT NOT NULL,
          recipient_id TEXT NOT NULL,
          content TEXT NOT NULL,
          is_read BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (sender_id) REFERENCES users (id),
          FOREIGN KEY (recipient_id) REFERENCES users (id)
        )
      `);

      // 通知テーブル
      db.run(`
        CREATE TABLE IF NOT EXISTS notifications (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          type TEXT NOT NULL,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          data TEXT,
          is_read BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // インデックスの作成
      db.run('CREATE INDEX IF NOT EXISTS idx_users_family_id ON users(family_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_posts_family_id ON posts(family_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)');

      console.log('✅ データベースが初期化されました');
      resolve();
    });

    db.on('error', (err: any) => {
      console.error('データベースエラー:', err);
      reject(err);
    });
  });
}

export { db }; 