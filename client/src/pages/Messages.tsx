import React from 'react';
import { MessageCircle } from 'lucide-react';

const Messages: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-8 w-8 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">メッセージ</h1>
          <p className="text-gray-500">この機能は近日公開予定です</p>
        </div>
      </div>
    </div>
  );
};

export default Messages; 