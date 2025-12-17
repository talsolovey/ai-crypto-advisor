import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getMe } from "../api/endpoints";
import { getToken, clearToken } from "../api/client";
import type { MeResponse } from "../api/types";

type AuthState =
  | { status: "loading" }
  | { status: "guest" }
  | { status: "authed"; me: MeResponse };

type AuthCtx = {
  state: AuthState;
  refreshMe: () => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  async function refreshMe() {
    const token = getToken();
    if (!token) {
      setState({ status: "guest" });
      return;
    }

    try {
      const me = await getMe();
      setState({ status: "authed", me });
    } catch (e) {
      // Token might be invalid/expired → treat as logged out
      clearToken();
      setState({ status: "guest" });
    }
  }

  function logout() {
    clearToken();
    setState({ status: "guest" });
  }

  useEffect(() => {
    refreshMe();
  }, []);

  const value = useMemo(() => ({ state, refreshMe, logout }), [state]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
