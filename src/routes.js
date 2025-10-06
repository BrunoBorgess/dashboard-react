import { jsx as _jsx } from "react/jsx-runtime";
import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./pages/Home";
const AppRoutes = () => {
    return (_jsx(BrowserRouter, { children: _jsx(Routes, { children: _jsx(Route, { path: "/", element: _jsx(Home, {}) }) }) }));
};
export default AppRoutes;
