import { IUserData } from "../../page/UsersPage";
import { UserActionTypes } from "../actionTypes/UserActionTypes";
import { Action } from "./Action";

export namespace UserActionCreators {
    export const setUserSelected = (pageSelected: number): Action => ({
        type: UserActionTypes.SET_USER_SELECTED,
        payload: pageSelected
    })
    
    export const setUserData = (userData: IUserData[] | null): Action => ({
        type: UserActionTypes.SET_USER_DATA,
        payload: userData
    })
    
    export const setUserCount = (userCount: number | null): Action => ({
        type: UserActionTypes.SET_USER_COUNT,
        payload: userCount
    })
}
