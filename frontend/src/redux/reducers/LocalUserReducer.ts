import { User } from "../../model/User";
import { Action } from "../Action";
import { LocalUserActionTypes } from "../actionTypes/LocalUserActionTypes";

export type ILocalUserState = {
    user: User.FrontendUser | null,
    isAuthed: boolean,
    isAdmin: boolean
}

const localStorageUser = localStorage.getItem(User.storagename)
const user: User.FrontendUser | null = localStorageUser ? JSON.parse(localStorageUser) : null

export const LocalUserReducer = (state: ILocalUserState = {
    user: user,
    isAuthed: user != null ? User.isAuthed(user.role) : false,
    isAdmin: user != null ? User.isAdmin(user.role) : false
}, action: Action): ILocalUserState => {
    switch (action.type) {
        case LocalUserActionTypes.SET_USER:
            const user: User.FrontendUser | null = action.payload
            if (user) {
                const isAdmin = user != null ? User.isAdmin(user.role) : false
                const isAuthed = user != null ? User.isAuthed(user.role) : false
                localStorage.setItem(User.storagename, JSON.stringify(user))
                return {
                    ...state,
                    user: user,
                    isAuthed: isAuthed,
                    isAdmin: isAdmin,
                }
            } else {                
                return {
                    ...state,
                    user: null,
                    isAuthed: false,
                    isAdmin: false,
                }
            }

        default:
            return state;
    }
}