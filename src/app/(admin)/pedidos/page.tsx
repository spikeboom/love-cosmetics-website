"use client";

import React, { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AbandonosPanel } from "./components/AbandonosPanel";
import { ConsultasCepPanel } from "./components/ConsultasCepPanel";
import { FunilPanel } from "./components/FunilPanel";
import { DashboardPanel } from "./components/DashboardPanel";
import { DREPanel } from "./components/DREPanel";
import { PedidosListPanel } from "./components/PedidosListPanel";
import { InstagramPanel } from "./components/InstagramPanel";
import { PackageIcon } from "./components/Icons";

const TABS = ["pedidos", "abandonos", "ceps", "funil", "dashboard", "dre", "instagram"] as const;
type TabKey = (typeof TABS)[number];

const ShoppingCartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const MapPinTabIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export default function PedidosPageWrapper() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <PedidosPage />
    </Suspense>
  );
}

function PedidosPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get("tab");
  const activeTab: TabKey = TABS.includes(tabParam as TabKey) ? (tabParam as TabKey) : "pedidos";

  const [visitedTabs, setVisitedTabs] = useState<Set<TabKey>>(() => new Set([activeTab]));

  const switchTab = useCallback((tab: TabKey) => {
    setVisitedTabs((prev) => {
      if (prev.has(tab)) return prev;
      const next = new Set(prev);
      next.add(tab);
      return next;
    });
    const url = tab === "pedidos" ? "/pedidos" : `/pedidos?tab=${tab}`;
    router.push(url, { scroll: false });
  }, [router]);

  // Sync visitedTabs when URL changes externally (e.g. browser back/forward)
  useEffect(() => {
    setVisitedTabs((prev) => {
      if (prev.has(activeTab)) return prev;
      const next = new Set(prev);
      next.add(activeTab);
      return next;
    });
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#f8f3ed]">
      {/* Header */}
      <div className="bg-[#254333] px-4 lg:px-8 py-6">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-cera-pro font-bold text-[24px] lg:text-[32px] text-white leading-normal">
                Painel de Pedidos
              </h1>
              <p className="font-cera-pro font-light text-[14px] lg:text-[16px] text-white/80 mt-1">
                Gerencie e visualize todos os pedidos da loja
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            <button
              onClick={() => switchTab("pedidos")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-t-[10px] font-cera-pro font-medium text-[14px] transition-colors ${
                activeTab === "pedidos"
                  ? "bg-[#f8f3ed] text-[#254333]"
                  : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              }`}
            >
              <PackageIcon />
              Pedidos
            </button>
            <button
              onClick={() => switchTab("abandonos")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-t-[10px] font-cera-pro font-medium text-[14px] transition-colors ${
                activeTab === "abandonos"
                  ? "bg-[#f8f3ed] text-[#254333]"
                  : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              }`}
            >
              <ShoppingCartIcon />
              Carrinhos Abandonados
            </button>
            <button
              onClick={() => switchTab("ceps")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-t-[10px] font-cera-pro font-medium text-[14px] transition-colors ${
                activeTab === "ceps"
                  ? "bg-[#f8f3ed] text-[#254333]"
                  : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              }`}
            >
              <MapPinTabIcon />
              CEPs Consultados
            </button>
            <button
              onClick={() => switchTab("funil")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-t-[10px] font-cera-pro font-medium text-[14px] transition-colors ${
                activeTab === "funil"
                  ? "bg-[#f8f3ed] text-[#254333]"
                  : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              Funil
            </button>
            <button
              onClick={() => switchTab("dashboard")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-t-[10px] font-cera-pro font-medium text-[14px] transition-colors ${
                activeTab === "dashboard"
                  ? "bg-[#f8f3ed] text-[#254333]"
                  : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Dashboard
            </button>
            <button
              onClick={() => switchTab("dre")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-t-[10px] font-cera-pro font-medium text-[14px] transition-colors ${
                activeTab === "dre"
                  ? "bg-[#f8f3ed] text-[#254333]"
                  : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3v18h18" />
                <path d="M7 14l4-4 4 4 5-5" />
              </svg>
              DRE
            </button>
            <button
              onClick={() => switchTab("instagram")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-t-[10px] font-cera-pro font-medium text-[14px] transition-colors ${
                activeTab === "instagram"
                  ? "bg-[#f8f3ed] text-[#254333]"
                  : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
              Instagram
            </button>
          </div>
        </div>
      </div>

      {/* Conteudo */}
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-6">
        <div className={activeTab !== "pedidos" ? "hidden" : ""}>
          {visitedTabs.has("pedidos") && <PedidosListPanel />}
        </div>
        <div className={activeTab !== "abandonos" ? "hidden" : ""}>
          {visitedTabs.has("abandonos") && <AbandonosPanel />}
        </div>
        <div className={activeTab !== "ceps" ? "hidden" : ""}>
          {visitedTabs.has("ceps") && <ConsultasCepPanel />}
        </div>
        <div className={activeTab !== "funil" ? "hidden" : ""}>
          {visitedTabs.has("funil") && <FunilPanel />}
        </div>
        <div className={activeTab !== "dashboard" ? "hidden" : ""}>
          {visitedTabs.has("dashboard") && <DashboardPanel />}
        </div>
        <div className={activeTab !== "dre" ? "hidden" : ""}>
          {visitedTabs.has("dre") && <DREPanel />}
        </div>
        <div className={activeTab !== "instagram" ? "hidden" : ""}>
          {visitedTabs.has("instagram") && <InstagramPanel />}
        </div>
      </div>
    </div>
  );
}
