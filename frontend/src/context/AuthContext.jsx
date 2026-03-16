import { createContext, useState, useEffect } from "react";
import API from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    const res = await API.post("/auth/login", { email, password });
    // Token is now set in HttpOnly cookie by server
    const userData = res.data.data.user;
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    setUser(null);
    try {
      await API.get("/auth/logout");
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  const loadUser = async () => {
    try {
      const res = await API.get("/auth/profile");
      setUser(res.data.data.user);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loadUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
