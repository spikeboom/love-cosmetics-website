"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMeuContexto } from "@/components/common/Context/context";

export default function SairPage() {
  const router = useRouter();
  const { refreshAuth } = useMeuContexto();

  useEffect(() => {
    const logout = async () => {
      try {
        await fetch("/api/cliente/auth/sair", {
          method: "POST",
          credentials: "include",
        });

        // Atualizar estado de auth no Context
        await refreshAuth();

        // Redirecionar para home
        router.push("/figma/design");
      } catch {
        // Mesmo com erro, redirecionar
        router.push("/figma/design");
      }
    };

    logout();
  }, [router, refreshAuth]);

  return (
    <div className="bg-white min-h-[calc(100vh-300px)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#254333] border-t-transparent rounded-full animate-spin" />
        <p className="font-cera-pro text-[16px] text-[#333]">Saindo...</p>
      </div>
    </div>
  );
}
