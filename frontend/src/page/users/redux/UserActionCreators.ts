import { Action } from "../../../redux/Action";
import { IUserData } from "../model/UsersModel";
import { UserActionTypes } from "./UserActionTypes";

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
