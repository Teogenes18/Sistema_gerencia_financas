import { createContext, useContext, useState, useEffect } from 'react';
import { userService } from '../services/UserService';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userExists, setUserExists] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserExists();
  }, []);

  const checkUserExists = async () => {
    try {
      const result = await userService.checkUserExists();
      setUserExists(Boolean(result?.userExists));
      if (result?.userExists === false) {
        setUser(null);
      }
    } catch (error) {
      console.error('Erro ao verificar usuário existente:', error);
      setUserExists(true);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const result = await userService.loginUser(credentials);
      if (result.success) {
        setUser({
          id: result.userId,
          nome: result.nome
        });
      }
      return result;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const result = await userService.registerUser(userData);
      return result;
    } catch (error) {
      console.error('Erro ao registrar:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
  };

  const value = {
    user,
    userExists,
    loading,
    login,
    register,
    logout,
    checkUserExists
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '2rem' }}>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}