import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';

interface UserData {
  개인정보id: number;
  대표정보id: number;
  이름: string;
  이메일: string;
  부서명: string;
  직급명: string;
}

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('bara_user');
    if (saved) setUser(JSON.parse(saved));
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('로그인 시도:', email, password);
    const { data, error } = await supabase
      .from('개인정보')
      .select('*, 부서(*), 직급(*)')
      .eq('이메일', email)
      .eq('비밀번호', password)
      .single();

    console.log('결과:', data, error);
    if (error || !data) return false;

    const userData: UserData = {
      개인정보id: data['개인정보id'] as number,
      대표정보id: data['대표정보id'] as number,
      이름: (data['이름'] as string) || '',
      이메일: (data['이메일'] as string) || '',
      부서명: (data['부서'] as any)?.['부서명'] || '',
      직급명: (data['직급'] as any)?.['직급명'] || '',
    };

    setUser(userData);
    localStorage.setItem('bara_user', JSON.stringify(userData));
    return true;
  };

  const logout = () => {
    setUser(null);
localStorage.removeItem('bara_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
return ctx;
};