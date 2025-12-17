import { apiFetch, setToken, clearToken } from "./client";
import type { MeResponse, DashboardResponse } from "./types";

export async function signup(payload: { name: string; email: string; password: string }) {
  return apiFetch<{ ok: true }>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function login(payload: { email: string; password: string }) {
  const res = await apiFetch<{ token: string }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  setToken(res.token);
  return res;
}

export function logout() {
  clearToken();
}

export async function getMe() {
  return apiFetch<MeResponse>("/api/me", { method: "GET" });
}

export async function getDashboard() {
  return apiFetch<DashboardResponse>("/api/dashboard", { method: "GET" });
}

export async function vote(payload: { section: "NEWS" | "PRICES" | "INSIGHT" | "MEME"; itemId: string; value: 1 | -1 }) {
  return apiFetch<{ vote: any }>("/api/votes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function unvote(payload: { section: "NEWS" | "PRICES" | "INSIGHT" | "MEME"; itemId: string }) {
  return apiFetch<{ ok: true }>("/api/votes", {
    method: "DELETE",
    body: JSON.stringify(payload),
  });
}
