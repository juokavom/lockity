import { TypedUseSelectorHook, useSelector } from "react-redux";
import { applyMiddleware, combineReducers, createStore, Store } from "redux";
import thunk from "redux-thunk";
import { FileReducer } from "../page/files/redux/FileReducer";
import { ReceivedReducer } from "../page/received/redux/ReceivedReducer";
import { SharedReducer } from "../page/shared/redux/SharedReducer";
import { UserReducer } from "../page/users/redux/UserReducer";
import { Action } from "./Action";
import { LoadingReducer } from "./reducers/LoadingReducer";
import { LocalUserReducer } from "./reducers/LocalUserReducer";
import { WindowReducer } from "./reducers/WindowReducer";

export const useTypedSelector: TypedUseSelectorHook<MasterState> = useSelector;

const reducers = combineReducers({
  fileReducer: FileReducer,
  sharedReducer: SharedReducer,
  receivedReducer: ReceivedReducer,
  userReducer: UserReducer,
  localUserReducer: LocalUserReducer,
  windowReducer: WindowReducer,
  loadingReducer: LoadingReducer
})

export type MasterState = ReturnType<typeof reducers>

export const ReduxStore: Store<MasterState, Action> & {
  dispatch: MasterState
} = createStore(
  reducers,
  applyMiddleware(thunk)
  )
