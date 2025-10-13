import React, { useState } from 'react';
import { Home as HomeIcon, BarChart3, FileSpreadsheet, Settings, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom"; // ✅ Import obrigatório
import clsx from "clsx";

type ThemeColor = 'purple' | 'blue' | 'green';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
  themeColor: ThemeColor;
}

const themeColors = {
  purple: { primary: "#a855f7", hover: "#c084fc", bg: "bg-purple-600", border: "border-purple-500" },
  blue: { primary: "#3b82f6", hover: "#60a5fa", bg: "bg-blue-600", border: "border-blue-500" },
  green: { primary: "#10b981", hover: "#34d399", bg: "bg-green-600", border: "border-green-500" },
};

function SidebarItem({ icon, label, active = false, onClick, themeColor }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
        active
          ? `${themeColors[themeColor].bg}/20 text-${themeColor}-400 ${themeColors[themeColor].border}/30`
          : `text-gray-300 hover:bg-gray-800 hover:text-${themeColor}-300`
      )}
      aria-label={label}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function Sidebarr() {
  const [activeTab, setActiveTab] = useState("inicio");
  const themeColor: ThemeColor = "purple";
  const navigate = useNavigate(); // ✅ Hook do React Router

  return (
    <aside className="w-60 h-screen bg-gray-900 border-r border-gray-800 flex flex-col fixed">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">Dashboard Financeiro</h1>
        <p className="text-xs text-gray-400 mt-1">Receita Operacional Líquida</p>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <SidebarItem
          icon={<HomeIcon size={18} className="text-gray-400" />}
          label="Início"
          active={activeTab === "inicio"}
          onClick={() => {
            setActiveTab("inicio");
            navigate("/");
          }}
          themeColor={themeColor}
        />

        <SidebarItem
          icon={<BarChart3 size={18} className="text-gray-400" />}
          label="Custos Variáveis"
          active={activeTab === "custos"}
          onClick={() => {
            setActiveTab("custos");
            navigate("/CustosVariaveis");
          }}
          themeColor={themeColor}
        />

        <SidebarItem
          icon={<BarChart3 size={18} className="text-gray-400" />}
          label="Receita Líquida/Bruta"
          active={activeTab === "receita"}
          onClick={() => {
            setActiveTab("receita");
            navigate("/ReceitaLiquida"); // ✅ igual ao path da rota
          }}
          themeColor={themeColor}
        />

        <SidebarItem
          icon={<FileSpreadsheet size={18} className="text-gray-400" />}
          label="Integração Planilha"
          active={activeTab === "planilha"}
          onClick={() => {
            setActiveTab("planilha");
            navigate("/Integracao");
        }}
          themeColor={themeColor}
        />
      </nav>
    </aside>
  );
}

export default Sidebarr;
