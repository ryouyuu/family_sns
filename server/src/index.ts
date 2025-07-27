import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';

// ルートのインポート
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import postRoutes from './routes/posts';
import messageRoutes from './routes/messages';
import uploadRoutes from './routes/upload';

// データベース初期化
import { initDatabase } from './database/init';

// 環境変数の読み込み
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// ミドルウェア
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 静的ファイルの提供
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ルート
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/upload', uploadRoutes);

// ヘルスチェック
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.io接続処理
io.on('connection', (socket) => {
  console.log('ユーザーが接続しました:', socket.id);

  // 家族ルームに参加
  socket.on('join-family', (familyId: string) => {
    socket.join(`family-${familyId}`);
    console.log(`ユーザー ${socket.id} が家族 ${familyId} に参加しました`);
  });

  // 家族ルームから退出
  socket.on('leave-family', (familyId: string) => {
    socket.leave(`family-${familyId}`);
    console.log(`ユーザー ${socket.id} が家族 ${familyId} から退出しました`);
  });

  // 新規投稿の通知
  socket.on('new-post', (data) => {
    socket.to(`family-${data.familyId}`).emit('post-created', data);
  });

  // 新規コメントの通知
  socket.on('new-comment', (data) => {
    socket.to(`family-${data.familyId}`).emit('comment-created', data);
  });

  // 新規メッセージの通知
  socket.on('new-message', (data) => {
    socket.to(`user-${data.recipientId}`).emit('message-received', data);
  });

  socket.on('disconnect', () => {
    console.log('ユーザーが切断しました:', socket.id);
  });
});

// エラーハンドリング
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'サーバー内部エラーが発生しました',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404ハンドリング
app.use('*', (req, res) => {
  res.status(404).json({ error: 'エンドポイントが見つかりません' });
});

// サーバー起動
async function startServer() {
  try {
    // データベース初期化
    await initDatabase();
    
    server.listen(PORT, () => {
      console.log(`🚀 サーバーが起動しました: http://localhost:${PORT}`);
      console.log(`📱 Socket.io サーバーが起動しました`);
    });
  } catch (error) {
    console.error('サーバー起動エラー:', error);
    process.exit(1);
  }
}

startServer(); 