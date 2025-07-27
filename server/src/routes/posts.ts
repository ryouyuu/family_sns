import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';
import { db } from '../database/init';

const router = express.Router();

// 投稿一覧取得
router.get('/', (req: Request, res: Response) => {
  const { familyId, page = 1, limit = 10 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  if (!familyId) {
    return res.status(400).json({ error: '家族IDが必要です' });
  }

  db.all(
    `SELECT p.*, u.name as user_name, u.avatar as user_avatar,
     (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
     (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count
     FROM posts p 
     LEFT JOIN users u ON p.user_id = u.id 
     WHERE p.family_id = ? 
     ORDER BY p.created_at DESC 
     LIMIT ? OFFSET ?`,
    [familyId, limit, offset],
    (err: any, posts: any) => {
      if (err) {
        return res.status(500).json({ error: 'データベースエラー' });
      }
      res.json({ posts });
    }
  );
});

// 投稿作成
router.post('/', [
  body('content').notEmpty().withMessage('投稿内容を入力してください'),
  body('familyId').notEmpty().withMessage('家族IDが必要です'),
  body('userId').notEmpty().withMessage('ユーザーIDが必要です')
], (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, familyId, userId, imageUrl } = req.body;
    const postId = uuidv4();

    db.run(
      'INSERT INTO posts (id, user_id, family_id, content, image_url) VALUES (?, ?, ?, ?, ?)',
      [postId, userId, familyId, content, imageUrl],
      function(err: any) {
        if (err) {
          return res.status(500).json({ error: '投稿の作成に失敗しました' });
        }

        // 作成された投稿を取得
        db.get(
          'SELECT p.*, u.name as user_name, u.avatar as user_avatar FROM posts p LEFT JOIN users u ON p.user_id = u.id WHERE p.id = ?',
          [postId],
          (err: any, post: any) => {
            if (err) {
              return res.status(500).json({ error: 'データベースエラー' });
            }
            res.status(201).json({ 
              message: '投稿が作成されました',
              post 
            });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// 投稿削除
router.delete('/:postId', (req: Request, res: Response) => {
  const { postId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'ユーザーIDが必要です' });
  }

  // 投稿の所有者かチェック
  db.get('SELECT user_id FROM posts WHERE id = ?', [postId], (err: any, post: any) => {
    if (err) {
      return res.status(500).json({ error: 'データベースエラー' });
    }
    if (!post) {
      return res.status(404).json({ error: '投稿が見つかりません' });
    }
    if (post.user_id !== userId) {
      return res.status(403).json({ error: '投稿を削除する権限がありません' });
    }

    // 投稿を削除
    db.run('DELETE FROM posts WHERE id = ?', [postId], function(err: any) {
      if (err) {
        return res.status(500).json({ error: '投稿の削除に失敗しました' });
      }
      res.json({ message: '投稿が削除されました' });
    });
  });
});

// いいね追加/削除
router.post('/:postId/like', (req: Request, res: Response) => {
  const { postId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'ユーザーIDが必要です' });
  }

  // 既存のいいねをチェック
  db.get('SELECT id FROM likes WHERE user_id = ? AND post_id = ?', [userId, postId], (err: any, like: any) => {
    if (err) {
      return res.status(500).json({ error: 'データベースエラー' });
    }

    if (like) {
      // いいねを削除
      db.run('DELETE FROM likes WHERE user_id = ? AND post_id = ?', [userId, postId], function(err: any) {
        if (err) {
          return res.status(500).json({ error: 'いいねの削除に失敗しました' });
        }
        res.json({ message: 'いいねを削除しました', liked: false });
      });
    } else {
      // いいねを追加
      const likeId = uuidv4();
      db.run('INSERT INTO likes (id, user_id, post_id) VALUES (?, ?, ?)', [likeId, userId, postId], function(err: any) {
        if (err) {
          return res.status(500).json({ error: 'いいねの追加に失敗しました' });
        }
        res.json({ message: 'いいねしました', liked: true });
      });
    }
  });
});

// コメント一覧取得
router.get('/:postId/comments', (req: Request, res: Response) => {
  const { postId } = req.params;

  db.all(
    'SELECT c.*, u.name as user_name, u.avatar as user_avatar FROM comments c LEFT JOIN users u ON c.user_id = u.id WHERE c.post_id = ? ORDER BY c.created_at ASC',
    [postId],
    (err: any, comments: any) => {
      if (err) {
        return res.status(500).json({ error: 'データベースエラー' });
      }
      res.json({ comments });
    }
  );
});

// コメント追加
router.post('/:postId/comments', [
  body('content').notEmpty().withMessage('コメント内容を入力してください'),
  body('userId').notEmpty().withMessage('ユーザーIDが必要です')
], (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { postId } = req.params;
    const { content, userId } = req.body;
    const commentId = uuidv4();

    db.run(
      'INSERT INTO comments (id, user_id, post_id, content) VALUES (?, ?, ?, ?)',
      [commentId, userId, postId, content],
      function(err: any) {
        if (err) {
          return res.status(500).json({ error: 'コメントの作成に失敗しました' });
        }

        // 作成されたコメントを取得
        db.get(
          'SELECT c.*, u.name as user_name, u.avatar as user_avatar FROM comments c LEFT JOIN users u ON c.user_id = u.id WHERE c.id = ?',
          [commentId],
          (err: any, comment: any) => {
            if (err) {
              return res.status(500).json({ error: 'データベースエラー' });
            }
            res.status(201).json({ 
              message: 'コメントが作成されました',
              comment 
            });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

export default router; 