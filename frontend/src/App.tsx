import './App.css';
import { BrowserRouter } from 'react-router-dom';
import Main from './page/main/MainPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.css';

function App() {
  return (
      <BrowserRouter>
        <div>
          <ToastContainer />
          <Main />
        </div>
      </BrowserRouter>
  );
}

export default App;