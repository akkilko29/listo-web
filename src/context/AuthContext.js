import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  clearSession,
  getStoredToken,
  getStoredUser,
  persistSession,
} from "../services/authStorage";
import {
  getCurrentUser,
  loginRequest,
  mapUser,
  registerRequest,
  updateCurrentUser,
} from "../services/authService";
import { clearFavoriteCache } from "../services/favoriteService";

const AuthContext = createContext(null);

function sessionToken(data) {
  return data?.accessToken || data?.token || "";
}

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(() => getStoredUser());

  const applySession = useCallback((token, nextUser) => {
    persistSession(token, nextUser);
    clearFavoriteCache();
    setAccessToken(token || "");
    setUser(nextUser || null);
  }, []);

  const refreshUser = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      return null;
    }

    const me = await getCurrentUser();
    if (me) {
      persistSession(token, me);
      setUser(me);
    }
    return me;
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const token = getStoredToken();
    if (!token) {
      throw new Error("Please log in to update your profile");
    }

    const me = await updateCurrentUser(payload);
    if (me) {
      persistSession(token, me);
      setUser(me);
    }
    return me;
  }, []);

  useEffect(() => {
    if (!getStoredToken()) {
      return undefined;
    }

    let cancelled = false;

    getCurrentUser()
      .then((me) => {
        if (!cancelled && me) {
          persistSession(getStoredToken(), me);
          setUser(me);
        }
      })
      .catch(() => {
        /* keep the stored profile if /me is unavailable */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email, password) => {
    const data = await loginRequest(email, password);
    const token = sessionToken(data);
    applySession(token, mapUser(data.user || data));

    try {
      const me = await getCurrentUser();
      if (me) {
        applySession(token, me);
      }
    } catch {
      /* login payload is enough if /me is not ready */
    }

    return data;
  };

  const register = async (payload) => {
    const registeredUser = await registerRequest(payload);
    const data = await loginRequest(payload.email, payload.password);
    const token = sessionToken(data);
    applySession(token, mapUser(data.user || registeredUser || data));

    try {
      const me = await getCurrentUser();
      if (me) {
        applySession(token, me);
      }
    } catch {
      /* keep the registered user if /me is not ready */
    }

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
      refreshUser,
      updateProfile,
    }),
    [accessToken, user, refreshUser, updateProfile]
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
