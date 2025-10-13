import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Sidebarr from "./components/Sidebar";
import CustosVariaveis from "./pages/CustosVariaveis";
import ReceitaLiquida from "./pages/ReceitaLiquida";
import Integracao from "./pages/Integracao";


const AppRoutes = () => {
  return (
    
    <BrowserRouter>
          <Sidebarr></Sidebarr>
          <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/CustosVariaveis" element={<CustosVariaveis/>} />
            <Route path="/ReceitaLiquida" element={<ReceitaLiquida/>} />
            <Route path="/Integracao" element={<Integracao/>}/>
          </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;