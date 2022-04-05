import { GlobalActionTypes } from "../actionTypes/GlobalActionTypes";
import { Action } from "./Action";

export namespace GlobalActionCreators {
    export const setWindowWidth = (windowWidth: number): Action => ({
        type: GlobalActionTypes.SET_WINDOW_WIDTH,
        payload: windowWidth
    })
}