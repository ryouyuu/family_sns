import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';
import { db } from '../database/init';

const router = express.Router();

// ユーザー登録
router.post('/register', [
  body('email').isEmail().withMessage('有効なメールアドレスを入力してください'),
  body('password').isLength({ min: 6 }).withMessage('パスワードは6文字以上で入力してください'),
  body('name').notEmpty().withMessage('名前を入力してください'),
  body('familyName').notEmpty().withMessage('家族名を入力してください')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, familyName } = req.body;

    // メールアドレスの重複チェック
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err: any, user: any) => {
      if (err) {
        return res.status(500).json({ error: 'データベースエラー' });
      }
      if (user) {
        return res.status(400).json({ error: 'このメールアドレスは既に使用されています' });
      }

      // 家族の作成または取得
      const familyId = uuidv4();
      db.run('INSERT INTO families (id, name) VALUES (?, ?)', [familyId, familyName], (err: any) => {
        if (err) {
          return res.status(500).json({ error: '家族の作成に失敗しました' });
        }

        // パスワードのハッシュ化
        bcrypt.hash(password, 12, (err: any, hashedPassword: string) => {
          if (err) {
            return res.status(500).json({ error: 'パスワードの暗号化に失敗しました' });
          }

          const userId = uuidv4();
          const role = 'admin'; // 最初のメンバーは管理者

          // ユーザーの作成
          db.run(
            'INSERT INTO users (id, family_id, email, password, name, role) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, familyId, email, hashedPassword, name, role],
            (err: any) => {
              if (err) {
                return res.status(500).json({ error: 'ユーザーの作成に失敗しました' });
              }

              // JWTトークンの生成
              const token = jwt.sign(
                { userId, familyId, email, role },
                process.env.JWT_SECRET || 'fallback-secret',
                { expiresIn: '7d' }
              );

              res.status(201).json({
                message: 'ユーザー登録が完了しました',
                token,
                user: {
                  id: userId,
                  email,
                  name,
                  role,
                  familyId
                }
              });
            }
          );
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// ログイン
router.post('/login', [
  body('email').isEmail().withMessage('有効なメールアドレスを入力してください'),
  body('password').notEmpty().withMessage('パスワードを入力してください')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    db.get(
      'SELECT u.*, f.name as family_name FROM users u LEFT JOIN families f ON u.family_id = f.id WHERE u.email = ?',
      [email],
      async (err: any, user: any) => {
        if (err) {
          return res.status(500).json({ error: 'データベースエラー' });
        }
        if (!user) {
          return res.status(401).json({ error: 'メールアドレスまたはパスワードが正しくありません' });
        }

        // パスワードの検証
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return res.status(401).json({ error: 'メールアドレスまたはパスワードが正しくありません' });
        }

        // JWTトークンの生成
        const token = jwt.sign(
          { 
            userId: user.id, 
            familyId: user.family_id, 
            email: user.email, 
            role: user.role 
          },
          process.env.JWT_SECRET || 'fallback-secret',
          { expiresIn: '7d' }
        );

        res.json({
          message: 'ログインに成功しました',
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            familyId: user.family_id,
            familyName: user.family_name,
            avatar: user.avatar
          }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// 家族に参加
router.post('/join-family', [
  body('email').isEmail().withMessage('有効なメールアドレスを入力してください'),
  body('password').isLength({ min: 6 }).withMessage('パスワードは6文字以上で入力してください'),
  body('name').notEmpty().withMessage('名前を入力してください'),
  body('familyCode').notEmpty().withMessage('家族コードを入力してください')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, familyCode } = req.body;

    // 家族コードで家族を検索
    db.get('SELECT id, name FROM families WHERE id = ?', [familyCode], async (err: any, family: any) => {
      if (err) {
        return res.status(500).json({ error: 'データベースエラー' });
      }
      if (!family) {
        return res.status(404).json({ error: '家族が見つかりません' });
      }

      // メールアドレスの重複チェック
      db.get('SELECT id FROM users WHERE email = ?', [email], async (err: any, user: any) => {
        if (err) {
          return res.status(500).json({ error: 'データベースエラー' });
        }
        if (user) {
          return res.status(400).json({ error: 'このメールアドレスは既に使用されています' });
        }

        // パスワードのハッシュ化
        bcrypt.hash(password, 12, (err: any, hashedPassword: string) => {
          if (err) {
            return res.status(500).json({ error: 'パスワードの暗号化に失敗しました' });
          }

          const userId = uuidv4();

          // ユーザーの作成
          db.run(
            'INSERT INTO users (id, family_id, email, password, name, role) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, family.id, email, hashedPassword, name, 'member'],
            (err: any) => {
              if (err) {
                return res.status(500).json({ error: 'ユーザーの作成に失敗しました' });
              }

              // JWTトークンの生成
              const token = jwt.sign(
                { userId, familyId: family.id, email, role: 'member' },
                process.env.JWT_SECRET || 'fallback-secret',
                { expiresIn: '7d' }
              );

              res.status(201).json({
                message: '家族に参加しました',
                token,
                user: {
                  id: userId,
                  email,
                  name,
                  role: 'member',
                  familyId: family.id,
                  familyName: family.name
                }
              });
            }
          );
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// トークン検証
router.get('/verify', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'トークンが提供されていません' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    db.get(
      'SELECT u.*, f.name as family_name FROM users u LEFT JOIN families f ON u.family_id = f.id WHERE u.id = ?',
      [decoded.userId],
      (err: any, user: any) => {
        if (err) {
          return res.status(500).json({ error: 'データベースエラー' });
        }
        if (!user) {
          return res.status(401).json({ error: 'ユーザーが見つかりません' });
        }

        res.json({
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            familyId: user.family_id,
            familyName: user.family_name,
            avatar: user.avatar
          }
        });
      }
    );
  } catch (error) {
    res.status(401).json({ error: '無効なトークンです' });
  }
});

export default router; 