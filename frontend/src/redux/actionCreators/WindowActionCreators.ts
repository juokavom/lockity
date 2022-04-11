import { WindowActionTypes } from "../actionTypes/WindowActionTypes";
import { Action } from "../Action";

export namespace WindowActionCreators {    
    export const setWindowWidth = (windowWidth: number): Action => ({
        type: WindowActionTypes.SET_WINDOW_WIDTH,
        payload: windowWidth
    })
}