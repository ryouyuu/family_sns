import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { User, Mail, Users, Shield } from 'lucide-react';

const Profile: React.FC = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="text-center mb-8">
            <div className="h-24 w-24 bg-family-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-12 w-12 text-family-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
            <p className="text-gray-500">{user?.familyName}</p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">メールアドレス</p>
                <p className="font-medium">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <Users className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">家族名</p>
                <p className="font-medium">{user?.familyName}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <Shield className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">権限</p>
                <p className="font-medium">
                  {user?.role === 'admin' ? '管理者' : 'メンバー'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile; 