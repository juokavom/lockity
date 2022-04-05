import { Action } from "../actionCreators/Action";
import { GlobalActionTypes } from "../actionTypes/GlobalActionTypes";

export type IGlobalState = {
    windowWidth: number | null,
    smallView: boolean | null
}

export const GlobalReducer = (state: IGlobalState = {
    windowWidth: null,
    smallView: null
}, action: Action): IGlobalState => {
    switch (action.type) {
        case GlobalActionTypes.SET_WINDOW_WIDTH:
            return { ...state, smallView: action.payload < 992, windowWidth: action.payload }

        default:
            return state;
    }
}