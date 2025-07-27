import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  familyId: string;
  familyName?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  console.log('AuthProvider: Component initialized'); // 初期化ログ
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('AuthContext: Token found:', !!token); // デバッグログ
    
    if (token) {
      fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        console.log('AuthContext: Verify response:', data); // デバッグログ
        if (data.user) {
          setUser(data.user);
        } else {
          localStorage.removeItem('token');
        }
      })
      .catch((error) => {
        console.log('AuthContext: Verify error:', error); // デバッグログ
        localStorage.removeItem('token');
      })
      .finally(() => {
        setIsLoading(false);
      });
    } else {
      console.log('AuthContext: No token found'); // デバッグログ
      setIsLoading(false);
    }
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    setUser(userData);
    console.log('AuthContext: User logged in:', userData); // デバッグログ
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    console.log('AuthContext: User logged out'); // デバッグログ
  };

  const isAuthenticated = !!user;
  console.log('AuthContext: isAuthenticated:', isAuthenticated, 'user:', user); // デバッグログ

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-family-500"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}; 