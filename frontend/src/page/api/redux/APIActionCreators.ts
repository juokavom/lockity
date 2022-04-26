import { Action } from "../../../redux/Action";
import { IAPIData } from "../model/APIModel";
import { APIActionTypes } from "./APIActionTypes";

export namespace ApiActionCreators {
    export const setAPISelected = (pageSelected: number): Action => ({
        type: APIActionTypes.SET_API_SELECTED,
        payload: pageSelected
    })

    export const setAPIData = (apiData: IAPIData[] | null): Action => ({
        type: APIActionTypes.SET_API_DATA,
        payload: apiData
    })

    export const setAPICount = (apiCount: number | null): Action => ({
        type: APIActionTypes.SET_API_COUNT,
        payload: apiCount
    })
}
