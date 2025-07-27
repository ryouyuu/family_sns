import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { toast } from 'react-hot-toast';
import Layout from '../components/Layout';
import { 
  Heart,
  MessageSquare,
  Image
} from 'lucide-react';

interface Post {
  id: string;
  content: string;
  image_url?: string;
  user_name: string;
  user_avatar?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('post-created', (newPost: Post) => {
        setPosts(prev => [newPost, ...prev]);
        toast.success('新しい投稿があります！');
      });

      return () => {
        socket.off('post-created');
      };
    }
  }, [socket]);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`/api/posts?familyId=${user?.familyId}`);
      const data = await response.json();
      if (response.ok) {
        setPosts(data.posts || []);
      }
    } catch (error) {
      toast.error('投稿の取得に失敗しました');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() && !selectedImage) return;

    setIsLoading(true);
    try {
      let imageUrl = '';
      if (selectedImage) {
        const formData = new FormData();
        formData.append('image', selectedImage);
        const uploadResponse = await fetch('/api/upload/image', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.imageUrl;
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          content: newPost,
          familyId: user?.familyId,
          userId: user?.id,
          imageUrl,
        }),
      });

      if (response.ok) {
        setNewPost('');
        setSelectedImage(null);
        toast.success('投稿しました！');
        fetchPosts();
      } else {
        toast.error('投稿に失敗しました');
      }
    } catch (error) {
      toast.error('投稿に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };



  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* 投稿フォーム */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="家族に何か共有したいことはありますか？"
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-family-500 focus:border-transparent"
              rows={3}
            />
            
            {selectedImage && (
              <div className="relative">
                <img
                  src={URL.createObjectURL(selectedImage)}
                  alt="Preview"
                  className="w-full max-h-64 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Image className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </label>
              </div>
              <button
                type="submit"
                disabled={isLoading || (!newPost.trim() && !selectedImage)}
                className="btn-primary px-6 py-2"
              >
                {isLoading ? '投稿中...' : '投稿'}
              </button>
            </div>
          </form>
        </div>

        {/* 投稿一覧 */}
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start space-x-3 mb-4">
                <div className="h-10 w-10 bg-family-100 rounded-full flex items-center justify-center">
                  <span className="text-family-600 font-medium">
                    {post.user_name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{post.user_name}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(post.created_at).toLocaleString('ja-JP')}
                  </p>
                </div>
              </div>
              
              {post.content && (
                <p className="text-gray-900 mb-4">{post.content}</p>
              )}
              
              {post.image_url && (
                <img
                  src={post.image_url}
                  alt="Post"
                  className="w-full rounded-lg mb-4"
                />
              )}
              
              <div className="flex items-center space-x-6 text-gray-500">
                <button className="flex items-center space-x-2 hover:text-family-600">
                  <Heart className="h-5 w-5" />
                  <span>{post.likes_count}</span>
                </button>
                <button className="flex items-center space-x-2 hover:text-family-600">
                  <MessageSquare className="h-5 w-5" />
                  <span>{post.comments_count}</span>
                </button>
              </div>
            </div>
          ))}
          
          {posts.length === 0 && (
            <div className="text-center py-12">
              <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                まだ投稿がありません
              </h3>
              <p className="text-gray-500">
                最初の投稿をしてみましょう！
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard; 