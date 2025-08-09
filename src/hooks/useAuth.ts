import { useState, useEffect } from "react";

interface AuthUser {
  username: string;
  loginTime: string;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const authData = localStorage.getItem("dashboard_auth");
      if (authData) {
        const parsedAuth = JSON.parse(authData);
        
        // Verifica se o login ainda é válido (24 horas)
        const loginTime = new Date(parsedAuth.loginTime);
        const now = new Date();
        const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff < 24 && parsedAuth.isAuthenticated) {
          setUser(parsedAuth);
        } else {
          // Login expirado
          logout();
        }
      }
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = (username: string) => {
    const authData = {
      username,
      loginTime: new Date().toISOString(),
      isAuthenticated: true
    };
    
    localStorage.setItem("dashboard_auth", JSON.stringify(authData));
    setUser(authData);
  };

  const logout = () => {
    localStorage.removeItem("dashboard_auth");
    setUser(null);
  };

  const isAuthenticated = !!user?.isAuthenticated;

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuthStatus
  };
};