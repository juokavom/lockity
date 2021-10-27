import React from 'react';
import './App.css';
import { BrowserRouter } from 'react-router-dom';
import Main from './components/MainComponent';
import { CookiesProvider } from 'react-cookie';


function App() {
  return (
    <CookiesProvider>
      <BrowserRouter>
        <div>
          <Main />
        </div>
      </BrowserRouter>
    </CookiesProvider>
  );
}

export default App;