import { Action } from "../Action";
import { WindowActionTypes } from "../actionTypes/WindowActionTypes";

export type IWindowState = {
    windowWidth: number | null,
    smallView: boolean | null
}

const isSmallView = (width: number) => width < 992

export const WindowReducer = (state: IWindowState = {
    windowWidth: window.innerWidth,
    smallView: isSmallView(window.innerWidth)
}, action: Action): IWindowState => {
    switch (action.type) {
        case WindowActionTypes.SET_WINDOW_WIDTH:
            return { ...state, smallView: isSmallView(action.payload), windowWidth: action.payload }

        default:
            return state;
    }
}