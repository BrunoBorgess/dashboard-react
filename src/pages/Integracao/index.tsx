import React, { useState } from 'react';
import * as XLSX from 'xlsx';

type ThemeColor = 'purple' | 'blue' | 'green';

const themeColors = {
  purple: { primary: "#a855f7", hover: "#c084fc", bg: "bg-purple-600", border: "border-purple-500" },
  blue: { primary: "#3b82f6", hover: "#60a5fa", bg: "bg-blue-600", border: "border-blue-500" },
  green: { primary: "#10b981", hover: "#34d399", bg: "bg-green-600", border: "border-green-500" },
};

function Integracao() {
  const [themeColor] = useState<ThemeColor>('purple');
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [history, setHistory] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleIntegrate = () => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result as string;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      setParsedData(data as any[]);
      setHistory((prev) => [...prev, `${file.name} - Integrado em ${new Date().toLocaleString()}`]);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <main className="flex-1 p-8 space-y-8 ml-60">
      <h2 className="text-2xl font-bold text-white">Integração com Planilha</h2>
      <p className="text-gray-400">Faça upload de planilhas Excel ou CSV para integrar dados financeiros.</p>
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white">Upload de Arquivo</h3>
        <input
          type="file"
          className="mt-4 text-gray-400"
          accept=".csv, .xls, .xlsx"
          onChange={handleFileChange}
        />
        <button
          onClick={handleIntegrate}
          className={`${themeColors[themeColor].bg} hover:${themeColors[themeColor].hover} px-4 py-2 rounded-lg text-sm font-medium transition mt-4`}
        >
          Integrar Dados
        </button>
      </div>
      {parsedData.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white">Dados Integrados</h3>
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  {parsedData[0].map((header: string, index: number) => (
                    <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {parsedData.slice(1).map((row: any[], rowIndex: number) => (
                  <tr key={rowIndex}>
                    {row.map((cell: any, cellIndex: number) => (
                      <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white">Histórico de Integrações</h3>
        <ul className="list-disc list-inside text-gray-400 mt-2">
          {history.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
      <div className="p-6 bg-gray-800 rounded-2xl border border-gray-700 text-sm text-gray-400 text-center">Dashboard Financeiro v2.2 </div>
    </main>
  );
}

export default Integracao;