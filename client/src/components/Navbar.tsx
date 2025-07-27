import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, Home, Users, MessageCircle, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* ロゴとブランド名 */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="bg-family-500 rounded-full p-2">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">家族SNS</span>
            </Link>
          </div>

          {/* ナビゲーションリンク */}
          <div className="flex items-center space-x-1">
            <Link
              to="/dashboard"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/dashboard')
                  ? 'bg-family-100 text-family-700'
                  : 'text-gray-600 hover:text-family-600 hover:bg-gray-50'
              }`}
            >
              <Home className="h-4 w-4 mr-2" />
              ホーム
            </Link>
            
            <Link
              to="/family-members"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/family-members')
                  ? 'bg-family-100 text-family-700'
                  : 'text-gray-600 hover:text-family-600 hover:bg-gray-50'
              }`}
            >
              <Users className="h-4 w-4 mr-2" />
              家族メンバー
            </Link>
            
            <Link
              to="/messages"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/messages')
                  ? 'bg-family-100 text-family-700'
                  : 'text-gray-600 hover:text-family-600 hover:bg-gray-50'
              }`}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              メッセージ
            </Link>
            
            <Link
              to="/profile"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/profile')
                  ? 'bg-family-100 text-family-700'
                  : 'text-gray-600 hover:text-family-600 hover:bg-gray-50'
              }`}
            >
              <User className="h-4 w-4 mr-2" />
              プロフィール
            </Link>
          </div>

          {/* ユーザーメニュー */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <div className="h-8 w-8 bg-family-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
              <span className="text-sm font-medium text-gray-700">
                {user?.name}
              </span>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              ログアウト
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 