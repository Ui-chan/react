import React from 'react';
import './App.css';
import { Link } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        {/* 경로를 public 폴더 기준으로 수정 */}
        <img src="/assets/zerodose_logo.svg" className="App-logo" alt="logo" />
        <p>
          ZeroDose_ASD Manager
        </p>
        <Link to="/homechild"
          className="App-link"
        >
          Learn a Digital Therapy Game
        </Link>
      </header>
    </div>
  );
}

export default App;
