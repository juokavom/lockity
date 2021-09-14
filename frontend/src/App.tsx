import React from 'react';
import './App.css';
import { SERVER } from './constants';

function App() {
  return (
    <div className="App">
      <h1>lima</h1>
      <h1>{SERVER.URL}</h1>
    </div>
  );
}

export default App;
