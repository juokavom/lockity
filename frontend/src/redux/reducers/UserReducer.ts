import { IUserData } from "../../page/UsersPage";
import { Action } from "../actionCreators/Action";
import { UserActionTypes } from "../actionTypes/UserActionTypes";

export type IUserState = {
    pageSelected: number,
    userDatas: IUserData[] | null,
    userCount: number | null
}

export const UserReducer = (state: IUserState = {
    pageSelected: 1,
    userDatas: null,
    userCount: null
}, action: Action): IUserState => {
    switch (action.type) {
        case UserActionTypes.SET_USER_SELECTED:
            return { ...state, pageSelected: action.payload }

        case UserActionTypes.SET_USER_DATA:
            return { ...state, userDatas: action.payload }
    
        case UserActionTypes.SET_USER_COUNT:
            return { ...state, userCount: action.payload }

        default:
            return state;
    }
}