import React, { useState, useMemo } from 'react';
import { AreaChart, Area, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis } from "recharts";
import { DollarSign, Filter, Calendar, Search } from "lucide-react";
import clsx from "clsx";

type ThemeColor = 'purple' | 'blue' | 'green';
type MonthlyData = { month: string; previsto: number; realizado: number; date: string };
type FinalData = { month: string; value: number; date: string };
type AllData = Record<string, MonthlyData[] | FinalData[]>;

const themeColors = {
  purple: { primary: "#a855f7", hover: "#c084fc", bg: "bg-purple-600", border: "border-purple-500" },
  blue: { primary: "#3b82f6", hover: "#60a5fa", bg: "bg-blue-600", border: "border-blue-500" },
  green: { primary: "#10b981", hover: "#34d399", bg: "bg-green-600", border: "border-green-500" },
};

const revenueCategories = [
  "Venda de Cevados", "Venda de Matriz/Reprodutor", "Venda de Leite", "Gtas", "Fsds", "Funrural",
  "ICMS", "Senar", "Fundes", "Descontos sobre Vendas", "Fretes sobre Vendas"
];
const finalCategories = ["Receita Operacional Bruta", "Receita Operacional Líquida", "Resultado"];

const months = [
  { value: "01", label: "Jan" }, { value: "02", label: "Fev" }, { value: "03", label: "Mar" }, { value: "04", label: "Abr" },
  { value: "05", label: "Mai" }, { value: "06", label: "Jun" }, { value: "07", label: "Jul" }, { value: "08", label: "Ago" },
  { value: "09", label: "Set" }, { value: "10", label: "Out" }, { value: "11", label: "Nov" }, { value: "12", label: "Dez" },
];

const years = Array.from({ length: 10 }, (_, i) => (2025 - i).toString());

const COLOR_SETS = {
  purple: {
    default: ["#a855f7", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#ec4899", "#8b5cf6", "#f97316", "#06b6d4", "#84cc16", "#d946ef", "#22c55e"],
    receitaOperacionalBruta: ["#10b981", "#34d399"], receitaOperacionalLiquida: ["#10b981", "#34d399"], resultado: ["#3b82f6", "#60a5fa"],
  },
  blue: {
    default: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#a855f7", "#ec4899", "#8b5cf6", "#f97316", "#06b6d4", "#84cc16", "#d946ef", "#22c55e"],
    receitaOperacionalBruta: ["#10b981", "#34d399"], receitaOperacionalLiquida: ["#10b981", "#34d399"], resultado: ["#1e3a8a", "#3b82f6"],
  },
  green: {
    default: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#a855f7", "#ec4899", "#8b5cf6", "#f97316", "#06b6d4", "#84cc16", "#d946ef", "#22c55e"],
    receitaOperacionalBruta: ["#10b981", "#34d399"], receitaOperacionalLiquida: ["#10b981", "#34d399"], resultado: ["#065f46", "#10b981"],
  },
};

const getColorSetForCategory = (category: string, themeColor: ThemeColor) => {
  const key = category.toLowerCase().replace(/ /g, "");
  return (COLOR_SETS[themeColor][key as keyof typeof COLOR_SETS.purple] || COLOR_SETS[themeColor].default);
};

const categoryRanges: Record<string, { min: number; max: number; variation: number; trend: () => string }> = {
  "Venda de Cevados": { min: 40000, max: 80000, variation: 2000, trend: () => (Math.random() * 10 - 5).toFixed(1) },
  "Venda de Matriz/Reprodutor": { min: 10000, max: 30000, variation: 1000, trend: () => (Math.random() * 8 - 4).toFixed(1) },
  "Venda de Leite": { min: 15000, max: 40000, variation: 1500, trend: () => (Math.random() * 9 - 4.5).toFixed(1) },
  Gtas: { min: 1000, max: 3000, variation: 100, trend: () => (Math.random() * 5 - 2.5).toFixed(1) },
  Fsds: { min: 500, max: 2000, variation: 80, trend: () => (Math.random() * 5 - 2.5).toFixed(1) },
  Funrural: { min: 800, max: 2500, variation: 90, trend: () => (Math.random() * 5 - 2.5).toFixed(1) },
  ICMS: { min: 2000, max: 6000, variation: 200, trend: () => (Math.random() * 6 - 3).toFixed(1) },
  Senar: { min: 300, max: 1000, variation: 50, trend: () => (Math.random() * 4 - 2).toFixed(1) },
  Fundes: { min: 400, max: 1200, variation: 60, trend: () => (Math.random() * 4 - 2).toFixed(1) },
  "Descontos sobre Vendas": { min: -4000, max: -1000, variation: 150, trend: () => (Math.random() * 5 - 2.5).toFixed(1) },
  "Fretes sobre Vendas": { min: -5000, max: -1500, variation: 200, trend: () => (Math.random() * 6 - 3).toFixed(1) },
  "Receita Operacional Bruta": { min: 0, max: 0, variation: 0, trend: () => (Math.random() * 10 - 5).toFixed(1) },
  "Receita Operacional Líquida": { min: 0, max: 0, variation: 0, trend: () => (Math.random() * 10 - 5).toFixed(1) },
  Resultado: { min: 0, max: 0, variation: 0, trend: () => (Math.random() * 10 - 5).toFixed(1) },
};


const getMonthNames = (startMonth: string, startYear: string, endMonth: string, endYear: string) => {
  const startDate = new Date(parseInt(startYear), parseInt(startMonth) - 1, 1);
  const endDate = new Date(parseInt(endYear), parseInt(endMonth) - 1, 1);
  if (startDate > endDate) return [];
  const monthNames: string[] = [];
  let current = new Date(startDate);
  while (current <= endDate) {
    const monthName = current.toLocaleDateString("pt-BR", { month: "short" });
    monthNames.push(monthName.charAt(0).toUpperCase() + monthName.slice(1));
    current.setMonth(current.getMonth() + 1);
  }
  return monthNames;
};

const generateMonthlyData = (monthNames: string[], startYear: string, category: string): MonthlyData[] => {
  const range = categoryRanges[category] || { min: 5000, max: 15000, variation: 500 };
  return monthNames.map((month, index) => {
    const base = range.min + index * range.variation;
    const previsto = Math.floor(base + Math.random() * (range.max - range.min));
    return {
      month,
      previsto,
      realizado: Math.floor(previsto + (Math.random() - 0.5) * range.variation * 2),
      date: new Date(parseInt(startYear), index, 1).toISOString().split("T")[0],
    };
  });
};

const generateAllData = (startMonth: string, startYear: string, endMonth: string, endYear: string): AllData => {
  const monthNames = getMonthNames(startMonth, startYear, endMonth, endYear);
  const data: AllData = {};
  revenueCategories.forEach((cat) => {
    data[cat] = generateMonthlyData(monthNames, startYear, cat);
  });
  data["Receita Operacional Bruta"] = monthNames.map((month, idx) => ({
    month,
    value: revenueCategories
      .filter(c => !["Descontos sobre Vendas", "Fretes sobre Vendas"].includes(c))
      .reduce((acc, cat) => acc + (data[cat] as MonthlyData[])[idx]?.realizado || 0, 0),
    date: new Date(parseInt(startYear), idx, 1).toISOString().split("T")[0],
  }));
  data["Receita Operacional Líquida"] = monthNames.map((month, idx) => ({
    month,
    value: revenueCategories.reduce((acc, cat) => acc + (data[cat] as MonthlyData[])[idx]?.realizado || 0, 0),
    date: new Date(parseInt(startYear), idx, 1).toISOString().split("T")[0],
  }));
  data["Resultado"] = monthNames.map((month, idx) => ({
    month,
    value: (data["Receita Operacional Líquida"] as FinalData[])[idx]?.value || 0,
    date: new Date(parseInt(startYear), idx, 1).toISOString().split("T")[0],
  }));
  return data;
};

const calculateCategoryTotals = (data: AllData, category: string) => {
  if (!category) {
    const totalPrevisto = revenueCategories.reduce((sum, cat) => sum + (data[cat] as MonthlyData[])?.reduce((acc, d) => acc + d.previsto, 0) || 0, 0);
    const totalRealizado = revenueCategories.reduce((sum, cat) => sum + (data[cat] as MonthlyData[])?.reduce((acc, d) => acc + d.realizado, 0) || 0, 0);
    const variacao = totalPrevisto ? parseFloat(((totalRealizado - totalPrevisto) / totalPrevisto * 100).toFixed(1)) : 0;
    return { totalPrevisto, totalRealizado, variacao };
  }
  if (revenueCategories.includes(category)) {
    const monthly = data[category] as MonthlyData[];
    const totalPrevisto = monthly?.reduce((acc, d) => acc + d.previsto, 0) || 0;
    const totalRealizado = monthly?.reduce((acc, d) => acc + d.realizado, 0) || 0;
    const variacao = totalPrevisto ? parseFloat(((totalRealizado - totalPrevisto) / totalPrevisto * 100).toFixed(1)) : 0;
    return { totalPrevisto, totalRealizado, variacao };
  }
  const monthly = data[category] as FinalData[];
  const totalValue = monthly?.reduce((acc, d) => acc + d.value, 0) || 0;
  return { totalPrevisto: 0, totalRealizado: totalValue, variacao: 0 };
};

const generatePieChartData = (data: AllData, monthNames: string[], category?: string) => {
  if (category) {
    if (revenueCategories.includes(category)) {
      const monthly = data[category] as MonthlyData[];
      return [
        { name: "Previsto", value: Math.abs(monthly?.reduce((acc, d) => acc + d.previsto, 0) || 0) },
        { name: "Realizado", value: Math.abs(monthly?.reduce((acc, d) => acc + d.realizado, 0) || 0) },
      ];
    }
    const monthly = data[category] as FinalData[];
    return monthly?.map((item) => ({ name: item.month, value: Math.abs(item.value) })) || [];
  }
  return revenueCategories
    .map((cat) => {
      const monthly = data[cat] as MonthlyData[];
      const totalRealizado = monthly?.reduce((acc, d) => acc + d.realizado, 0) || 0;
      return { name: cat, value: Math.abs(totalRealizado) };
    })
    .sort((a, b) => b.value - a.value);
};

interface KPICardProps { title: string; value: number; trend: number; icon: React.ElementType; isPercentage?: boolean; themeColor: ThemeColor; }
const KPICard = ({ title, value, trend, icon: Icon, isPercentage = false, themeColor }: KPICardProps) => (
  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 flex items-center gap-4">
    <div className={`p-4 ${themeColors[themeColor].bg}/10 rounded-lg`}>
      <Icon size={20} className={`text-${themeColor}-400`} />
    </div>
    <div className="flex-1">
      <h3 className="text-sm text-gray-400 uppercase font-medium">{title}</h3>
      <p className="text-2xl font-bold text-white mt-2">{isPercentage ? `${value.toFixed(1)}%` : `R$ ${value.toLocaleString("pt-BR")}`}</p>
      <span className={clsx("text-sm font-medium", trend >= 0 ? "text-green-400" : "text-red-400")}>{trend >= 0 ? "+" : ""}{trend.toFixed(1)}%</span>
    </div>
  </div>
);

interface CategoryChartProps { data: MonthlyData[] | FinalData[]; category: string; isFinal?: boolean; isSingleMonth: boolean; themeColor: ThemeColor; colorSet: string[]; }
const CategoryChart = ({ data, category, isFinal = false, isSingleMonth, themeColor, colorSet }: CategoryChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 h-[400px] flex items-center justify-center">
        <p className="text-gray-400">Sem dados para a categoria ou período selecionado.</p>
      </div>
    );
  }
  return (
    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 h-[400px]">
      <h4 className="text-lg font-bold text-white mb-4 capitalize">Detalhes {category}</h4>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <XAxis dataKey="month" stroke="#e5e7eb" />
          <YAxis stroke="#e5e7eb" domain={['auto', 'auto']} />
          <Tooltip
            contentStyle={{ backgroundColor: "#1f2937", border: "none", color: "#e5e7eb", borderRadius: "12px" }}
            formatter={(value: number, name: string) => [
              `${value >= 0 ? 'R$' : '-R$'} ${Math.abs(value).toLocaleString("pt-BR")}`,
              name + (["Descontos sobre Vendas", "Fretes sobre Vendas"].includes(category) ? " (dedução)" : "")
            ]}
          />
          {!isFinal && revenueCategories.includes(category) && !isSingleMonth ? (
            <>
              <Area type="monotone" dataKey="previsto" name="Previsto" fill={colorSet[0]} stroke={colorSet[0]} fillOpacity={0.3} />
              <Area type="monotone" dataKey="realizado" name="Realizado" fill={colorSet[1]} stroke={colorSet[1]} fillOpacity={0.3} />
            </>
          ) : (
            <Area type="monotone" dataKey="value" name={category} fill={colorSet[0]} stroke={colorSet[0]} fillOpacity={0.3} />
          )}
          <Legend wrapperStyle={{ paddingTop: 20 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

function ReceitaLiquida() {
  const [themeColor] = useState<ThemeColor>('purple');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [startMonth, setStartMonth] = useState('01');
  const [startYear, setStartYear] = useState('2025');
  const [endMonth, setEndMonth] = useState('10');
  const [endYear, setEndYear] = useState('2025');
  const [error, setError] = useState<string | null>(null);

  const monthNames = useMemo(() => getMonthNames(startMonth, startYear, endMonth, endYear), [startMonth, startYear, endMonth, endYear]);
  const data = useMemo(() => generateAllData(startMonth, startYear, endMonth, endYear), [startMonth, startYear, endMonth, endYear]);
  const totals = useMemo(() => calculateCategoryTotals(data, selectedCategory), [data, selectedCategory]);
  const isSingleMonth = startMonth === endMonth && startYear === endYear;
  const pieData = useMemo(() => generatePieChartData(data, monthNames, selectedCategory), [data, monthNames, selectedCategory]);

  const handleSearch = () => {
    const startDate = new Date(parseInt(startYear), parseInt(startMonth) - 1, 1);
    const endDate = new Date(parseInt(endYear), parseInt(endMonth) - 1, 1);
    if (startDate > endDate) {
      setError("A data inicial deve ser anterior ou igual à data final.");
    } else {
      setError(null);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto p-8 space-y-6 ml-60">
      <h2 className="text-2xl font-bold text-white mb-4">Receita Líquida/Bruta</h2>
      <p className="text-gray-400 mb-6">Visualize e analise as receitas líquidas com filtros de categoria e período.</p>

      {/* Filtros */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 space-y-4">
        <h3 className="text-lg font-semibold text-white">Filtros de Dados</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg border border-gray-700">
            <Filter size={14} className="text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={clsx("bg-transparent text-sm text-gray-200 outline-none w-full", `focus:ring-2 focus:ring-${themeColor}-500`)}
              style={{ color: themeColors[themeColor].primary }}
              aria-label="Selecionar categoria"
            >
              <option value="" style={{ color: themeColors[themeColor].primary }}>Todas as Categorias</option>
              {[...revenueCategories, ...finalCategories].map((cat) => (
                <option key={cat} value={cat} style={{ color: themeColors[themeColor].primary }}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg border border-gray-700">
            <Calendar size={14} className="text-gray-400" />
            <select
              value={startMonth}
              onChange={(e) => setStartMonth(e.target.value)}
              className={clsx("bg-transparent text-sm text-gray-200 outline-none w-20", `focus:ring-2 focus:ring-${themeColor}-500`)}
              style={{ color: themeColors[themeColor].primary }}
              aria-label="Mês inicial"
            >
              {months.map((m) => (<option key={m.value} value={m.value} style={{ color: themeColors[themeColor].primary }}>{m.label}</option>))}
            </select>
            <select
              value={startYear}
              onChange={(e) => setStartYear(e.target.value)}
              className={clsx("bg-transparent text-sm text-gray-200 outline-none w-20", `focus:ring-2 focus:ring-${themeColor}-500`)}
              style={{ color: themeColors[themeColor].primary }}
              aria-label="Ano inicial"
            >
              {years.map((y) => (<option key={y} value={y} style={{ color: themeColors[themeColor].primary }}>{y}</option>))}
            </select>
            <span className="text-xs text-gray-400 px-2">até</span>
            <select
              value={endMonth}
              onChange={(e) => setEndMonth(e.target.value)}
              className={clsx("bg-transparent text-sm text-gray-200 outline-none w-20", `focus:ring-2 focus:ring-${themeColor}-500`)}
              style={{ color: themeColors[themeColor].primary }}
              aria-label="Mês final"
            >
              {months.map((m) => (<option key={m.value} value={m.value} style={{ color: themeColors[themeColor].primary }}>{m.label}</option>))}
            </select>
            <select
              value={endYear}
              onChange={(e) => setEndYear(e.target.value)}
              className={clsx("bg-transparent text-sm text-gray-200 outline-none w-20", `focus:ring-2 focus:ring-${themeColor}-500`)}
              style={{ color: themeColors[themeColor].primary }}
              aria-label="Ano final"
            >
              {years.map((y) => (<option key={y} value={y} style={{ color: themeColors[themeColor].primary }}>{y}</option>))}
            </select>
          </div>
        </div>
        <button
          onClick={handleSearch}
          className={`${themeColors[themeColor].bg} hover:${themeColors[themeColor].hover} px-4 py-2 rounded-lg text-sm font-medium transition w-full md:w-auto`}
          aria-label="Aplicar filtros"
        >
          Aplicar Filtros
        </button>
      </div>

      {/* Erro */}
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 rounded-lg p-4 text-center">
          {error}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          title="Receita Bruta"
          value={data["Receita Operacional Bruta"]?.reduce((acc, d) => acc + (d as FinalData).value, 0) || 0}
          trend={parseFloat(categoryRanges["Receita Operacional Bruta"].trend())}
          icon={DollarSign}
          themeColor={themeColor}
        />
        <KPICard
          title="Receita Líquida"
          value={data["Receita Operacional Líquida"]?.reduce((acc, d) => acc + (d as FinalData).value, 0) || 0}
          trend={parseFloat(categoryRanges["Receita Operacional Líquida"].trend())}
          icon={DollarSign}
          themeColor={themeColor}
        />
        <KPICard
          title="Resultado"
          value={data["Resultado"]?.reduce((acc, d) => acc + (d as FinalData).value, 0) || 0}
          trend={parseFloat(categoryRanges["Resultado"].trend())}
          icon={DollarSign}
          themeColor={themeColor}
        />
      </div>

      {/* Visão Geral */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <DollarSign size={24} className={`text-${themeColor}-400`} />
          Visão Geral das Receitas
          {selectedCategory && (
            <span className={`text-base font-medium text-${themeColor}-400`}> - {selectedCategory}</span>
          )}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <h4 className="text-lg font-bold text-white mb-4">Distribuição por Categoria</h4>
            <ResponsiveContainer width="100%" height={300}>
              {selectedCategory ? (
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name}: ${((percent as number) * 100).toFixed(1)}%`}
                    labelLine={true}
                    paddingAngle={5}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLOR_SETS[themeColor].default[index % COLOR_SETS[themeColor].default.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1f2937", border: "none", color: "#e5e7eb", borderRadius: "12px" }}
                    formatter={(value: number, name: string) => [
                      `${value >= 0 ? 'R$' : '-R$'} ${Math.abs(value).toLocaleString("pt-BR")}`,
                      name + (["Descontos sobre Vendas", "Fretes sobre Vendas"].includes(name) ? " (dedução)" : "")
                    ]}
                  />
                  <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: 12, paddingLeft: 20 }} />
                </PieChart>
              ) : (
                <BarChart data={pieData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <XAxis type="number" stroke="#e5e7eb" domain={['auto', 'auto']} />
                  <YAxis dataKey="name" type="category" stroke="#e5e7eb" width={120} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1f2937", border: "none", color: "#e5e7eb", borderRadius: "12px" }}
                    formatter={(value: number, name: string) => [
                      `${value >= 0 ? 'R$' : '-R$'} ${Math.abs(value).toLocaleString("pt-BR")}`,
                      name + (["Descontos sobre Vendas", "Fretes sobre Vendas"].includes(name) ? " (dedução)" : "")
                    ]}
                  />
                  <Bar dataKey="value" name="Realizado">
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLOR_SETS[themeColor].default[index % COLOR_SETS[themeColor].default.length]} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <h4 className="text-lg font-bold text-white mb-4">Detalhes {selectedCategory || 'Gerais'}</h4>
            {selectedCategory ? (
              <CategoryChart
                data={data[selectedCategory] || []}
                category={selectedCategory}
                isFinal={finalCategories.includes(selectedCategory)}
                isSingleMonth={isSingleMonth}
                themeColor={themeColor}
                colorSet={getColorSetForCategory(selectedCategory, themeColor)}
              />
            ) : (
              <div className="h-[400px] flex items-center justify-center">
                <p className="text-gray-400">Selecione uma categoria para visualizar os detalhes.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 bg-gray-800 rounded-2xl border border-gray-700 text-sm text-gray-400 text-center">
        Dashboard Financeiro v2.2 
      </div>
    </main>
  );
}

export default ReceitaLiquida;