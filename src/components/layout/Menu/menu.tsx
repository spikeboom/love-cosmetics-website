"use client";

import { useState, useEffect } from "react";
import { useUI } from "@/core/ui/UIContext";
import { useAuth } from "@/contexts/AuthContext";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";
import { Divider } from "@mui/material";
import Link from "next/link";
import * as AiIcons from "react-icons/ai";
import * as LuIcons from "react-icons/lu";
import * as FiIcons from "react-icons/fi";
import * as GiIcons from "react-icons/gi";
import * as WiIcons from "react-icons/wi";
import * as FaIcons from "react-icons/fa";

const iconLibraries = {
  ai: AiIcons,
  lu: LuIcons,
  fi: FiIcons,
  gi: GiIcons,
  wi: WiIcons,
  fa: FaIcons,
};

function getDynamicIcon(iconName: string) {
  const prefix = iconName.slice(0, 2).toLowerCase(); // ex: Ai -> ai
  const lib = iconLibraries[prefix as keyof typeof iconLibraries];
  return (lib as any)?.[iconName] || null;
}

const listMenus = [
  {
    iconName: "FiPackage",
    iconColor: "#dcafad",
    iconSize: 32,
    text: "Kits",
    submenus: [
      {
        href: "/pdp/kit-completo",
        text: "Kit Completo",
      },
      {
        href: "/pdp/kit-uso-diario",
        text: "Kit Uso Diário",
      },
    ],
  },
  {
    iconName: "LuGift",
    iconColor: "#dcafad",
    iconSize: 32,
    text: "Promoções",
    enabled: false,
    submenus: [
      {
        href: "/",
        text: "Promoção 1",
      },
      {
        href: "/",
        text: "Promoção 2",
      },
      {
        href: "/",
        text: "Promoção 3",
      },
    ],
  },
  {
    iconName: "WiDayHaze",
    iconColor: "#dcafad",
    iconSize: 32,
    text: "Rotina Diária",
    submenus: [
      {
        href: "/pdp/serum-facial",
        text: "Sérum",
      },
      {
        href: "/pdp/hidratante-facial",
        text: "Hidratante",
      },
      {
        href: "/pdp/espuma-facial",
        text: "Espuma",
      },
    ],
  },
  {
    iconName: "AiOutlineTeam",
    iconColor: "#dcafad",
    iconSize: 32,
    text: "Corporal",
    submenus: [
      {
        href: "/pdp/manteiga-corporal",
        text: "Manteiga Corporal de Tucumã",
      },
    ],
  },
  {
    iconName: "GiPorcelainVase",
    iconColor: "#dcafad",
    iconSize: 32,
    text: "Argila",
    submenus: [
      {
        href: "/pdp/mascara-de-argila",
        text: "Máscara de Argila Branca",
      },
    ],
  },
];

const listMenusSimples = [
  {
    text: "Conheça Nossa História",
    enabled: true,
    href: "/nossa-historia",
  },
];

export function ModalMenu() {
  const { menuMounted, setMenuMounted } = useUI();
  const { user, isAuthenticated, logout } = useAuth();

  const animationDuration = 700;
  const [openMenu, setOpenMenu] = useState(false);

  useEffect(() => {
    if (!openMenu) {
      const timer = setTimeout(() => {
        setMenuMounted(false);
      }, animationDuration);
      return () => clearTimeout(timer);
    }
  }, [openMenu, animationDuration]);

  useEffect(() => {
    if (menuMounted) {
      setOpenMenu(true);
    }
  }, [menuMounted, animationDuration]);

  const [actualMenu, setActualMenu] = useState(null);

  const handleEnterMenu = ({ text }: any) => {
    setActualMenu(text);
    setMenuSecundarioOpen(true);
  };

  const handleBackMenu = () => {
    setMenuSecundarioOpen(false);
    setActualMenu(null);
  };

  const itemMenu = ({
    text,
    iconName,
    iconColor,
    iconSize,
    enabled = true,
  }: any) => {
    const Icon = getDynamicIcon(iconName);

    return (
      <button
        onClick={() => enabled && handleEnterMenu({ text })}
        className={`${!enabled ? "opacity-[0.5]" : ""} flex w-full items-center justify-between p-4 pr-6`}
        key={text}
      >
        <div className="flex items-center">
          {Icon && <Icon size={iconSize} color={iconColor} />}
          <span className="ml-[8px] text-[16px] font-semibold">{text}</span>
        </div>
        <FaChevronRight size={12} />
      </button>
    );
  };

  const itemMenuSimples = ({ text, href, enabled = true, icon, onClick }: any) => {
    const Icon = icon ? getDynamicIcon(icon) : null;
    
    if (onClick) {
      return (
        <button
          onClick={onClick}
          className={`${!enabled ? "opacity-[0.5]" : ""} flex w-full items-center justify-between p-4 pr-6`}
          key={text}
        >
          <div className="flex items-center">
            {Icon && <Icon size={20} className="text-[#dcafad]" />}
            <span className="ml-[8px] text-[16px] font-semibold">{text}</span>
          </div>
          <FaChevronRight size={12} />
        </button>
      );
    }
    
    return (
      <a
        href={enabled ? href : ""}
        className={`${!enabled ? "opacity-[0.5]" : ""} flex w-full items-center justify-between p-4 pr-6`}
        key={text}
      >
        <div className="flex items-center">
          {Icon && <Icon size={20} className="text-[#dcafad]" />}
          <span className="ml-[8px] text-[16px] font-semibold">{text}</span>
        </div>
        <FaChevronRight size={12} />
      </a>
    );
  };

  const itemMenuSecundario = ({ text, href, enabled = true }: any) => (
    <a
      href={enabled ? href : ""}
      className={`${!enabled ? "opacity-[0.5]" : ""} flex w-full items-center justify-between p-4 pr-6`}
      key={text}
    >
      <span className="ml-[8px] text-[16px] font-semibold">{text}</span>
    </a>
  );

  const itemMenuSecundarioVoltar = ({ text }: any) => (
    <button
      onClick={() => handleBackMenu()}
      className="mb-2 flex w-full items-center p-4 pr-6"
      key={text}
    >
      <FaChevronLeft size={16} />
      <span className="ml-[8px] text-[20px] font-semibold">{text}</span>
    </button>
  );

  const [menuSecundarioOpen, setMenuSecundarioOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setOpenMenu(false);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const menuPrincipal = (
    <div className="w-full pt-[30px]">
      {isAuthenticated && (
        <>
          <div className="px-4 py-3 mb-2 bg-gray-50">
            <p className="text-sm font-semibold text-gray-900">
              Olá, {user?.nome}!
            </p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          
          {itemMenuSimples({
            text: "Minha Conta",
            href: "/minha-conta",
            icon: "FaUserCircle",
            enabled: true,
          })}
          
          {itemMenuSimples({
            text: "Meus Pedidos",
            href: "/minha-conta/pedidos",
            icon: "FaShoppingBag",
            enabled: true,
          })}
          
          <Divider
            variant="middle"
            component="div"
            style={{
              marginTop: "16px",
              marginBottom: "16px",
            }}
          />
        </>
      )}
      
      {listMenus.map((menu) => itemMenu({ ...menu }))}

      <Divider
        variant="middle"
        component="div"
        style={{
          marginTop: "16px",
          marginBottom: "16px",
        }}
      />

      {listMenusSimples.map((menu) =>
        itemMenuSimples({
          text: menu.text,
          href: menu.href,
          enabled: menu.enabled ?? true,
        }),
      )}
      
      <Divider
        variant="middle"
        component="div"
        style={{
          marginTop: "16px",
          marginBottom: "16px",
        }}
      />
      
      {isAuthenticated ? (
        itemMenuSimples({
          text: "Sair",
          icon: "FaSignOutAlt",
          onClick: handleLogout,
          enabled: true,
        })
      ) : (
        <>
          {itemMenuSimples({
            text: "Entrar",
            href: "/conta/entrar",
            icon: "FaSignInAlt",
            enabled: true,
          })}
          
          {itemMenuSimples({
            text: "Criar Conta",
            href: "/conta/cadastrar",
            icon: "FaUserPlus",
            enabled: true,
          })}
        </>
      )}
    </div>
  );

  const menuSecundario = (
    <div className="w-full pt-[18px]">
      {itemMenuSecundarioVoltar({ text: actualMenu })}
      {listMenus
        ?.find((menu) => menu.text === actualMenu)
        ?.submenus.map((submenu) =>
          itemMenuSecundario({ text: submenu.text, href: submenu.href }),
        )}
    </div>
  );

  return (
    <>
      {menuMounted && (
        <>
          <div
            className="fixed top-0 z-[998] h-full w-full bg-black opacity-50 transition-all"
            style={{ left: 0, maxWidth: "100vw" }}
            onClick={() => setOpenMenu(false)}
          ></div>
          <div
            className="fixed top-0 z-[999] h-full w-[calc(100%-20px)] overflow-y-auto bg-white font-poppins transition-all md:max-w-[400px]"
            style={{
              transitionDuration: `${animationDuration}ms`,
              left: openMenu ? "0" : "-100%",
            }}
          >
            <div className="relative w-full">
              <button
                onClick={() => setOpenMenu(false)}
                className="absolute right-0 top-0 p-2"
              >
                <IoMdClose size={18} />
              </button>

              <div className="w-full">
                {!menuSecundarioOpen ? menuPrincipal : menuSecundario}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
