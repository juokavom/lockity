import { Action } from "../../../redux/Action";
import { IAPIData } from "../model/APIModel";
import { APIActionTypes } from "./APIActionTypes";

export type IAPIState = {
    pageSelected: number,
    apiDatas: IAPIData[] | null,
    apiCount: number | null,
    fetched: boolean
}

export const APIReducer = (state: IAPIState = {
    pageSelected: 1,
    apiDatas: null,
    apiCount: null,
    fetched: false
}, action: Action): IAPIState => {
    switch (action.type) {
        case APIActionTypes.SET_API_SELECTED:
            return { ...state, pageSelected: action.payload }

        case APIActionTypes.SET_API_DATA:
            return { ...state, fetched: true, apiDatas: action.payload }

        case APIActionTypes.SET_API_COUNT:
            return { ...state, apiCount: action.payload }

        default:
            return state;
    }
}