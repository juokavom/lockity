import './App.scss';
import { BrowserRouter } from 'react-router-dom';
import Main from './page/main/MainPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import { TailSpin } from 'react-loader-spinner';

function App() {
  return (
    <BrowserRouter>
      <div>
        <ToastContainer />
        <TailSpin
          height="100"
          width="100"
          color='grey'
          ariaLabel='loading'
        />
        <Main />
      </div>
    </BrowserRouter>
  );
}

export default App;