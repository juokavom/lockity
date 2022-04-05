import { User } from "../../model/User";
import { LocalUserActionTypes } from "../actionTypes/LocalUserActionTypes";
import { Action } from "./Action";

export namespace LocalUserActionCreators {    
    export const setUser = (user: User.FrontendUser): Action => ({
        type: LocalUserActionTypes.SET_USER,
        payload: user
    })
}