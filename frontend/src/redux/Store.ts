import { TypedUseSelectorHook, useSelector } from "react-redux";
import { applyMiddleware, combineReducers, createStore, Store } from "redux";
import thunk from "redux-thunk";
import { Action } from "./actionCreators/Action";
import { FileReducer } from "./reducers/FileReducer";
import { GlobalReducer } from "./reducers/GlobalReducer";
import { ReceivedReducer } from "./reducers/ReceivedReducer";
import { SharedReducer } from "./reducers/SharedReducer";
import { UserReducer } from "./reducers/UserReducer";

export const useTypedSelector: TypedUseSelectorHook<MasterState> = useSelector;

const reducers = combineReducers({
  fileReducer: FileReducer,
  sharedReducer: SharedReducer,
  receivedReducer: ReceivedReducer,
  userReducer: UserReducer,
  globalReducer: GlobalReducer
})

export type MasterState = ReturnType<typeof reducers>

export const ReduxStore: Store<MasterState, Action> & {
  dispatch: MasterState
} = createStore(
  reducers,
  applyMiddleware(thunk)
  )
