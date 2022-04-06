import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.scss';
import Main from './page/main/MainPage';

function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Main />
    </BrowserRouter>
  );
}

export default App;