/**
 * AuthContext — provides auth state to the React tree.
 * Ported from squad-demo/src/contexts/AuthContext.tsx.
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@squad-sports/core';

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  accessToken: string | null;
}

const AuthCtx = createContext<AuthContextValue>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  accessToken: null,
});

export function useAuth(): AuthContextValue {
  return useContext(AuthCtx);
}

export function AuthContextProvider({
  children,
  user,
  accessToken,
  isLoading,
}: {
  children: React.ReactNode;
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
}) {
  const value: AuthContextValue = {
    isAuthenticated: !!accessToken && !!user,
    isLoading,
    user,
    accessToken,
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
