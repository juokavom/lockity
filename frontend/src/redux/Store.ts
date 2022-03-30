import { TypedUseSelectorHook, useSelector } from "react-redux";
import { applyMiddleware, combineReducers, createStore, Store } from "redux";
import thunk from "redux-thunk";
import { Action } from "./actionCreators/Action";
import { FileReducer } from "./reducers/FileReducer";
import { ReceivedReducer } from "./reducers/ReceivedReducer";
import { SharedReducer } from "./reducers/SharedReducer";

export const useTypedSelector: TypedUseSelectorHook<MasterState> = useSelector;

const reducers = combineReducers({
  fileReducer: FileReducer,
  sharedReducer: SharedReducer,
  receivedReducer: ReceivedReducer
})

export type MasterState = ReturnType<typeof reducers>

export const ReduxStore: Store<MasterState, Action> & {
  dispatch: MasterState
} = createStore(
  reducers,
  applyMiddleware(thunk)
  )
