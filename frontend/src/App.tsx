import './App.css';
import { BrowserRouter } from 'react-router-dom';
import Main from './components/MainComponent';
import { Provider } from 'react-redux';
import { ConfigureStore } from './redux/ConfigureStore';

function App() {
  return (
    <Provider store={ConfigureStore()}>
      <BrowserRouter>
        <div>
          <Main />
        </div>
      </BrowserRouter>
    </Provider>
  );
}

export default App;