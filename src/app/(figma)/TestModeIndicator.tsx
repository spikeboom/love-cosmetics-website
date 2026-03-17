"use client";

import { useEffect, useState } from "react";

const IS_DEV = process.env.NEXT_PUBLIC_DEV_TOOLS === "true";

export default function TestModeIndicator() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function check() {
      if (IS_DEV) {
        setVisible(true);
        return;
      }
      const m = document.cookie.match(/(?:^|; )is_test_user=([^;]+)/);
      setVisible(!!(m && m[1] === "1"));
    }
    check();
    const id = setInterval(check, 2000);
    return () => clearInterval(id);
  }, []);

  if (!visible) return null;

  return (
    <a
      href="/test-mode"
      title="Modo de teste ativo"
      className="fixed top-3 left-3 z-[9999] flex items-center gap-1.5 rounded-full bg-amber-400/90 px-3 py-1.5 text-xs font-semibold text-amber-900 shadow-lg backdrop-blur-sm animate-pulse hover:animate-none hover:bg-amber-400 transition-colors"
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-200 opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
      </span>
      TESTE
    </a>
  );
}
