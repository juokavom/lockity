import { Dispatch } from 'react';
import { LOADING_TIMEOUT_MS } from '../../../model/Constants';
import { RequestBuilder } from '../../../model/RequestBuilder';
import { ENDPOINTS } from '../../../model/Server';
import { Action } from '../../../redux/Action';
import { LoadingActionCreators } from '../../../redux/actionCreators/LoadingActionCreators';
import { IUserData } from '../model/UsersModel';
import { UserActionCreators } from '../redux/UserActionCreators';

export const fetchUserData = (offset: number, limit: number, selected: number) => async (dispatch: Dispatch<Action>) => {
    dispatch(LoadingActionCreators.setLoading())
    await new RequestBuilder()
        .withUrl(ENDPOINTS.USER.getUserDataWithOffsetAndLimit(offset, limit))
        .withMethod('GET')
        .withDefaults()
        .send((response: any) => {
            dispatch(UserActionCreators.setUserSelected(selected))
            if (response) {
                const userData: IUserData[] = response
                dispatch(UserActionCreators.setUserData(userData))
                setTimeout(() => {
                    dispatch(LoadingActionCreators.setNotLoading())
                }, LOADING_TIMEOUT_MS)
            } else {
                dispatch(UserActionCreators.setUserData(null))
                dispatch(LoadingActionCreators.setNotLoading())
            }
        }, () => {
            dispatch(UserActionCreators.setUserData(null))
            dispatch(LoadingActionCreators.setNotLoading())
        }
        )
}


export const fetchUserCount = () => async (dispatch: Dispatch<Action>) => {
    await new RequestBuilder()
        .withUrl(ENDPOINTS.USER.getUserCount)
        .withMethod('GET')
        .withDefaults()
        .send((response: any) => {
            if (response) {
                const userCount: { userCount: number } = response
                dispatch(UserActionCreators.setUserCount(userCount.userCount))
            } else {
                dispatch(UserActionCreators.setUserCount(null))
            }
        }, () => dispatch(UserActionCreators.setUserCount(null)))
}
