import { createStore, applyMiddleware, Store, combineReducers } from "redux"
import { Provider, TypedUseSelectorHook, useSelector } from "react-redux"
import thunk from "redux-thunk"
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { Action } from './redux/ActionCreators';
import { FileReducer, IFileState } from "./redux/reducers/FileReducer"

export const useTypedSelector: TypedUseSelectorHook<MasterState> = useSelector;

const reducers = combineReducers({
  fileReducer: FileReducer
})

export type MasterState = ReturnType<typeof reducers>

const store: Store<MasterState, Action> & {
  dispatch: MasterState
} = createStore(
  reducers,
  applyMiddleware(thunk)
  )

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
