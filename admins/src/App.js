import React from "react";
import Main from "./pages/Main";
import Login from "./pages/Login";
import { BrowserRouter, Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<Login/>} />
        <Route path="/" element={<Login/>} />
        <Route path="/main" element={<Main/>} />
      </Routes>
    </BrowserRouter>
  );
}