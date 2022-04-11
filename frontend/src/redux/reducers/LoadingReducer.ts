import { Action } from "../Action";
import { LoadingActionTypes } from "../actionTypes/LoadingActionTypes";

export type ILoadingState = {
    loading: boolean
}

export const LoadingReducer = (state: ILoadingState = {
    loading: false
}, action: Action): ILoadingState => {
    switch (action.type) {    
        case LoadingActionTypes.SET_LOADING:
            return { ...state, loading: true }
    
        case LoadingActionTypes.SET_NOT_LOADING:            
            return { ...state, loading: false }

        default:
            return state;
    }
}