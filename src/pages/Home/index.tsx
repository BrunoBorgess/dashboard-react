import React, { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { BarChart3, Home as HomeIcon, FileSpreadsheet, TrendingUp, DollarSign, Filter, Calendar, Search, Download, Settings, HelpCircle } from "lucide-react";
import clsx from "clsx";
import jsPDF from "jspdf";
// import "jspdf-autotable";

type MonthlyData = { month: string; previsto: number; realizado: number; date: string };
type FinalData = { month: string; value: number; date: string };
type AllData = Record<string, MonthlyData[] | FinalData[]>;

type ThemeColor = 'purple' | 'blue' | 'green';

interface SidebarProps { activeTab: string; onTabChange: (tab: string) => void; themeColor: ThemeColor; }
interface SidebarItemProps { icon: React.ReactNode; label: string; active?: boolean; onClick: () => void; themeColor: ThemeColor; }
interface HeaderProps {
  selectedCategory: string; onCategoryChange: (category: string) => void; startMonth: string; startYear: string; endMonth: string; endYear: string;
  onStartMonthChange: (month: string) => void; onStartYearChange: (year: string) => void; onEndMonthChange: (month: string) => void; onEndYearChange: (year: string) => void;
  onSearch: () => void; onExportPDF: () => void; onExportCSV: () => void; showFilters: boolean; themeColor: ThemeColor; activeTab: string;
}
interface KPICardProps { title: string; value: number; trend: number; icon: React.ElementType; isPercentage?: boolean; themeColor: ThemeColor; }
interface CategoryChartProps { data: MonthlyData[] | FinalData[]; category: string; isFinal?: boolean; isSingleMonth: boolean; themeColor: ThemeColor; colorSet?: string[]; }
interface FinancialTabProps {
  data: AllData; selectedCategory: string; startMonth: string; startYear: string; endMonth: string; endYear: string; setSelectedCategory: (category: string) => void; themeColor: ThemeColor; isRevenueTab?: boolean;
}

const mainCategories = ["Administração", "Compra de Animais", "Custos Combustíveis Gerais", "Custos Equip. Proteção Individual", "Inseminação", "Manutenção e Conservação", "Mão-de-Obra", "Materiais", "Nutrição", "Sanidade", "Serviços", "Tarifas"];
const revenueCategories = ["Venda de Cevados", "Venda de Matriz/Reprodutor", "Venda de Leite", "Gtas", "Fsds", "Funrural", "ICMS", "Senar", "Fundes", "Descontos sobre Vendas", "Fretes sobre Vendas"];
const finalCategories = ["Custo Fixo", "Custo Variável", "Custo Total", "Receita Operacional Bruta", "Receita Operacional Líquida", "Resultado"];
const fixedCategories = ["Administração", "Mão-de-Obra", "Tarifas", "Manutenção e Conservação"];

const categoryRanges = {
  Administração: { min: 1000, max: 5000, variation: 200, trend: () => (Math.random() * 8 - 4).toFixed(1) },
  "Compra de Animais": { min: 10000, max: 30000, variation: 1000, trend: () => (Math.random() * 10 - 5).toFixed(1) },
  "Custos Combustíveis Gerais": { min: 2000, max: 8000, variation: 300, trend: () => (Math.random() * 6 - 3).toFixed(1) },
  "Custos Equip. Proteção Individual": { min: 500, max: 2000, variation: 100, trend: () => (Math.random() * 5 - 2.5).toFixed(1) },
  Inseminação: { min: 3000, max: 10000, variation: 400, trend: () => (Math.random() * 7 - 3.5).toFixed(1) },
  "Manutenção e Conservação": { min: 4000, max: 12000, variation: 500, trend: () => (Math.random() * 9 - 4.5).toFixed(1) },
  "Mão-de-Obra": { min: 8000, max: 25000, variation: 800, trend: () => (Math.random() * 10 - 5).toFixed(1) },
  Materiais: { min: 1500, max: 6000, variation: 250, trend: () => (Math.random() * 6 - 3).toFixed(1) },
  Nutrição: { min: 7000, max: 20000, variation: 600, trend: () => (Math.random() * 8 - 4).toFixed(1) },
  Sanidade: { min: 2000, max: 7000, variation: 300, trend: () => (Math.random() * 7 - 3.5).toFixed(1) },
  Serviços: { min: 3000, max: 9000, variation: 350, trend: () => (Math.random() * 6 - 3).toFixed(1) },
  Tarifas: { min: 1000, max: 4000, variation: 150, trend: () => (Math.random() * 5 - 2.5).toFixed(1) },
  "Venda de Cevados": { min: 40000, max: 80000, variation: 2000, trend: () => (Math.random() * 10 - 5).toFixed(1) },
  "Venda de Matriz/Reprodutor": { min: 10000, max: 30000, variation: 1000, trend: () => (Math.random() * 8 - 4).toFixed(1) },
  "Venda de Leite": { min: 15000, max: 40000, variation: 1500, trend: () => (Math.random() * 9 - 4.5).toFixed(1) },
  Gtas: { min: 1000, max: 3000, variation: 100, trend: () => (Math.random() * 5 - 2.5).toFixed(1) },
  Fsds: { min: 500, max: 2000, variation: 80, trend: () => (Math.random() * 5 - 2.5).toFixed(1) },
  Funrural: { min: 800, max: 2500, variation: 90, trend: () => (Math.random() * 5 - 2.5).toFixed(1) },
  ICMS: { min: 2000, max: 6000, variation: 200, trend: () => (Math.random() * 6 - 3).toFixed(1) },
  Senar: { min: 300, max: 1000, variation: 50, trend: () => (Math.random() * 4 - 2).toFixed(1) },
  Fundes: { min: 400, max: 1200, variation: 60, trend: () => (Math.random() * 4 - 2).toFixed(1) },
  "Descontos sobre Vendas": { min: 1000, max: 4000, variation: 150, trend: () => (Math.random() * 5 - 2.5).toFixed(1) },
  "Fretes sobre Vendas": { min: 1500, max: 5000, variation: 200, trend: () => (Math.random() * 6 - 3).toFixed(1) },
  "Custo Fixo": { min: 0, max: 0, variation: 0, trend: () => (Math.random() * 8 - 4).toFixed(1) },
  "Custo Variável": { min: 0, max: 0, variation: 0, trend: () => (Math.random() * 8 - 4).toFixed(1) },
  "Custo Total": { min: 0, max: 0, variation: 0, trend: () => (Math.random() * 8 - 4).toFixed(1) },
  "Receita Operacional Bruta": { min: 0, max: 0, variation: 0, trend: () => (Math.random() * 10 - 5).toFixed(1) },
  "Receita Operacional Líquida": { min: 0, max: 0, variation: 0, trend: () => (Math.random() * 10 - 5).toFixed(1) },
  Resultado: { min: 0, max: 0, variation: 0, trend: () => (Math.random() * 10 - 5).toFixed(1) },
} as const;

type CategoryKey = keyof typeof categoryRanges;

const months = [
  { value: "01", label: "Jan" }, { value: "02", label: "Fev" }, { value: "03", label: "Mar" }, { value: "04", label: "Abr" },
  { value: "05", label: "Mai" }, { value: "06", label: "Jun" }, { value: "07", label: "Jul" }, { value: "08", label: "Ago" },
  { value: "09", label: "Set" }, { value: "10", label: "Out" }, { value: "11", label: "Nov" }, { value: "12", label: "Dez" },
];

const years = Array.from({ length: 10 }, (_, i) => (2025 - i).toString());

const themeColors = {
  purple: { primary: "#a855f7", hover: "#c084fc", bg: "bg-purple-600", border: "border-purple-500" },
  blue: { primary: "#3b82f6", hover: "#60a5fa", bg: "bg-blue-600", border: "border-blue-500" },
  green: { primary: "#10b981", hover: "#34d399", bg: "bg-green-600", border: "border-green-500" },
} as const;

type ColorSetKey = 'default' | 'custoFixo' | 'custoVariavel' | 'custoTotal' | 'receitaOperacionalBruta' | 'receitaOperacionalLiquida' | 'resultado';

const COLOR_SETS = {
  purple: {
    default: ["#a855f7", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#ec4899", "#8b5cf6", "#f97316", "#06b6d4", "#84cc16", "#d946ef", "#22c55e"],
    custoFixo: ["#8b5cf6", "#d8b4fe"], custoVariavel: ["#a855f7", "#e879f9"], custoTotal: ["#a855f7", "#e879f9"],
    receitaOperacionalBruta: ["#10b981", "#34d399"], receitaOperacionalLiquida: ["#10b981", "#34d399"], resultado: ["#3b82f6", "#60a5fa"],
  },
  blue: {
    default: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#a855f7", "#ec4899", "#8b5cf6", "#f97316", "#06b6d4", "#84cc16", "#d946ef", "#22c55e"],
    custoFixo: ["#1e40af", "#3b82f6"], custoVariavel: ["#2563eb", "#60a5fa"], custoTotal: ["#2563eb", "#60a5fa"],
    receitaOperacionalBruta: ["#10b981", "#34d399"], receitaOperacionalLiquida: ["#10b981", "#34d399"], resultado: ["#1e3a8a", "#3b82f6"],
  },
  green: {
    default: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#a855f7", "#ec4899", "#8b5cf6", "#f97316", "#06b6d4", "#84cc16", "#d946ef", "#22c55e"],
    custoFixo: ["#065f46", "#10b981"], custoVariavel: ["#047857", "#34d399"], custoTotal: ["#047857", "#34d399"],
    receitaOperacionalBruta: ["#15803d", "#22c55e"], receitaOperacionalLiquida: ["#15803d", "#22c55e"], resultado: ["#064e3b", "#10b981"],
  },
} as { [key in ThemeColor]: { [key in ColorSetKey]: string[] } };

const getMonthNames = (startMonth: string, startYear: string, endMonth: string, endYear: string) => {
  const startDate = new Date(parseInt(startYear), parseInt(startMonth) - 1, 1);
  const endDate = new Date(parseInt(endYear), parseInt(endMonth) - 1, 1);
  const monthNames = [];
  let current = new Date(startDate);
  while (current <= endDate) {
    const monthName = current.toLocaleDateString("pt-BR", { month: "short" });
    monthNames.push(monthName.charAt(0).toUpperCase() + monthName.slice(1));
    current.setMonth(current.getMonth() + 1);
  }
  return monthNames;
};

const generateMonthlyData = (monthNames: string[], startYear: string, category: string): MonthlyData[] => {
  const range = categoryRanges[category as CategoryKey] || { min: 5000, max: 15000, variation: 500 };
  return monthNames.map((month, index) => {
    const base = range.min + index * range.variation;
    return {
      month,
      previsto: Math.floor(base + Math.random() * (range.max - range.min)),
      realizado: Math.floor(base + (Math.random() - 0.5) * range.variation * 2),
      date: new Date(parseInt(startYear), index, 1).toISOString().split("T")[0],
    };
  });
};

const generateRevenueData = (monthNames: string[], startYear: string): Record<string, FinalData[]> => {
  return revenueCategories.reduce((acc, cat) => {
    acc[cat] = monthNames.map((month, index) => {
      const range = categoryRanges[cat as CategoryKey] || { min: 5000, max: 15000, variation: 500 };
      const base = range.min + index * range.variation;
      return {
        month,
        value: Math.floor(base + Math.random() * (range.max - range.min)),
        date: new Date(parseInt(startYear), index, 1).toISOString().split("T")[0],
      };
    });
    return acc;
  }, {} as Record<string, FinalData[]>);
};

const generateAllData = (startMonth: string, startYear: string, endMonth: string, endYear: string): AllData => {
  const startDate = new Date(parseInt(startYear), parseInt(startMonth) - 1, 1);
  const endDate = new Date(parseInt(endYear), parseInt(endMonth) - 1, 1);
  if (startDate > endDate) return {};
  const monthNames = getMonthNames(startMonth, startYear, endMonth, endYear);
  const data: AllData = {};

  mainCategories.forEach((cat) => { data[cat] = generateMonthlyData(monthNames, startYear, cat); });
  Object.assign(data, generateRevenueData(monthNames, startYear));

  data["Custo Fixo"] = monthNames.map((month, idx) => ({
    month,
    value: fixedCategories.reduce((acc, cat) => acc + (data[cat] as MonthlyData[])[idx].realizado, 0),
    date: new Date(parseInt(startYear), idx, 1).toISOString().split("T")[0],
  }));

  data["Custo Variável"] = monthNames.map((month, idx) => ({
    month,
    value: mainCategories.filter((cat) => !fixedCategories.includes(cat)).reduce((acc, cat) => acc + (data[cat] as MonthlyData[])[idx].realizado, 0),
    date: new Date(parseInt(startYear), idx, 1).toISOString().split("T")[0],
  }));

  data["Custo Total"] = monthNames.map((month, idx) => ({
    month,
    value: mainCategories.reduce((acc, cat) => acc + (data[cat] as MonthlyData[])[idx].realizado, 0),
    date: new Date(parseInt(startYear), idx, 1).toISOString().split("T")[0],
  }));

  data["Receita Operacional Bruta"] = monthNames.map((month, idx) => ({
    month,
    value: ["Venda de Cevados", "Venda de Matriz/Reprodutor", "Venda de Leite"].reduce((acc, cat) => acc + (data[cat] as FinalData[])[idx].value, 0),
    date: new Date(parseInt(startYear), idx, 1).toISOString().split("T")[0],
  }));

  data["Receita Operacional Líquida"] = monthNames.map((month, idx) => ({
    month,
    value: (data["Receita Operacional Bruta"] as FinalData[])[idx].value - ["Gtas", "Fsds", "Funrural", "ICMS", "Senar", "Fundes", "Descontos sobre Vendas", "Fretes sobre Vendas"].reduce(
      (acc, cat) => acc + (data[cat] as FinalData[])[idx].value, 0
    ),
    date: new Date(parseInt(startYear), idx, 1).toISOString().split("T")[0],
  }));

  data["Resultado"] = monthNames.map((month, idx) => ({
    month,
    value: (data["Receita Operacional Líquida"] as FinalData[])[idx].value - (data["Custo Total"] as FinalData[])[idx].value,
    date: new Date(parseInt(startYear), idx, 1).toISOString().split("T")[0],
  }));

  return data;
};

const calculateCategoryTotals = (categoryData: AllData, category: string) => {
  if (!categoryData[category]) {
    const totalPrevisto = mainCategories.reduce((sum, cat) => {
      const monthly = categoryData[cat] as MonthlyData[];
      return sum + (monthly ? monthly.reduce((acc, d) => acc + d.previsto, 0) : 0);
    }, 0);
    const totalRealizado = mainCategories.reduce((sum, cat) => {
      const monthly = categoryData[cat] as MonthlyData[];
      return sum + (monthly ? monthly.reduce((acc, d) => acc + d.realizado, 0) : 0);
    }, 0);
    const totalReceitaBruta = categoryData["Receita Operacional Bruta"] ? (categoryData["Receita Operacional Bruta"] as FinalData[]).reduce((acc, d) => acc + d.value, 0) : 0;
    const totalReceitaLiquida = categoryData["Receita Operacional Líquida"] ? (categoryData["Receita Operacional Líquida"] as FinalData[]).reduce((acc, d) => acc + d.value, 0) : 0;
    const totalResultado = categoryData["Resultado"] ? (categoryData["Resultado"] as FinalData[]).reduce((acc, d) => acc + d.value, 0) : 0;
    const variacao = totalPrevisto !== 0 ? ((totalRealizado - totalPrevisto) / totalPrevisto * 100) : 0;
    return { totalPrevisto, totalRealizado, totalReceitaBruta, totalReceitaLiquida, totalResultado, variacao };
  }

  if (mainCategories.includes(category)) {
    const monthly = categoryData[category] as MonthlyData[];
    const totalPrevisto = monthly.reduce((acc, d) => acc + d.previsto, 0);
    const totalRealizado = monthly.reduce((acc, d) => acc + d.realizado, 0);
    const variacao = totalPrevisto !== 0 ? ((totalRealizado - totalPrevisto) / totalPrevisto * 100) : 0;
    return { totalPrevisto, totalRealizado, totalReceitaBruta: 0, totalReceitaLiquida: 0, totalResultado: 0, variacao };
  }

  if (revenueCategories.includes(category) || finalCategories.includes(category)) {
    const monthly = categoryData[category] as FinalData[];
    const totalValue = monthly.reduce((acc, d) => acc + d.value, 0);
    if (category === "Receita Operacional Bruta") return { totalPrevisto: 0, totalRealizado: 0, totalReceitaBruta: totalValue, totalReceitaLiquida: 0, totalResultado: 0, variacao: 0 };
    if (category === "Receita Operacional Líquida") return { totalPrevisto: 0, totalRealizado: 0, totalReceitaBruta: 0, totalReceitaLiquida: totalValue, totalResultado: 0, variacao: 0 };
    if (category === "Custo Fixo" || category === "Custo Variável" || category === "Custo Total") return { totalPrevisto: 0, totalRealizado: totalValue, totalReceitaBruta: 0, totalReceitaLiquida: 0, totalResultado: 0, variacao: 0 };
    if (category === "Resultado") return { totalPrevisto: 0, totalRealizado: 0, totalReceitaBruta: 0, totalReceitaLiquida: 0, totalResultado: totalValue, variacao: 0 };
    return { totalPrevisto: 0, totalRealizado: totalValue, totalReceitaBruta: 0, totalReceitaLiquida: 0, totalResultado: 0, variacao: 0 };
  }

  return { totalPrevisto: 0, totalRealizado: 0, totalReceitaBruta: 0, totalReceitaLiquida: 0, totalResultado: 0, variacao: 0 };
};

const generatePieChartData = (data: AllData, monthNames: string[], category?: string) => {
  if (category) {
    if (mainCategories.includes(category)) {
      const monthly = data[category] as MonthlyData[];
      return [
        { name: "Previsto", value: monthly.reduce((acc, d) => acc + d.previsto, 0) },
        { name: "Realizado", value: monthly.reduce((acc, d) => acc + d.realizado, 0) },
      ].filter((item) => item.value > 0);
    }
    if (revenueCategories.includes(category) || finalCategories.includes(category)) {
      const monthly = data[category] as FinalData[];
      return monthly.map((item) => ({ name: item.month, value: item.value })).filter((item) => item.value > 0);
    }
  }
  return mainCategories.map((cat) => {
    const monthly = data[cat] as MonthlyData[];
    const totalRealizado = monthly.reduce((acc, d) => acc + d.realizado, 0);
    return { name: cat, value: totalRealizado };
  }).filter((item) => item.value > 0);
};

const generateRevenuePieChartData = (data: AllData, monthNames: string[]) => {
  return revenueCategories.map((cat) => {
    const monthly = data[cat] as FinalData[];
    const totalValue = monthly.reduce((acc, d) => acc + d.value, 0);
    return { name: cat, value: totalValue };
  }).filter((item) => item.value > 0);
};

const exportToCSV = (data: MonthlyData[] | FinalData[], category: string, startMonth: string, startYear: string, endMonth: string, endYear: string) => {
  const headers = mainCategories.includes(category) ? "Mês,Previsto,Realizado,Data\n" : "Mês,Valor,Data\n";
  const rows = data.map((item) =>
    "previsto" in item
      ? `${item.month},${item.previsto.toLocaleString("pt-BR")},${item.realizado.toLocaleString("pt-BR")},${item.date}`
      : `${item.month},${item.value.toLocaleString("pt-BR")},${item.date}`
  );
  const csvContent = `data:text/csv;charset=utf-8,${headers}${rows.join("\n")}`;
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `relatorio_${category || "geral"}_${startMonth}_${startYear}-${endMonth}_${endYear}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

function Sidebar({ activeTab, onTabChange, themeColor }: SidebarProps) {
  return (
    <aside className="w-60 h-screen bg-gray-900 border-r border-gray-800 flex flex-col fixed">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">Dashboard Financeiro</h1>
        <p className="text-xs text-gray-400 mt-1">Receita Operacional Líquida</p>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <SidebarItem icon={<HomeIcon size={18} className="text-gray-400" />} label="Início" active={activeTab === "inicio"} onClick={() => onTabChange("inicio")} themeColor={themeColor} />
        <SidebarItem icon={<BarChart3 size={18} className="text-gray-400" />} label="Custos Variáveis" active={activeTab === "custos"} onClick={() => onTabChange("custos")} themeColor={themeColor} />
        <SidebarItem icon={<BarChart3 size={18} className="text-gray-400" />} label="Receita Líquida/Bruta" active={activeTab === "receita"} onClick={() => onTabChange("receita")} themeColor={themeColor} />
        <SidebarItem icon={<FileSpreadsheet size={18} className="text-gray-400" />} label="Integração Planilha" active={activeTab === "planilha"} onClick={() => onTabChange("planilha")} themeColor={themeColor} />
        <SidebarItem icon={<Settings size={18} className="text-gray-400" />} label="Configurações" active={activeTab === "configuracoes"} onClick={() => onTabChange("configuracoes")} themeColor={themeColor} />
        <SidebarItem icon={<HelpCircle size={18} className="text-gray-400" />} label="Ajuda" active={activeTab === "ajuda"} onClick={() => onTabChange("ajuda")} themeColor={themeColor} />
      </nav>
    </aside>
  );
}

function SidebarItem({ icon, label, active = false, onClick, themeColor }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={clsx("flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200", active ? `${themeColors[themeColor].bg}/20 text-${themeColor}-400 ${themeColors[themeColor].border}/30` : `text-gray-300 hover:bg-gray-800 hover:text-${themeColor}-300`)}
      aria-label={label}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function Header({ selectedCategory, onCategoryChange, startMonth, startYear, endMonth, endYear, onStartMonthChange, onStartYearChange, onEndMonthChange, onEndYearChange, onSearch, onExportPDF, onExportCSV, showFilters, themeColor, activeTab }: HeaderProps) {
  return (
    <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-white">{activeTab === "custos" ? "Custos Variáveis" : activeTab === "receita" ? "Receita Líquida/Bruta" : "Receita Operacional Líquida"}</h2>
        {showFilters && (
          <>
            <div className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-lg">
              <Filter size={14} className="text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className={clsx("bg-gray-800 text-sm text-gray-200 outline-none rounded", `focus:ring-2 focus:ring-${themeColor}-500`)}
                style={{ backgroundColor: "#1f2937", color: themeColors[themeColor].primary }}
                aria-label="Selecionar categoria"
              >
                <option value="" style={{ color: themeColors[themeColor].primary }}>Todas as Categorias</option>
                {(activeTab === "custos" ? mainCategories : revenueCategories).concat(finalCategories).map((cat) => (
                  <option key={cat} value={cat} style={{ color: themeColors[themeColor].primary }}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1 bg-gray-800 px-2 py-1 rounded-lg">
              <Calendar size={14} className="text-gray-400" />
              <select
                value={startMonth}
                onChange={(e) => onStartMonthChange(e.target.value)}
                className={clsx("text-sm text-gray-200 outline-none w-16 rounded", `focus:ring-2 focus:ring-${themeColor}-500`)}
                style={{ backgroundColor: "#1f2937", color: themeColors[themeColor].primary }}
                aria-label="Mês inicial"
              >
                {months.map((m) => (<option key={m.value} value={m.value} style={{ color: themeColors[themeColor].primary }}>{m.label}</option>))}
              </select>
              <select
                value={startYear}
                onChange={(e) => onStartYearChange(e.target.value)}
                className={clsx("text-sm text-gray-200 outline-none w-20 rounded", `focus:ring-2 focus:ring-${themeColor}-500`)}
                style={{ backgroundColor: "#1f2937", color: themeColors[themeColor].primary }}
                aria-label="Ano inicial"
              >
                {years.map((y) => (<option key={y} value={y} style={{ color: themeColors[themeColor].primary }}>{y}</option>))}
              </select>
              <span className="text-xs text-gray-400 px-1">até</span>
              <select
                value={endMonth}
                onChange={(e) => onEndMonthChange(e.target.value)}
                className={clsx("text-sm text-gray-200 outline-none w-16 rounded", `focus:ring-2 focus:ring-${themeColor}-500`)}
                style={{ backgroundColor: "#1f2937", color: themeColors[themeColor].primary }}
                aria-label="Mês final"
              >
                {months.map((m) => (<option key={m.value} value={m.value} style={{ color: themeColors[themeColor].primary }}>{m.label}</option>))}
              </select>
              <select
                value={endYear}
                onChange={(e) => onEndYearChange(e.target.value)}
                className={clsx("text-sm text-gray-200 outline-none w-20 rounded", `focus:ring-2 focus:ring-${themeColor}-500`)}
                style={{ backgroundColor: "#1f2937", color: themeColors[themeColor].primary }}
                aria-label="Ano final"
              >
                {years.map((y) => (<option key={y} value={y} style={{ color: themeColors[themeColor].primary }}>{y}</option>))}
              </select>
              <button onClick={onSearch} className={`${themeColors[themeColor].bg} hover:${themeColors[themeColor].hover} p-1 rounded text-white transition ml-1`} aria-label="Buscar dados">
                <Search size={14} />
              </button>
            </div>
          </>
        )}
      </div>
      <div className="flex items-center gap-3">
        {showFilters && (
          <>
            <button onClick={onExportCSV} className="text-sm text-gray-400 hover:text-white transition flex items-center gap-1" aria-label="Exportar como CSV">
              <Download size={16} /> Exportar CSV
            </button>
            <button onClick={onExportPDF} className="text-sm text-gray-400 hover:text-white transition flex items-center gap-1" aria-label="Exportar como PDF">
              <FileSpreadsheet size={16} /> Exportar PDF
            </button>
          </>
        )}
        <button className={`${themeColors[themeColor].bg} hover:${themeColors[themeColor].hover} px-4 py-2 rounded-lg text-sm font-medium transition`} aria-label="Atualizar dados">
          Atualizar Dados
        </button>
      </div>
    </header>
  );
}

function KPICard({ title, value, trend, icon: Icon, isPercentage = false, themeColor }: KPICardProps) {
  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 flex items-center gap-6">
      <div className={`p-6 ${themeColors[themeColor].bg}/10 rounded-lg`}>
        <Icon size={24} className={`text-${themeColor}-400`} />
      </div>
      <div className="flex-1 text-left">
        <h3 className="text-sm text-gray-400 uppercase font-medium">{title}</h3>
        <p className="text-3xl font-bold text-white mt-5">{isPercentage ? `${value.toFixed(1)}%` : `R$ ${value.toLocaleString("pt-BR")}`}</p>
        <span className={clsx("text-base font-medium mt-2", trend >= 0 ? "text-green-400" : "text-red-400")}>{trend >= 0 ? "+" : ""}{trend}%</span>
      </div>
    </div>
  );
}

function CategoryChart({ data, category, isFinal = false, isSingleMonth, themeColor, colorSet = COLOR_SETS[themeColor].default }: CategoryChartProps) {
  if (!data || data.length === 0) {
    return <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 h-[400px] flex items-center justify-center"><p className="text-gray-400">Sem dados para o período selecionado. Ajuste as datas e busque novamente.</p></div>;
  }

  return (
    <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 h-[400px]">
      <h3 className="text-lg font-bold text-white mb-2 capitalize">{category}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="month" stroke="#e5e7eb" />
          <YAxis stroke="#e5e7eb" />
          <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none", color: "#e5e7eb", borderRadius: "12px" }} formatter={(value: number, name: string) => [`R$${value.toLocaleString("pt-BR")}`, name]} />
          {!isFinal && mainCategories.includes(category) && !isSingleMonth ? (
            <>
              <Bar dataKey="previsto" name="Previsto" fill={colorSet[0]} />
              <Bar dataKey="realizado" name="Realizado" fill={colorSet[1]} />
            </>
          ) : (
            <Bar dataKey="value" name={category} fill={colorSet[0]} />
          )}
          <Legend wrapperStyle={{ paddingTop: 20 }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function CategoryDistributionChart({ data, startMonth, startYear, endMonth, endYear, themeColor }: { data: AllData; startMonth: string; startYear: string; endMonth: string; endYear: string; themeColor: ThemeColor }) {
  const monthNames = getMonthNames(startMonth, startYear, endMonth, endYear);
  const pieData = useMemo(() => generatePieChartData(data, monthNames), [data, monthNames]);
  return (
    <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 h-[550px] flex justify-center items-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={130}
            label={({ name, percent }) => `${name}: ${((percent as number) * 100).toFixed(1)}%`}
            labelLine={true}
            paddingAngle={3}
          >
            {pieData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLOR_SETS[themeColor].default[index % COLOR_SETS[themeColor].default.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none", color: "#e5e7eb", borderRadius: "12px" }} formatter={(value: number, name: string) => [`R$${value.toLocaleString("pt-BR")}`, name]} />
          <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ fontSize: 14, paddingTop: 30, lineHeight: "1.5rem" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function RevenueDistributionChart({ data, startMonth, startYear, endMonth, endYear, themeColor }: { data: AllData; startMonth: string; startYear: string; endMonth: string; endYear: string; themeColor: ThemeColor }) {
  const monthNames = getMonthNames(startMonth, startYear, endMonth, endYear);
  const pieData = useMemo(() => generateRevenuePieChartData(data, monthNames), [data, monthNames]);
  return (
    <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 h-[500px] flex justify-center items-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={130}
            label={({ name, percent }) => `${name}: ${((percent as number) * 100).toFixed(1)}%`}
            labelLine={true}
            paddingAngle={3}
          >
            {pieData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLOR_SETS[themeColor].default[index % COLOR_SETS[themeColor].default.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none", color: "#e5e7eb", borderRadius: "12px" }} formatter={(value: number, name: string) => [`R$${value.toLocaleString("pt-BR")}`, name]} />
          <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ fontSize: 14, paddingTop: 30, lineHeight: "1.5rem" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function FinalMetrics({ data, themeColor }: { data: AllData; themeColor: ThemeColor }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {finalCategories.map((cat) => {
        const dynamicKey = cat.toLowerCase().replace(/ /g, "") as ColorSetKey;
        const colorSet = COLOR_SETS[themeColor][dynamicKey] || COLOR_SETS[themeColor].default;
        return (
          <CategoryChart key={cat} data={data[cat] || []} category={cat} isFinal isSingleMonth={data[cat]?.length === 1} themeColor={themeColor} colorSet={colorSet} />
        );
      })}
    </div>
  );
}

function FinancialTab({ data, selectedCategory, setSelectedCategory, startMonth = "01", startYear = "2025", endMonth = "12", endYear = "2025", themeColor, isRevenueTab = false }: FinancialTabProps) {
  const safeStartMonth = startMonth || "01";
  const safeStartYear = startYear || "2025";
  const safeEndMonth = endMonth || "12";
  const safeEndYear = endYear || "2025";
  const totals = useMemo(() => calculateCategoryTotals(data, selectedCategory), [data, selectedCategory]);
  const isSingleMonth = safeStartMonth === safeEndMonth && safeStartYear === safeEndYear;

  return (
    <main className="flex-1 overflow-y-auto p-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard title="Previsto Total" value={totals.totalPrevisto} trend={parseFloat(categoryRanges[selectedCategory as CategoryKey]?.trend?.() || (Math.random() * 10 - 5).toFixed(1))} icon={TrendingUp} themeColor={themeColor} />
        <KPICard title={isRevenueTab ? "Receita Total" : "Realizado Total"} value={totals.totalRealizado || totals.totalReceitaBruta || totals.totalReceitaLiquida || totals.totalResultado} trend={parseFloat(categoryRanges[selectedCategory as CategoryKey]?.trend?.() || (Math.random() * 8 - 4).toFixed(1))} icon={DollarSign} themeColor={themeColor} />
        <KPICard title="Variação Geral" value={Math.abs(totals.variacao)} trend={totals.variacao} icon={TrendingUp} isPercentage themeColor={themeColor} />
      </div>
      <GeneralInfo data={data} selectedCategory={selectedCategory} />
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">Visão Geral - Comparativo Mensal ({getMonthNames(safeStartMonth, safeStartYear, safeEndMonth, safeEndYear).length} meses)</h3>
          {selectedCategory && (
            <button onClick={() => setSelectedCategory("")} className={`text-sm text-${themeColor}-400 hover:text-${themeColor}-300 transition`} aria-label="Ver todas as categorias">Ver Todas</button>
          )}
        </div>
        {isRevenueTab ? (
          <RevenueDistributionChart data={data} startMonth={safeStartMonth} startYear={safeStartYear} endMonth={safeEndMonth} endYear={safeEndYear} themeColor={themeColor} />
        ) : (
          <CategoryDistributionChart data={data} startMonth={safeStartMonth} startYear={safeStartYear} endMonth={safeEndMonth} endYear={safeEndYear} themeColor={themeColor} />
        )}
        {selectedCategory && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Detalhes da Categoria Selecionada: {selectedCategory}</h3>
            <CategoryChart data={data[selectedCategory] || []} category={selectedCategory} isFinal={finalCategories.includes(selectedCategory) || revenueCategories.includes(selectedCategory)} isSingleMonth={isSingleMonth} themeColor={themeColor} />
          </div>
        )}
      </div>
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2"><DollarSign size={24} className={`text-${themeColor}-400`} /> Métricas Finais</h3>
        <FinalMetrics data={data} themeColor={themeColor} />
      </div>
      <div className="p-6 bg-gray-800 rounded-2xl border border-gray-700 text-sm text-gray-400 text-center">Dashboard Financeiro v2.2 - Outubro 2025</div>
    </main>
  );
}

function GeneralInfo({ data, selectedCategory }: { data: AllData; selectedCategory: string }) {
  const totals = useMemo(() => calculateCategoryTotals(data, selectedCategory), [data, selectedCategory]);
  return (
    <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-6">Informações Gerais</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mainCategories.includes(selectedCategory) && (
          <>
            <div><p className="text-sm text-gray-400">Total Previsto</p><p className="text-lg font-bold text-white">R$ {totals.totalPrevisto.toLocaleString("pt-BR")}</p></div>
            <div><p className="text-sm text-gray-400">Total Realizado</p><p className="text-lg font-bold text-white">R$ {totals.totalRealizado.toLocaleString("pt-BR")}</p></div>
          </>
        )}
        {(revenueCategories.includes(selectedCategory) || selectedCategory === "Custo Fixo" || selectedCategory === "Custo Variável" || selectedCategory === "Custo Total") && (
          <div><p className="text-sm text-gray-400">Total Realizado</p><p className="text-lg font-bold text-white">R$ {totals.totalRealizado.toLocaleString("pt-BR")}</p></div>
        )}
        {selectedCategory === "Receita Operacional Bruta" && (
          <div><p className="text-sm text-gray-400">Total Receita Bruta</p><p className="text-lg font-bold text-white">R$ {totals.totalReceitaBruta.toLocaleString("pt-BR")}</p></div>
        )}
        {selectedCategory === "Receita Operacional Líquida" && (
          <div><p className="text-sm text-gray-400">Total Receita Líquida</p><p className="text-lg font-bold text-white">R$ {totals.totalReceitaLiquida.toLocaleString("pt-BR")}</p></div>
        )}
        {selectedCategory === "Resultado" && (
          <div><p className="text-sm text-gray-400">Resultado</p><p className="text-lg font-bold text-white">R$ {totals.totalResultado.toLocaleString("pt-BR")}</p></div>
        )}
        {!selectedCategory && (
          <>
            <div><p className="text-sm text-gray-400">Total Previsto</p><p className="text-lg font-bold text-white">R$ {totals.totalPrevisto.toLocaleString("pt-BR")}</p></div>
            <div><p className="text-sm text-gray-400">Total Realizado</p><p className="text-lg font-bold text-white">R$ {totals.totalRealizado.toLocaleString("pt-BR")}</p></div>
            <div><p className="text-sm text-gray-400">Total Receita Bruta</p><p className="text-lg font-bold text-white">R$ {totals.totalReceitaBruta.toLocaleString("pt-BR")}</p></div>
            <div><p className="text-sm text-gray-400">Resultado</p><p className="text-lg font-bold text-white">R$ {totals.totalResultado.toLocaleString("pt-BR")}</p></div>
          </>
        )}
      </div>
    </div>
  );
}

function InicioTab({ data, themeColor }: { data: AllData; themeColor: ThemeColor }) {
  const topCategories = useMemo(() => {
    return mainCategories.map((cat) => {
      const monthly = data[cat] as MonthlyData[];
      const totalRealizado = monthly.reduce((acc, d) => acc + d.realizado, 0);
      return { name: cat, value: totalRealizado };
    }).sort((a, b) => b.value - a.value).slice(0, 5);
  }, [data]);

  return (
    <main className="flex-1 p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Bem-vindo ao Dashboard Financeiro</h2>
        <p className="text-sm text-gray-400">Visão geral atualizada - Outubro 2025</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">Principais Categorias por Gasto</h3>
          <ResponsiveContainer width="100%" height={450}>
            <PieChart>
              <Pie data={topCategories} dataKey="value" nameKey="name" cx="50%" cy="40%" outerRadius={120} label={({ name, percent }) => `${name}: ${((percent as number) * 100).toFixed(1)}%`} labelLine={true} paddingAngle={2}>
                {topCategories.map((_, index) => (<Cell key={`cell-${index}`} fill={COLOR_SETS[themeColor].default[index % COLOR_SETS[themeColor].default.length]} />))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none", color: "#e5e7eb", borderRadius: "12px" }} formatter={(value: number, name: string) => [`R$${value.toLocaleString("pt-BR")}`, name]} />
              <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ fontSize: 14, paddingTop: 20, lineHeight: "1.5rem" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2"><DollarSign size={20} className={`text-${themeColor}-400`} /> Resumo Anual</h3>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div><p className="text-sm text-gray-400">Total Previsto</p><p className="text-lg font-bold text-white">R$ {calculateCategoryTotals(data, "").totalPrevisto.toLocaleString("pt-BR")}</p></div>
              <div><p className="text-sm text-gray-400">Total Realizado</p><p className="text-lg font-bold text-white">R$ {calculateCategoryTotals(data, "").totalRealizado.toLocaleString("pt-BR")}</p></div>
              <div><p className="text-sm text-gray-400">Total Receita Bruta</p><p className="text-lg font-bold text-white">R$ {calculateCategoryTotals(data, "").totalReceitaBruta.toLocaleString("pt-BR")}</p></div>
              <div><p className="text-sm text-gray-400">Variação</p><p className="text-lg font-bold text-white">{calculateCategoryTotals(data, "").variacao.toFixed(1)}%</p></div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2"><TrendingUp size={20} className={`text-${themeColor}-400`} /> Dicas Rápidas</h3>
            <ul className="list-disc list-inside text-gray-400 mt-4 space-y-2">
              <li>Explore a aba Custos Variáveis para filtrar por categorias e períodos.</li>
              <li>Confira a Receita Líquida/Bruta para análises detalhadas de vendas.</li>
              <li>Exporte relatórios em PDF ou CSV para análises detalhadas.</li>
            </ul>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2"><Settings size={20} className={`text-${themeColor}-400`} /> Atualizações Recentes</h3>
            <p className="text-gray-400 mt-4">Versão 2.2:</p>
          </div>
        </div>
      </div>
      <div className="p-6 bg-gray-800 rounded-2xl border border-gray-700 text-sm text-gray-400 text-center">Dashboard Financeiro v2.2 - Outubro 2025</div>
    </main>
  );
}

function PlanilhaTab() {
  return (
    <main className="flex-1 p-8 space-y-8">
      <h2 className="text-2xl font-bold text-white">Integração com Planilha</h2>
      <p className="text-gray-400">Faça upload de planilhas Excel ou CSV para integrar dados financeiros.</p>
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white">Upload de Arquivo</h3>
        <input type="file" className="mt-4 text-gray-400" accept=".csv, .xlsx" />
        <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-medium transition mt-4">Integrar Dados</button>
      </div>
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white">Histórico de Integrações</h3>
        <ul className="list-disc list-inside text-gray-400 mt-2">
          <li>Planilha Mensal - Setembro 2025 (01/10/2025)</li>
          <li>Relatório Anual - 2025</li>
        </ul>
      </div>
      <div className="p-6 bg-gray-800 rounded-2xl border border-gray-700 text-sm text-gray-400 text-center">Dashboard Financeiro v2.2 </div>
    </main>
  );
}

function ConfiguracoesTab({ themeColor, setThemeColor }: { themeColor: ThemeColor; setThemeColor: (color: ThemeColor) => void }) {
  return (
    <main className="flex-1 p-8 space-y-8">
      <h2 className="text-2xl font-bold text-white">Configurações</h2>
      <p className="text-gray-400">Personalize as configurações do dashboard.</p>
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white">Tema</h3>
        <select className="bg-gray-700 text-gray-200 p-2 rounded mt-2"><option>Escuro</option><option>Claro</option></select>
      </div>
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white">Cor Principal</h3>
        <select value={themeColor} onChange={(e) => setThemeColor(e.target.value as ThemeColor)} className="bg-gray-700 text-gray-200 p-2 rounded mt-2">
          <option value="purple">Roxo</option><option value="blue">Azul</option><option value="green">Verde</option>
        </select>
      </div>
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white">Idioma</h3>
        <select className="bg-gray-700 text-gray-200 p-2 rounded mt-2"><option>Português</option><option>Inglês</option></select>
      </div>
      <div className="p-6 bg-gray-800 rounded-2xl border border-gray-700 text-sm text-gray-400 text-center">Dashboard Financeiro v2.2 </div>
    </main>
  );
}

function AjudaTab() {
  return (
    <main className="flex-1 p-8 space-y-8">
      <h2 className="text-2xl font-bold text-white">Ajuda e Suporte</h2>
      <p className="text-gray-400">Perguntas frequentes e suporte técnico.</p>
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white">FAQ</h3>
        <p className="text-gray-400 mt-2">Q: Como filtrar por data?</p><p className="text-gray-400">A: Use os seletores de mês e ano nas abas Custos Variáveis ou Receita Líquida/Bruta.</p>
        <p className="text-gray-400 mt-2">Q: Como exportar relatórios?</p><p className="text-gray-400">A: Clique nos botões Exportar PDF ou CSV nas abas Custos Variáveis ou Receita Líquida/Bruta.</p>
      </div>
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white">Contato</h3>
        <p className="text-gray-400 mt-2">Email: suporte@.com</p><p className="text-gray-400 mt-1">Telefone: (11) 1234-5678</p>
      </div>
      <div className="p-6 bg-gray-800 rounded-2xl border border-gray-700 text-sm text-gray-400 text-center">Dashboard Financeiro v2.2 </div>
    </main>
  );
}

export default function Home() {
  const currentYear = "2025";
  const currentMonth = "10";
  const [activeTab, setActiveTab] = useState("custos");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [startMonth, setStartMonth] = useState(currentMonth);
  const [startYear, setStartYear] = useState(currentYear);
  const [endMonth, setEndMonth] = useState(currentMonth);
  const [endYear, setEndYear] = useState(currentYear);
  const [categoryData, setCategoryData] = useState<AllData>(generateAllData(startMonth, startYear, endMonth, endYear));
  const [themeColor, setThemeColor] = useState<ThemeColor>("purple");

  const handleSearch = () => {
    const startDate = new Date(parseInt(startYear), parseInt(startMonth) - 1, 1);
    const endDate = new Date(parseInt(endYear), parseInt(endMonth) - 1, 1);
    if (startDate > endDate) {
      alert("Data inicial não pode ser maior que a final!");
      return;
    }
    setCategoryData(generateAllData(startMonth, startYear, endMonth, endYear));
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(`Dashboard Financeiro - ${activeTab === "custos" ? "Custos Variáveis" : "Receita Líquida/Bruta"}`, 14, 20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Período: ${months.find((m) => m.value === startMonth)?.label} ${startYear} a ${months.find((m) => m.value === endMonth)?.label} ${endYear}`, 14, 30);

    const totals = calculateCategoryTotals(categoryData, selectedCategory);
    doc.text(`Total Previsto: R$ ${totals.totalPrevisto.toLocaleString("pt-BR")}`, 14, 40);
    doc.text(`Total Realizado: R$ ${totals.totalRealizado.toLocaleString("pt-BR")}`, 14, 45);
    doc.text(`Total Receita Bruta: R$ ${totals.totalReceitaBruta.toLocaleString("pt-BR")}`, 14, 50);
    doc.text(`Total Receita Líquida: R$ ${totals.totalReceitaLiquida.toLocaleString("pt-BR")}`, 14, 55);
    doc.text(`Resultado: R$ ${totals.totalResultado.toLocaleString("pt-BR")}`, 14, 60);

    const tableData = (activeTab === "custos" ? mainCategories : revenueCategories).map((cat) => {
      const monthly = categoryData[cat] as MonthlyData[] | FinalData[];
      if (!monthly.length) return [cat, "0", "0"];
      if (mainCategories.includes(cat)) {
        const catPrevisto = monthly.reduce((acc, d) => acc + (d as MonthlyData).previsto, 0);
        const catRealizado = monthly.reduce((acc, d) => acc + (d as MonthlyData).realizado, 0);
        return [cat, `R$ ${catPrevisto.toLocaleString("pt-BR")}`, `R$ ${catRealizado.toLocaleString("pt-BR")}`];
      }
      const catValue = monthly.reduce((acc, d) => acc + (d as FinalData).value, 0);
      return [cat, `R$ ${catValue.toLocaleString("pt-BR")}`, `R$ ${catValue.toLocaleString("pt-BR")}`];
    });

    /*
    doc.autoTable({
      startY: 70,
      head: [["Categoria", "Previsto", "Realizado"]],
      body: tableData,
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [128, 0, 128], textColor: [255, 255, 255] },
    });
    */

    doc.save(`dashboard_financeiro_${activeTab}_${startMonth}_${startYear}_a_${endMonth}_${endYear}.pdf`);
  };

  const exportCSV = () => {
    const data = selectedCategory ? categoryData[selectedCategory] : categoryData[activeTab === "custos" ? "Custo Total" : "Receita Operacional Bruta"];
    exportToCSV(data || [], selectedCategory || (activeTab === "custos" ? "Custo Total" : "Receita Operacional Bruta"), startMonth, startYear, endMonth, endYear);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "inicio": return <InicioTab data={categoryData} themeColor={themeColor} />;
      case "custos": return <FinancialTab data={categoryData} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} startMonth={startMonth} startYear={startYear} endMonth={endMonth} endYear={endYear} themeColor={themeColor} />;
      case "receita": return <FinancialTab data={categoryData} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} startMonth={startMonth} startYear={startYear} endMonth={endMonth} endYear={endYear} themeColor={themeColor} isRevenueTab />;
      case "planilha": return <PlanilhaTab />;
      case "configuracoes": return <ConfiguracoesTab themeColor={themeColor} setThemeColor={setThemeColor} />;
      case "ajuda": return <AjudaTab />;
      default: return <main className="flex-1 p-8 text-center text-gray-400 flex items-center justify-center">Conteúdo em desenvolvimento para {activeTab}...</main>;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} themeColor={themeColor} />
      <div className="flex-1 flex flex-col overflow-hidden ml-60">
        <Header
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          startMonth={startMonth}
          startYear={startYear}
          endMonth={endMonth}
          endYear={endYear}
          onStartMonthChange={setStartMonth}
          onStartYearChange={setStartYear}
          onEndMonthChange={setEndMonth}
          onEndYearChange={setEndYear}
          onSearch={handleSearch}
          onExportPDF={exportPDF}
          onExportCSV={exportCSV}
          showFilters={activeTab === "custos" || activeTab === "receita"}
          themeColor={themeColor}
          activeTab={activeTab}
        />
        {renderContent()}
      </div>
    </div>
  );
}