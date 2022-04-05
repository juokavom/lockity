import { Action } from "../actionCreators/Action";
import { WindowActionTypes } from "../actionTypes/WindowActionTypes";

export type IWindowState = {
    windowWidth: number | null,
    smallView: boolean | null
}

export const WindowReducer = (state: IWindowState = {
    windowWidth: null,
    smallView: null
}, action: Action): IWindowState => {
    switch (action.type) {
        case WindowActionTypes.SET_WINDOW_WIDTH:
            return { ...state, smallView: action.payload < 992, windowWidth: action.payload }

        default:
            return state;
    }
}