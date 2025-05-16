import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App            from "./App.jsx";          
import OptionPricing  from "./pages/OptionPricing.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/"        element={<App />} />
      <Route path="/options" element={<OptionPricing />} />
    </Routes>
  </BrowserRouter>
);
