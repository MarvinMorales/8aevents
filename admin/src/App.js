import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Login } from "./pages/Login";
import { Dashboard } from './pages/Dashboard';
import { UploadZip } from './pages/UploadZip';
import { ModalCreateProject } from './pages/ModalCreateProject';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" exact element={ <Login/> }/>
        <Route path="/dashboard" exact element={ <Dashboard/> }/>
        <Route path="/modal" exact element={ <UploadZip/> }/>
      </Routes>
    </Router>
  );
}

export default App;