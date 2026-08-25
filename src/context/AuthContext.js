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
  googleLoginRequest,
  loginRequest,
  mapUser,
  registerRequest,
  updateCurrentUser,
  uploadProfilePhoto,
} from "../services/authService";

import {
  clearFavoriteCache,
} from "../services/favoriteService";


const AuthContext = createContext(null);


/* =========================================
   GET TOKEN FROM LOGIN RESPONSE
========================================= */

function sessionToken(data) {
  return (
    data?.accessToken ||
    data?.token ||
    data?.jwt ||
    ""
  );
}


/* =========================================
   AUTH PROVIDER
========================================= */

export function AuthProvider({
  children,
}) {

  const [accessToken, setAccessToken] =
    useState(() =>
      getStoredToken()
    );

  const [user, setUser] =
    useState(() =>
      getStoredUser()
    );


  /* =======================================
     APPLY SESSION
  ======================================= */

  const applySession = useCallback(
    (token, nextUser) => {

      persistSession(
        token,
        nextUser
      );

      clearFavoriteCache();

      setAccessToken(
        token || ""
      );

      setUser(
        nextUser || null
      );
    },
    []
  );


  /* =======================================
     REFRESH CURRENT USER
  ======================================= */

  const refreshUser = useCallback(
    async () => {

      const token =
        getStoredToken();

      if (!token) {
        return null;
      }

      const me =
        await getCurrentUser();

      if (me) {

        persistSession(
          token,
          me
        );

        setUser(me);
      }

      return me;
    },
    []
  );


  /* =======================================
     UPDATE PROFILE
  ======================================= */

  const updateProfile =
    useCallback(
      async (payload) => {

        const token =
          getStoredToken();

        if (!token) {

          throw new Error(
            "Please log in to update your profile"
          );
        }

        const me =
          await updateCurrentUser(
            payload
          );

        if (me) {

          persistSession(
            token,
            me
          );

          setUser(me);
        }

        return me;
      },
      []
    );


  /* =======================================
     UPDATE PROFILE PHOTO
  ======================================= */

  const updateProfilePhoto =
    useCallback(
      async (file) => {

        const token =
          getStoredToken();

        if (!token) {

          throw new Error(
            "Please log in to update your photo"
          );
        }

        const me =
          await uploadProfilePhoto(
            file
          );

        if (me) {

          persistSession(
            token,
            me
          );

          setUser(me);
        }

        return me;
      },
      []
    );


  /* =======================================
     LOAD USER ON APP START
  ======================================= */

  useEffect(() => {

    if (!getStoredToken()) {
      return undefined;
    }

    let cancelled = false;

    getCurrentUser()
      .then((me) => {

        if (
          !cancelled &&
          me
        ) {

          persistSession(
            getStoredToken(),
            me
          );

          setUser(me);
        }
      })
      .catch(() => {

        /*
         * Keep stored profile if
         * /me is temporarily unavailable.
         */
      });

    return () => {
      cancelled = true;
    };

  }, []);


  /* =======================================
     LOGIN
  ======================================= */

  const login = async (
    email,
    password
  ) => {

    const data =
      await loginRequest(
        email,
        password
      );

    const token =
      sessionToken(data);

    applySession(
      token,
      mapUser(
        data.user || data
      )
    );

    try {

      const me =
        await getCurrentUser();

      if (me) {

        applySession(
          token,
          me
        );
      }

    } catch {

      /*
       * Login response is enough
       * if /me is not ready.
       */
    }

    return data;
  };


  /* =======================================
     GOOGLE LOGIN
  ======================================= */

  const loginWithGoogle =
    useCallback(
      async (idToken) => {

        if (!idToken) {

          throw new Error(
            "Google did not return an ID token"
          );
        }

        const data =
          await googleLoginRequest(
            idToken
          );

        const token =
          sessionToken(data);

        if (!token) {

          throw new Error(
            "Google login did not return an access token"
          );
        }

        applySession(
          token,
          mapUser(
            data.user || data
          )
        );

        try {

          const me =
            await getCurrentUser();

          if (me) {

            applySession(
              token,
              me
            );
          }

        } catch {

          /*
           * Google login payload is enough
           * if /me is not ready.
           */
        }

        return data;
      },
      [applySession]
    );


  /* =======================================
     REGISTER
  ======================================= */

  const register = async (
    payload
  ) => {

    /*
     * IMPORTANT
     *
     * Only register here.
     *
     * Backend sends OTP.
     *
     * DO NOT call loginRequest()
     * here.
     */

    const result =
      await registerRequest(
        payload
      );

    /*
     * Example backend response:
     *
     * {
     *   "message":
     *     "OTP sent to your email. Verify to complete registration.",
     *   "success": true
     * }
     *
     * Return this response to Register.js.
     */

    return result;
  };


  /* =======================================
     LOGOUT
  ======================================= */

  const logout = () => {

    clearSession();

    clearFavoriteCache();

    setAccessToken("");

    setUser(null);
  };


  /* =======================================
     CONTEXT VALUE
  ======================================= */

  const value = useMemo(
    () => ({

      accessToken,

      user,

      isAuthenticated:
        Boolean(
          accessToken &&
          user
        ),

      login,

      loginWithGoogle,

      register,

      logout,

      refreshUser,

      updateProfile,

      updateProfilePhoto,
    }),

    [
      accessToken,
      user,
      refreshUser,
      updateProfile,
      updateProfilePhoto,
      loginWithGoogle,
    ]
  );


  return React.createElement(
    AuthContext.Provider,
    {
      value,
    },
    children
  );
}


/* =========================================
   USE AUTH
========================================= */

export function useAuth() {

  const context =
    useContext(
      AuthContext
    );

  if (!context) {

    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return context;
}