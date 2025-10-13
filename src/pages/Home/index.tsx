import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { DollarSign, TrendingUp, Settings } from "lucide-react";
import clsx from "clsx";

type ThemeColor = 'purple' | 'blue' | 'green';
type MonthlyData = { month: string; previsto: number; realizado: number; date: string };
type AllData = Record<string, MonthlyData[]>;

const themeColors = {
  purple: { primary: "#a855f7", hover: "#c084fc", bg: "bg-purple-600", border: "border-purple-500" },
  blue: { primary: "#3b82f6", hover: "#60a5fa", bg: "bg-blue-600", border: "border-blue-500" },
  green: { primary: "#10b981", hover: "#34d399", bg: "bg-green-600", border: "border-green-500" },
};

const mainCategories = [
  "Administração", "Compra de Animais", "Custos Combustíveis Gerais", "Custos Equip. Proteção Individual",
  "Inseminação", "Manutenção e Conservação", "Mão-de-Obra", "Materiais", "Nutrição", "Sanidade", "Serviços", "Tarifas"
];

const COLOR_SETS = {
  purple: {
    default: ["#a855f7", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#ec4899", "#8b5cf6", "#f97316", "#06b6d4", "#84cc16", "#d946ef", "#22c55e"],
  },
  blue: {
    default: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#a855f7", "#ec4899", "#8b5cf6", "#f97316", "#06b6d4", "#84cc16", "#d946ef", "#22c55e"],
  },
  green: {
    default: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#a855f7", "#ec4899", "#8b5cf6", "#f97316", "#06b6d4", "#84cc16", "#d946ef", "#22c55e"],
  },
};

const categoryRanges: Record<string, { min: number; max: number; variation: number }> = {
  Administração: { min: 1000, max: 5000, variation: 200 },
  "Compra de Animais": { min: 10000, max: 30000, variation: 1000 },
  "Custos Combustíveis Gerais": { min: 2000, max: 8000, variation: 300 },
  "Custos Equip. Proteção Individual": { min: 500, max: 2000, variation: 100 },
  Inseminação: { min: 3000, max: 10000, variation: 400 },
  "Manutenção e Conservação": { min: 4000, max: 12000, variation: 500 },
  "Mão-de-Obra": { min: 8000, max: 25000, variation: 800 },
  Materiais: { min: 1500, max: 6000, variation: 250 },
  Nutrição: { min: 7000, max: 20000, variation: 600 },
  Sanidade: { min: 2000, max: 7000, variation: 300 },
  Serviços: { min: 3000, max: 9000, variation: 350 },
  Tarifas: { min: 1000, max: 4000, variation: 150 },
  "Venda de Cevados": { min: 40000, max: 80000, variation: 2000 },
  "Venda de Matriz/Reprodutor": { min: 10000, max: 30000, variation: 1000 },
  "Venda de Leite": { min: 15000, max: 40000, variation: 1500 },
  Gtas: { min: 1000, max: 3000, variation: 100 },
  Fsds: { min: 500, max: 2000, variation: 80 },
  Funrural: { min: 800, max: 2500, variation: 90 },
  ICMS: { min: 2000, max: 6000, variation: 200 },
  Senar: { min: 300, max: 1000, variation: 50 },
  Fundes: { min: 400, max: 1200, variation: 60 },
  "Descontos sobre Vendas": { min: -4000, max: -1000, variation: 150 },
  "Fretes sobre Vendas": { min: -5000, max: -1500, variation: 200 },
};


const getMonthNames = () => {
  const startDate = new Date(2025, 0, 1); // Janeiro 2025
  const endDate = new Date(2025, 9, 1); // Outubro 2025
  const monthNames = [];
  let current = new Date(startDate);
  while (current <= endDate) {
    const monthName = current.toLocaleDateString("pt-BR", { month: "short" });
    monthNames.push(monthName.charAt(0).toUpperCase() + monthName.slice(1));
    current.setMonth(current.getMonth() + 1);
  }
  return monthNames;
};

const generateMonthlyData = (monthNames: string[], category: string): MonthlyData[] => {
  const range = categoryRanges[category] || { min: 5000, max: 15000, variation: 500 };
  return monthNames.map((month, index) => {
    const base = range.min + index * range.variation;
    const previsto = Math.floor(base + Math.random() * (range.max - range.min));
    return {
      month,
      previsto,
      realizado: Math.floor(previsto + (Math.random() - 0.5) * range.variation * 2),
      date: new Date(2025, index, 1).toISOString().split("T")[0],
    };
  });
};

const generateAllData = (): AllData => {
  const monthNames = getMonthNames();
  const data: AllData = {};
  mainCategories.forEach((cat) => {
    data[cat] = generateMonthlyData(monthNames, cat);
  });
  return data;
};

const calculateCategoryTotals = (data: AllData) => {
  const totalPrevisto = mainCategories.reduce((sum, cat) => {
    const monthly = data[cat] as MonthlyData[];
    return sum + (monthly ? monthly.reduce((acc, d) => acc + d.previsto, 0) : 0);
  }, 0);
  const totalRealizado = mainCategories.reduce((sum, cat) => {
    const monthly = data[cat] as MonthlyData[];
    return sum + (monthly ? monthly.reduce((acc, d) => acc + d.realizado, 0) : 0);
  }, 0);
  const variacao = totalPrevisto !== 0 ? parseFloat(((totalRealizado - totalPrevisto) / totalPrevisto * 100).toFixed(1)) : 0;
  return { totalPrevisto, totalRealizado, variacao };
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

function Home() {
  const themeColor: ThemeColor = 'purple';
  const data: AllData = useMemo(() => generateAllData(), []);
  const totals = useMemo(() => calculateCategoryTotals(data), [data]);

  const topCategories = useMemo(() => {
    return mainCategories
      .map((cat) => {
        const monthly = data[cat] as MonthlyData[];
        const totalRealizado = monthly.reduce((acc, d) => acc + d.realizado, 0);
        return { name: cat, value: Math.abs(totalRealizado) };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [data]);

  const highlights = useMemo(() => {
    const topCategory = topCategories[0]?.name || "Mão-de-Obra";
    const topCategoryValue = topCategories[0]?.value.toLocaleString("pt-BR") || "0";
    return [
      { icon: DollarSign, text: `${topCategory} lidera com R$ ${topCategoryValue} em gastos até Outubro/2025.` },
      { icon: TrendingUp, text: `Variação de ${totals.variacao >= 0 ? "+" : ""}${totals.variacao}% em relação ao previsto em 2025.` },
      { icon: Settings, text: "Acesse Custos Variáveis para análises detalhadas por categoria e período." },
    ];
  }, [topCategories, totals]);

  return (
    <main className="flex-1 p-8 space-y-8 ml-60">
      <div>
        <h2 className="text-2xl font-bold text-white">Bem-vindo ao Dashboard Financeiro</h2>
        <p className="text-gray-400 mt-2">Visualize os principais indicadores financeiros e tome decisões informadas com base nos dados de 2025.</p>
      </div>
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-400">Visão geral atualizada - Outubro 2025</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-2">Principais Categorias por Gasto</h3>
          <p className="text-base text-gray-400 mb-4">Até Outubro de 2025, as categorias com maiores gastos foram:</p>
          <ResponsiveContainer width="100%" height={450}>
            <PieChart>
              <Pie
                data={topCategories}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="40%"
                outerRadius={140}
                label={({ name, percent }) => `${name}: ${((percent as number) * 100).toFixed(1)}%`}
                labelLine={true}
                paddingAngle={3}
              >
                {topCategories.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLOR_SETS[themeColor].default[index % COLOR_SETS[themeColor].default.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#1f2937", border: "none", color: "#e5e7eb", borderRadius: "12px" }}
                formatter={(value: number, name: string) => [`R$ ${value.toLocaleString("pt-BR")} até Outubro/2025`, name]}
              />
              <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ fontSize: 14, paddingTop: 20, lineHeight: "1.5rem" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <DollarSign size={20} className={`text-${themeColor}-400`} /> Resumo de 2025
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <KPICard
                title="Total Previsto"
                value={totals.totalPrevisto}
                trend={Math.random() * 10 - 5}
                icon={DollarSign}
                themeColor={themeColor}
              />
              <KPICard
                title="Total Realizado"
                value={totals.totalRealizado}
                trend={Math.random() * 10 - 5}
                icon={DollarSign}
                themeColor={themeColor}
              />
              <KPICard
                title="Variação Geral"
                value={Math.abs(totals.variacao)}
                trend={totals.variacao}
                icon={TrendingUp}
                isPercentage
                themeColor={themeColor}
              />
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <TrendingUp size={20} className={`text-${themeColor}-400`} /> Destaques
            </h3>
            <ul className="list-none text-gray-400 mt-4 space-y-2">
              {highlights.map((highlight, index) => (
                <li key={index} className="flex items-center gap-2">
                  <highlight.icon size={16} className={`text-${themeColor}-400`} />
                  <span>{highlight.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Settings size={20} className={`text-${themeColor}-400`} /> Atualizações Recentes
            </h3>
            <p className="text-gray-400 mt-4">Versão 2.2: Destaques das principais categorias de gastos e relatórios otimizados para 2025.</p>
          </div>
        </div>
      </div>
      <div className="p-6 bg-gray-800 rounded-2xl border border-gray-700 text-sm text-gray-400 text-center">
        Dashboard Financeiro v2.2 
      </div>
    </main>
  );
}

export default Home;