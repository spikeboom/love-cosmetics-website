"use client";

import { useEffect, useState } from "react";

const IS_DEV = process.env.NEXT_PUBLIC_DEV_TOOLS === "true";

export default function TestModeIndicator() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

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
    <>
      <button
        type="button"
        aria-label="Modo de teste ativo"
        aria-expanded={expanded}
        title="Modo de teste ativo"
        onClick={() => setExpanded((current) => !current)}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        onFocus={() => setExpanded(true)}
        onBlur={() => setExpanded(false)}
        className={`relative block w-full overflow-hidden bg-amber-400 text-center font-cera-pro text-[12px] font-bold uppercase tracking-[0.08em] text-amber-950 transition-[height,background-color] duration-200 hover:bg-amber-300 ${
          expanded ? "h-[34px]" : "h-[8px]"
        }`}
      >
        <span
          aria-hidden="true"
          className="test-mode-sweep absolute inset-y-0 left-[-35%] w-[35%] bg-gradient-to-r from-transparent via-white/70 to-transparent"
        />
        <span
          className={`relative z-10 flex h-[34px] items-center justify-center px-4 transition-opacity duration-150 ${
            expanded ? "opacity-100" : "opacity-0"
          }`}
        >
          Modo teste ativo: navegue sem registrar eventos reais
        </span>
      </button>
      <style jsx>{`
        .test-mode-sweep {
          animation: test-mode-sweep 1.4s linear infinite;
        }

        @keyframes test-mode-sweep {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(386%);
          }
        }
      `}</style>
    </>
  );
}
