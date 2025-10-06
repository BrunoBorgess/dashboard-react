import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, } from "recharts";
import { BarChart3, Home as HomeIcon, Settings, FileSpreadsheet, TrendingUp, DollarSign, Filter, } from "lucide-react";
import clsx from "clsx";
// Função para gerar dados mensais aleatórios (12 meses)
const generateMonthlyData = () => {
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return months.map((month) => ({
        month,
        previsto: Math.floor(Math.random() * 15000) + 2000,
        realizado: Math.floor(Math.random() * 15000) + 1000,
    }));
};
// Categorias principais
const mainCategories = [
    "Administração",
    "Compra de Animais",
    "Custos Combustíveis Gerais",
    "Custos Equip. Proteção Individual",
    "Inseminação",
    "Manutenção e Conservação",
    "Mão-de-Obra",
    "Materiais",
    "Nutrição",
    "Sanidade",
    "Serviços",
    "Tarifas",
];
// Categorias finais
const finalCategories = ["Custo Fixo", "Custo Total", "Resultado"];
// Gerar dados para todas as categorias
const generateAllData = () => {
    const data = {};
    mainCategories.forEach((cat) => {
        data[cat] = generateMonthlyData();
    });
    finalCategories.forEach((cat) => {
        const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        data[cat] = months.map((month, index) => ({
            month,
            value: Math.floor(Math.random() * 8000) + (index * 300),
        }));
    });
    return data;
};
// Calcular totais anuais de exemplo
const calculateTotals = (categoryData) => {
    const totalPrevisto = mainCategories.reduce((sum, cat) => {
        return sum + categoryData[cat].reduce((acc, d) => acc + d.previsto, 0);
    }, 0);
    const totalRealizado = mainCategories.reduce((sum, cat) => {
        return sum + categoryData[cat].reduce((acc, d) => acc + d.realizado, 0);
    }, 0);
    const variacao = ((totalRealizado - totalPrevisto) / totalPrevisto * 100).toFixed(1);
    return { totalPrevisto, totalRealizado, variacao: parseFloat(variacao) };
};
function Sidebar({ activeTab, onTabChange }) {
    return (_jsxs("aside", { className: "w-60 h-fixed bg-gray-900 border-r border-gray-800 flex flex-col", children: [_jsxs("div", { className: "p-6 border-b border-gray-800", children: [_jsx("h1", { className: "text-xl font-bold text-white", children: "Dashboard Financeiro" }), _jsx("p", { className: "text-xs text-gray-400 mt-1", children: "Receita Operacional L\u00EDquida" })] }), _jsxs("nav", { className: "flex-1 p-4 space-y-2", children: [_jsx(SidebarItem, { icon: _jsx(HomeIcon, { size: 18, className: "text-gray-400" }), label: "In\u00EDcio", active: activeTab === "inicio", onClick: () => onTabChange("inicio") }), _jsx(SidebarItem, { icon: _jsx(BarChart3, { size: 18, className: "text-gray-400" }), label: "Receita Operacional", active: activeTab === "receita", onClick: () => onTabChange("receita") }), _jsx(SidebarItem, { icon: _jsx(FileSpreadsheet, { size: 18, className: "text-gray-400" }), label: "Integra\u00E7\u00E3o Planilha", onClick: () => onTabChange("planilha") })] })] }));
}
function SidebarItem({ icon, label, active, onClick }) {
    return (_jsxs("button", { onClick: onClick, className: clsx("flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200", active
            ? "bg-purple-600/20 text-purple-400 border border-purple-500/30"
            : "text-gray-300 hover:bg-gray-800 hover:text-purple-300"), children: [icon, _jsx("span", { children: label })] }));
}
function Header({ selectedCategory, onCategoryChange }) {
    return (_jsxs("header", { className: "h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("h2", { className: "text-lg font-semibold text-white", children: "Receita Operacional L\u00EDquida" }), _jsxs("div", { className: "flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-lg", children: [_jsx(Filter, { size: 14, className: "text-gray-400" }), _jsxs("select", { value: selectedCategory, onChange: (e) => onCategoryChange(e.target.value), className: "bg-transparent text-sm text-gray-200 outline-none", children: [_jsx("option", { value: "", children: "Todas as Categorias" }), mainCategories.map((cat) => (_jsx("option", { value: cat, children: cat }, cat)))] })] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { className: "text-sm text-gray-400 hover:text-white transition", children: "Exportar PDF" }), _jsx("button", { className: "bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-medium transition", children: "Atualizar Dados" })] })] }));
}
function KPICard({ title, value, trend, icon: Icon }) {
    return (_jsxs("div", { className: "bg-gray-800 rounded-xl p-6 border border-gray-700 flex items-center gap-6", children: [_jsx("div", { className: "p-6 bg-purple-600/10 rounded-lg", children: _jsx(Icon, { size: 24, className: "text-purple-400" }) }), _jsxs("div", { className: "flex-1 text-left", children: [_jsx("h3", { className: "text-sm text-gray-400 uppercase font-medium", children: title }), _jsxs("p", { className: "text-3xl font-bold text-white mt-5", children: ["R$ ", value.toLocaleString()] }), _jsxs("span", { className: clsx("text-base font-medium mt-2", trend >= 0 ? "text-green-400" : "text-red-400"), children: [trend >= 0 ? "+" : "", trend, "%"] })] })] }));
}
function CategoryChart({ data, category, isFinal = false }) {
    return (_jsxs("div", { className: "bg-gray-800 rounded-2xl p-8 border border-gray-700 h-[500px]", children: [_jsx("h3", { className: "text-xl font-bold text-white mb-6 capitalize", children: category }), _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: isFinal ? (_jsxs(LineChart, { data: data, margin: { top: 10, right: 30, left: 0, bottom: 5 }, children: [_jsx(Line, { type: "monotone", dataKey: "value", stroke: "#f59e0b", strokeWidth: 3, dot: { r: 5, fill: "#f59e0b" } }), _jsx(XAxis, { dataKey: "month", stroke: "#6b7280", fontSize: 14 }), _jsx(YAxis, { stroke: "#6b7280", fontSize: 16 }), _jsx(Tooltip, { contentStyle: {
                                backgroundColor: "#1f2937",
                                border: "none",
                                color: "#e5e7eb",
                                borderRadius: "12px",
                            } })] })) : (_jsxs(BarChart, { data: data, margin: { top: 10, right: 30, left: 0, bottom: 5 }, children: [_jsx(Bar, { dataKey: "previsto", fill: "#a855f7", name: "Previsto", radius: [6, 6, 0, 0] }), _jsx(Bar, { dataKey: "realizado", fill: "#10b981", name: "Realizado", radius: [6, 6, 0, 0] }), _jsx(XAxis, { dataKey: "month", stroke: "#6b7280", fontSize: 14 }), _jsx(YAxis, { stroke: "#6b7280", fontSize: 14 }), _jsx(Tooltip, { contentStyle: {
                                backgroundColor: "#1f2937",
                                border: "none",
                                color: "#e5e7eb",
                                borderRadius: "12px",
                            } })] })) })] }));
}
function FinalMetrics({ data }) {
    return (_jsx("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: finalCategories.map((cat) => (_jsx(CategoryChart, { data: data[cat], category: cat, isFinal: true }, cat))) }));
}
// Componente de fallback para erro
function ErrorBoundary({ children }) {
    return _jsx(_Fragment, { children: children });
}
export default function Home() {
    const [activeTab, setActiveTab] = useState("receita");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [categoryData] = useState(generateAllData());
    const totals = calculateTotals(categoryData);
    console.log("Dashboard carregando... Dados gerados:", categoryData); // Debug no console
    if (activeTab !== "receita") {
        return (_jsxs("div", { className: "flex min-h-screen bg-gray-950", children: [_jsx(Sidebar, { activeTab: activeTab, onTabChange: setActiveTab }), _jsxs("div", { className: "flex-1 flex flex-col bg-gray-950", children: [_jsx(Header, { selectedCategory: selectedCategory, onCategoryChange: setSelectedCategory }), _jsxs("main", { className: "flex-1 p-8 text-center text-gray-400 flex items-center justify-center", children: ["Conte\u00FAdo em desenvolvimento para ", activeTab, "..."] })] })] }));
    }
    return (_jsx(ErrorBoundary, { children: _jsxs("div", { className: "flex min-h-screen bg-gray-950", children: [_jsx(Sidebar, { activeTab: activeTab, onTabChange: setActiveTab }), _jsxs("div", { className: "flex-1 flex flex-col overflow-hidden", children: [_jsx(Header, { selectedCategory: selectedCategory, onCategoryChange: setSelectedCategory }), _jsxs("main", { className: "flex-1 overflow-y-auto p-8 space-y-8", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsx(KPICard, { title: "Previsto Total", value: totals.totalPrevisto, trend: 5.2, icon: TrendingUp }), _jsx(KPICard, { title: "Realizado Total", value: totals.totalRealizado, trend: 3.8, icon: DollarSign }), _jsx(KPICard, { title: "Varia\u00E7\u00E3o Geral", value: Math.abs(totals.variacao * 1000), trend: totals.variacao, icon: TrendingUp })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("h3", { className: "text-xl font-bold text-white", children: [selectedCategory || "Visão Geral", " - Comparativo Mensal"] }), selectedCategory && (_jsx("button", { onClick: () => setSelectedCategory(""), className: "text-sm text-purple-400 hover:text-purple-300 transition", children: "Ver Todas" }))] }), selectedCategory ? (_jsx(CategoryChart, { data: categoryData[selectedCategory], category: selectedCategory })) : (_jsx("div", { className: "h-[500px] flex items-center justify-center text-gray-400 bg-gray-900 rounded-2xl p-8", children: _jsxs("div", { className: "text-center", children: [_jsx(BarChart3, { size: 64, className: "mx-auto mb-6 text-purple-400" }), _jsx("p", { className: "text-lg", children: "Selecione uma categoria no filtro acima para visualizar o gr\u00E1fico detalhado." }), _jsx("p", { className: "text-sm mt-2", children: "Ou role para baixo para ver as m\u00E9tricas finais." })] }) }))] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("h3", { className: "text-xl font-bold text-white flex items-center gap-2", children: [_jsx(DollarSign, { size: 24, className: "text-purple-400" }), "M\u00E9tricas Finais"] }), _jsx(FinalMetrics, { data: categoryData })] }), _jsx("div", { className: "p-6 bg-gray-800 rounded-2xl border border-gray-700 text-sm text-gray-400 text-center", children: "TESTE INICIAL" })] })] })] }) }));
}
