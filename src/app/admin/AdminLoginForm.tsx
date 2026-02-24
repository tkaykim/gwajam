"use client";

import { useState } from "react";
import { verifyAdminPassword } from "./actions";

export function AdminLoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const ok = await verifyAdminPassword(password);
      if (ok) {
        window.location.reload();
      } else {
        setError("비밀번호가 올바르지 않습니다.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-xs space-y-4 p-6 rounded-2xl bg-white/5 border border-white/20"
    >
      <h1 className="text-lg font-bold text-white">관리자 로그인</h1>
      <label className="block">
        <span className="block text-sm text-white/70 mb-1">비밀번호</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20"
          required
        />
      </label>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-accent text-white font-medium disabled:opacity-50"
      >
        {loading ? "확인 중…" : "로그인"}
      </button>
    </form>
  );
}
