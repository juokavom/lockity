import { RequestBuilder } from '../models/RequestBuilder';
import { ENDPOINTS } from '../models/Server';
import * as ActionTypes from './ActionTypes';

export const LoginAction = (email: string, password: string) => async (dispatch: any) => {
    const loginRequest = new RequestBuilder()
        .withUrl(ENDPOINTS.AUTH.login)
        .withMethod('POST')
        .withDefaultHeadersAndCredentials()
        .withBody({
            email: email,
            password: password
        })
        .build()

    if (loginRequest) {
        dispatch({
            type: ActionTypes.LOGIN,
            payload: await (await loginRequest).json()
        });
    }
};