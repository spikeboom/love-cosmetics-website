// app/login/page.tsx
"use client";

import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = async () => {
    const res = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      window.location.href = "/pedidos"; // redireciona
    } else {
      const data = await res.json();
      setError(data.error || "Erro");
    }
  };

  return (
    <div className="mx-auto mt-20 max-w-sm rounded border p-4 shadow">
      <h2 className="mb-4 text-xl font-bold">Login</h2>
      <input
        className="mb-2 w-full border p-2"
        placeholder="Usuário"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        className="mb-2 w-full border p-2"
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="text-red-600">{error}</p>}
      <button
        onClick={login}
        className="mt-2 w-full bg-blue-500 p-2 text-white"
      >
        Entrar
      </button>
    </div>
  );
}
