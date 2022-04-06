import { LoadingActionTypes } from "../actionTypes/LoadingActionTypes";
import { Action } from "./Action";

export namespace LoadingActionCreators {
    export const setLoading = (): Action => ({
        type: LoadingActionTypes.SET_LOADING,
        payload: null
    })
    
    export const setNotLoading = (): Action => ({
        type: LoadingActionTypes.SET_NOT_LOADING,
        payload: null
    })
}