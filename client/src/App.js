import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WeddingProject } from "./pages/WeddingProject";
import { Index } from "./pages/index";
import { Player } from './pages/Player';
import { Error } from './pages/Error';
import './App.css';

function App() {
  return (
    <Router>
        <Routes>
            <Route path="/player/:project/:video_to_play" exact element={ <Player/> }/>
            <Route path="/player/:project/:video_to_play/:playList" exact element={ <Player/> }/>
            <Route path="/:projectName" element={ <WeddingProject/> }/>
            <Route path="/" exact element={ <Index/> }/>
            <Route path="/:proj" exact element={ <Index/> }/>
        </Routes>
    </Router>
  );
}

export default App;