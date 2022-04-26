import { Dispatch } from 'react';
import { LOADING_TIMEOUT_MS } from '../../../model/Constants';
import { RequestBuilder } from '../../../model/RequestBuilder';
import { ENDPOINTS } from '../../../model/Server';
import { Action } from '../../../redux/Action';
import { LoadingActionCreators } from '../../../redux/actionCreators/LoadingActionCreators';
import { IAPIData } from '../model/APIModel';
import { ApiActionCreators } from '../redux/APIActionCreators';

export const fetchAPIData = (offset: number, limit: number, selected: number) => async (dispatch: Dispatch<Action>) => {
    dispatch(LoadingActionCreators.setLoading())
    await new RequestBuilder()
        .withUrl(ENDPOINTS.API.getAPIDataWithOffsetAndLimit(offset, limit))
        .withMethod('GET')
        .withDefaults()
        .send((response: any) => {
            dispatch(ApiActionCreators.setAPISelected(selected))
            if (response) {
                const apiData: IAPIData[] = response
                dispatch(ApiActionCreators.setAPIData(apiData))
                setTimeout(() => {
                    dispatch(LoadingActionCreators.setNotLoading())
                }, LOADING_TIMEOUT_MS)
            } else {
                dispatch(ApiActionCreators.setAPIData(null))
                dispatch(LoadingActionCreators.setNotLoading())
            }
        }, () => {
            dispatch(ApiActionCreators.setAPIData(null))
            dispatch(LoadingActionCreators.setNotLoading())
        }
        )
}

export const fetchAPICount = () => async (dispatch: Dispatch<Action>) => {
    await new RequestBuilder()
        .withUrl(ENDPOINTS.API.getAPICount)
        .withMethod('GET')
        .withDefaults()
        .send((response: any) => {
            if (response) {
                const apiCount: { apiCount: number } = response
                dispatch(ApiActionCreators.setAPICount(apiCount.apiCount))
            } else {
                dispatch(ApiActionCreators.setAPICount(null))
            }
        }, () => dispatch(ApiActionCreators.setAPICount(null)))
}
