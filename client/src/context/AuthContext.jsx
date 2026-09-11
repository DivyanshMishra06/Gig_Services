import { createContext, useContext, useState, useEffect } from 'react';
import { googleLogin, loginUser, registerUser, getMe } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('activesetu_user') || localStorage.getItem('coopgig_user') || 'null');
    if (stored?.token) {
      setUser(stored);
      localStorage.setItem('activesetu_user', JSON.stringify(stored));
      localStorage.removeItem('coopgig_user');
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await loginUser({ email, password });
    localStorage.setItem('activesetu_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const loginWithGoogle = async (credential) => {
    const { data } = await googleLogin({ credential });
    localStorage.setItem('activesetu_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const register = async (formData) => {
    const { data } = await registerUser(formData);
    localStorage.setItem('activesetu_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('activesetu_user');
    setUser(null);
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    localStorage.setItem('activesetu_user', JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
