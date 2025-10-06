import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  BarChart3,
  Home as HomeIcon,
  Settings,
  FileSpreadsheet,
  TrendingUp,
  DollarSign,
  Filter,
} from "lucide-react";
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
  return (
    <aside className="w-60 h-fixed bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">Dashboard Financeiro</h1>
        <p className="text-xs text-gray-400 mt-1">Receita Operacional Líquida</p>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <SidebarItem
          icon={<HomeIcon size={18} className="text-gray-400" />}
          label="Início"
          active={activeTab === "inicio"}
          onClick={() => onTabChange("inicio")}
        />
        <SidebarItem
          icon={<BarChart3 size={18} className="text-gray-400" />}
          label="Receita Operacional"
          active={activeTab === "receita"}
          onClick={() => onTabChange("receita")}
        />
        <SidebarItem
          icon={<FileSpreadsheet size={18} className="text-gray-400" />}
          label="Integração Planilha"
          onClick={() => onTabChange("planilha")}
        />

      </nav>
    </aside>
  );
}

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
        active
          ? "bg-purple-600/20 text-purple-400 border border-purple-500/30"
          : "text-gray-300 hover:bg-gray-800 hover:text-purple-300"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function Header({ selectedCategory, onCategoryChange }) {
  return (
    <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-white">Receita Operacional Líquida</h2>
        <div className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-lg">
          <Filter size={14} className="text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="bg-transparent text-sm text-gray-200 outline-none"
          >
            <option value="">Todas as Categorias</option>
            {mainCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="text-sm text-gray-400 hover:text-white transition">Exportar PDF</button>
        <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-medium transition">
          Atualizar Dados
        </button>
      </div>
    </header>
  );
}

function KPICard({ title, value, trend, icon: Icon }) {
  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 flex items-center gap-6">
      <div className="p-6 bg-purple-600/10 rounded-lg">
        <Icon size={24} className="text-purple-400" />
      </div>
      <div className="flex-1 text-left">
        <h3 className="text-sm text-gray-400 uppercase font-medium">{title}</h3>
        <p className="text-3xl font-bold text-white mt-5">R$ {value.toLocaleString()}</p>
        <span
          className={clsx(
            "text-base font-medium mt-2",
            trend >= 0 ? "text-green-400" : "text-red-400"
          )}
        >
          {trend >= 0 ? "+" : ""}{trend}%
        </span>
      </div>
    </div>
  );
}

function CategoryChart({ data, category, isFinal = false }) {
  return (
    <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 h-[500px]">
      <h3 className="text-xl font-bold text-white mb-6 capitalize">{category}</h3>
      <ResponsiveContainer width="100%" height="100%">
        {isFinal ? (
          <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
            <Line
              type="monotone"
              dataKey="value"
              stroke="#f59e0b"
              strokeWidth={3}
              dot={{ r: 5, fill: "#f59e0b" }}
            />
            <XAxis dataKey="month" stroke="#6b7280" fontSize={14} />
            <YAxis stroke="#6b7280" fontSize={16} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "none",
                color: "#e5e7eb",
                borderRadius: "12px",
              }}
            />
          </LineChart>
        ) : (
          <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
            <Bar dataKey="previsto" fill="#a855f7" name="Previsto" radius={[6, 6, 0, 0]} />
            <Bar dataKey="realizado" fill="#10b981" name="Realizado" radius={[6, 6, 0, 0]} />
            <XAxis dataKey="month" stroke="#6b7280" fontSize={14} />
            <YAxis stroke="#6b7280" fontSize={14} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "none",
                color: "#e5e7eb",
                borderRadius: "12px",
              }}
            />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

function FinalMetrics({ data }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {finalCategories.map((cat) => (
        <CategoryChart key={cat} data={data[cat]} category={cat} isFinal />
      ))}
    </div>
  );
}

// Componente de fallback para erro
function ErrorBoundary({ children }) {
  return <>{children}</>;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("receita");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categoryData] = useState(generateAllData());
  const totals = calculateTotals(categoryData);

  console.log("Dashboard carregando... Dados gerados:", categoryData); // Debug no console

  if (activeTab !== "receita") {
    return (
      <div className="flex min-h-screen bg-gray-950">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 flex flex-col bg-gray-950">
          <Header selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
          <main className="flex-1 p-8 text-center text-gray-400 flex items-center justify-center">
            Conteúdo em desenvolvimento para {activeTab}...
          </main>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen bg-gray-950">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />

          <main className="flex-1 overflow-y-auto p-8 space-y-8">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <KPICard
                title="Previsto Total"
                value={totals.totalPrevisto}
                trend={5.2}
                icon={TrendingUp}
              />
              <KPICard
                title="Realizado Total"
                value={totals.totalRealizado}
                trend={3.8}
                icon={DollarSign}
              />
              <KPICard
                title="Variação Geral"
                value={Math.abs(totals.variacao * 1000)}
                trend={totals.variacao}
                icon={TrendingUp}
              />
            </div>

            {/* Gráfico Principal */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">
                  {selectedCategory || "Visão Geral"} - Comparativo Mensal
                </h3>
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory("")}
                    className="text-sm text-purple-400 hover:text-purple-300 transition"
                  >
                    Ver Todas
                  </button>
                )}
              </div>
              {selectedCategory ? (
                <CategoryChart
                  data={categoryData[selectedCategory]}
                  category={selectedCategory}
                />
              ) : (
                <div className="h-[500px] flex items-center justify-center text-gray-400 bg-gray-900 rounded-2xl p-8">
                  <div className="text-center">
                    <BarChart3 size={64} className="mx-auto mb-6 text-purple-400" />
                    <p className="text-lg">Selecione uma categoria no filtro acima para visualizar o gráfico detalhado.</p>
                    <p className="text-sm mt-2">Ou role para baixo para ver as métricas finais.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Métricas Finais */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <DollarSign size={24} className="text-purple-400" />
                Métricas Finais
              </h3>
              <FinalMetrics data={categoryData} />
            </div>

            {/* Nota */}
            <div className="p-6 bg-gray-800 rounded-2xl border border-gray-700 text-sm text-gray-400 text-center">
              TESTE INICIAL
            </div>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}