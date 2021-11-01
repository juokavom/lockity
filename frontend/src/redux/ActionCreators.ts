import { ENDPOINTS } from '../models/Server';
import * as ActionTypes from './ActionTypes';

export const LoginAction = (email: string, password: string) => async (dispatch: any) => {
    const loggedUserResponse = await fetch(ENDPOINTS.AUTH.login, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
            email: email,
            password: password
        })
    })
    dispatch({
        type: ActionTypes.LOGIN,
        payload: await loggedUserResponse.json()
    });
};