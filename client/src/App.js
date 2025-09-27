import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SendLink from './components/SendLink';
import Locate from './components/Locate';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Budstech SMS Location Sharing</h1>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<SendLink />} />
          <Route path="/locate/:sessionId" element={<Locate />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;