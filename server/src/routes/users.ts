import express, { Request, Response } from 'express';
import { db } from '../database/init';

const router = express.Router();

// 家族メンバー一覧取得
router.get('/family-members', (req: Request, res: Response) => {
  const { familyId } = req.query;

  if (!familyId) {
    return res.status(400).json({ error: '家族IDが必要です' });
  }

  db.all(
    'SELECT id, name, email, role, avatar, created_at FROM users WHERE family_id = ? AND is_active = 1 ORDER BY created_at ASC',
    [familyId],
    (err: any, users: any) => {
      if (err) {
        return res.status(500).json({ error: 'データベースエラー' });
      }
      res.json({ users });
    }
  );
});

// ユーザープロフィール取得
router.get('/profile/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;

  db.get(
    'SELECT u.id, u.name, u.email, u.role, u.avatar, u.created_at, f.name as family_name FROM users u LEFT JOIN families f ON u.family_id = f.id WHERE u.id = ?',
    [userId],
    (err: any, user: any) => {
      if (err) {
        return res.status(500).json({ error: 'データベースエラー' });
      }
      if (!user) {
        return res.status(404).json({ error: 'ユーザーが見つかりません' });
      }
      res.json({ user });
    }
  );
});

// プロフィール更新
router.put('/profile', (req: Request, res: Response) => {
  const { userId, name, avatar } = req.body;

  if (!userId || !name) {
    return res.status(400).json({ error: 'ユーザーIDと名前が必要です' });
  }

  db.run(
    'UPDATE users SET name = ?, avatar = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [name, avatar, userId],
    function(err: any) {
      if (err) {
        return res.status(500).json({ error: 'データベースエラー' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'ユーザーが見つかりません' });
      }
      res.json({ message: 'プロフィールが更新されました' });
    }
  );
});

export default router; 