import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';
import { db } from '../database/init';

const router = express.Router();

// メッセージ一覧取得
router.get('/', (req: Request, res: Response) => {
  const { userId, otherUserId } = req.query;

  if (!userId || !otherUserId) {
    return res.status(400).json({ error: 'ユーザーIDが必要です' });
  }

  db.all(
    `SELECT m.*, 
     u1.name as sender_name, u1.avatar as sender_avatar,
     u2.name as recipient_name, u2.avatar as recipient_avatar
     FROM messages m 
     LEFT JOIN users u1 ON m.sender_id = u1.id 
     LEFT JOIN users u2 ON m.recipient_id = u2.id 
     WHERE (m.sender_id = ? AND m.recipient_id = ?) 
        OR (m.sender_id = ? AND m.recipient_id = ?)
     ORDER BY m.created_at ASC`,
    [userId, otherUserId, otherUserId, userId],
    (err: any, messages: any) => {
      if (err) {
        return res.status(500).json({ error: 'データベースエラー' });
      }
      res.json({ messages });
    }
  );
});

// メッセージ送信
router.post('/', [
  body('content').notEmpty().withMessage('メッセージ内容を入力してください'),
  body('senderId').notEmpty().withMessage('送信者IDが必要です'),
  body('recipientId').notEmpty().withMessage('受信者IDが必要です')
], (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, senderId, recipientId } = req.body;
    const messageId = uuidv4();

    db.run(
      'INSERT INTO messages (id, sender_id, recipient_id, content) VALUES (?, ?, ?, ?)',
      [messageId, senderId, recipientId, content],
      function(err: any) {
        if (err) {
          return res.status(500).json({ error: 'メッセージの送信に失敗しました' });
        }

        // 送信されたメッセージを取得
        db.get(
          `SELECT m.*, 
           u1.name as sender_name, u1.avatar as sender_avatar,
           u2.name as recipient_name, u2.avatar as recipient_avatar
           FROM messages m 
           LEFT JOIN users u1 ON m.sender_id = u1.id 
           LEFT JOIN users u2 ON m.recipient_id = u2.id 
           WHERE m.id = ?`,
          [messageId],
          (err: any, message: any) => {
            if (err) {
              return res.status(500).json({ error: 'データベースエラー' });
            }
            res.status(201).json({ 
              message: 'メッセージが送信されました',
              data: message 
            });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// 未読メッセージ一覧取得
router.get('/unread/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;

  db.all(
    `SELECT m.*, 
     u.name as sender_name, u.avatar as sender_avatar
     FROM messages m 
     LEFT JOIN users u ON m.sender_id = u.id 
     WHERE m.recipient_id = ? AND m.is_read = 0
     ORDER BY m.created_at DESC`,
    [userId],
    (err: any, messages: any) => {
      if (err) {
        return res.status(500).json({ error: 'データベースエラー' });
      }
      res.json({ messages });
    }
  );
});

// メッセージを既読にする
router.put('/:messageId/read', (req: Request, res: Response) => {
  const { messageId } = req.params;

  db.run(
    'UPDATE messages SET is_read = 1 WHERE id = ?',
    [messageId],
    function(err: any) {
      if (err) {
        return res.status(500).json({ error: 'メッセージの更新に失敗しました' });
      }
      res.json({ message: 'メッセージを既読にしました' });
    }
  );
});

export default router; 