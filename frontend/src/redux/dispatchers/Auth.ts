import { Action } from '../ConfigureStore';
import * as ActionTypes from '../ActionTypes';
import { User } from '../../models/User';

export type AuthSate = {
    user: User.FrontendUser | null
}

export const Auth = (state: AuthSate = {
    user: null
}, action: Action) => {
    switch (action.type) {
        case ActionTypes.LOGIN:
            return { ...state, user: action.payload }
        case ActionTypes.LOGOUT:
            return { ...state, user: null }
        default:
            return state;
    }
}
