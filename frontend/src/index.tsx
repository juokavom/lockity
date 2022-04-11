import ReactDOM from 'react-dom';
import { Provider } from "react-redux";
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import './index.scss';
import Main from './page/main/Main';
import { ReduxStore } from './redux/Store';

ReactDOM.render(
  <Provider store={ReduxStore}>
    <BrowserRouter>
      <ToastContainer />
      <Main />
    </BrowserRouter>
  </Provider>,
  document.getElementById('root')
);
