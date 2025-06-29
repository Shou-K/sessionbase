"use client";

import React, { useState, useEffect, createContext, useCallback } from "react";
import type { UserProfile } from "@/app/_types/UserProfile";
import useSWR, { mutate } from "swr";
import type { ApiResponse } from "../_types/ApiResponse";

interface AuthContextProps {
  userProfile: UserProfile | null;
  logout: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextProps | undefined>(
  undefined,
);

interface Props {
  children: React.ReactNode;
}

const AuthProvider: React.FC<Props> = ({ children }) => {
  const ep = "/api/auth";
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const fetcher = useCallback(async (endPoint: string) => {
    const res = await fetch(endPoint, {
      credentials: "same-origin",
      cache: "no-store",
    });
    return res.json();
  }, []);

  const { data: session } = useSWR<ApiResponse<UserProfile | null>>(
    ep,
    fetcher,
  );

  const logout = async () => {
    await fetch("/api/logout", {
      method: "DELETE",
      credentials: "same-origin",
    });
    setUserProfile(null);
    mutate(() => true, undefined, { revalidate: false });
    return true;
  };

  useEffect(() => {
    if (session && session.success) {
      setUserProfile(session.payload);
    } else {
      setUserProfile(null);
    }
  }, [session]);

  return (
    <AuthContext.Provider
      value={{
        userProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
