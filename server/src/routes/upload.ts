import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// アップロードディレクトリの作成
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer設定
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB制限
  },
  fileFilter: (req, file, cb) => {
    // 画像ファイルのみ許可
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('画像ファイルのみアップロード可能です'));
    }
  }
});

// 画像アップロード
router.post('/image', upload.single('image'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '画像ファイルが必要です' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      message: '画像がアップロードされました',
      imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    res.status(500).json({ error: 'アップロードに失敗しました' });
  }
});

// エラーハンドリング
router.use((error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'ファイルサイズが大きすぎます（最大10MB）' });
    }
  }
  res.status(500).json({ error: error.message || 'アップロードエラーが発生しました' });
});

export default router; 