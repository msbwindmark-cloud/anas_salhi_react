import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          const decoded = jwtDecode(token);
          // 1. Validamos expiración
          if (decoded.exp * 1000 < Date.now()) {
            logout();
          } else {
            // 2. PEDIMOS DATOS FRESCOS AL BACKEND
            // Esto es lo que garantiza que veas "Anas" y no "Mohammed"
            const response = await api.get("auth/me/");
            setUser(response.data);
          }
        } catch (e) {
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const response = await api.post("auth/login/", { email, password });
    localStorage.setItem("access_token", response.data.access);
    localStorage.setItem("refresh_token", response.data.refresh);
    
    // Al loguearnos, traemos los datos del usuario inmediatamente
    const userRes = await api.get("auth/me/");
    setUser(userRes.data);
    
    navigate("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};