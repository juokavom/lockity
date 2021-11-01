import { combineReducers, createStore, applyMiddleware } from 'redux';
import { Auth } from './dispatchers/Auth';
import thunk from 'redux-thunk';

export type Action = {
    type: string,
    payload: string
}

export const ConfigureStore = () => {
    return createStore(
        combineReducers({
            auth: Auth
        }),        
        applyMiddleware(thunk)
    );
}