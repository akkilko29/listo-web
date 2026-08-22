import React, { createContext, useContext, useMemo, useState } from "react";

import {
  clearSession,
  getStoredToken,
  getStoredUser,
  persistSession,
} from "../services/authStorage";
import { loginRequest, registerRequest } from "../services/authService";
import { clearFavoriteCache } from "../services/favoriteService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(() => getStoredUser());

  const applySession = (token, nextUser) => {
    persistSession(token, nextUser);
    clearFavoriteCache();
    setAccessToken(token || "");
    setUser(nextUser || null);
  };

  const login = async (email, password) => {
    const data = await loginRequest(email, password);
    applySession(data.accessToken, data.user);
    return data;
  };

  const register = async (payload) => {
    const registeredUser = await registerRequest(payload);
    const data = await loginRequest(payload.email, payload.password);
    applySession(data.accessToken, data.user || registeredUser);
    return data;
  };

  const logout = () => {
    clearSession();
    clearFavoriteCache();
    setAccessToken("");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      accessToken,
      user,
      isAuthenticated: Boolean(accessToken && user),
      login,
      register,
      logout,
    }),
    [accessToken, user]
  );

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
