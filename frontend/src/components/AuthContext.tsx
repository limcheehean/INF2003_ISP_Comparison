// AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AuthContextProps {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const storedLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    setLoggedIn(storedLoggedIn);
  }, []);

  const login = () => {
    setLoggedIn(true);
    sessionStorage.setItem('isLoggedIn', 'true');
  }

  const logout = () => {
    setLoggedIn(false);
    sessionStorage.removeItem('isLoggedIn');
  }

  if (isLoggedIn === null) {
    return null;
  }


  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
