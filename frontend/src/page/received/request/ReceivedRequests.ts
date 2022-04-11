import { Dispatch } from 'react';
import { LOADING_TIMEOUT_MS } from '../../../model/Constants';
import { RequestBuilder } from '../../../model/RequestBuilder';
import { ENDPOINTS } from '../../../model/Server';
import { Action } from '../../../redux/Action';
import { LoadingActionCreators } from '../../../redux/actionCreators/LoadingActionCreators';
import { IReceivedMetadata } from '../model/ReceivedModels';
import { ReceivedActionCreators } from '../redux/ReceivedActionCreators';

export const fetchReceivedMetadata = (offset: number, limit: number, selected: number) => async (dispatch: Dispatch<Action>) => {
    dispatch(LoadingActionCreators.setLoading())
    await new RequestBuilder()
        .withUrl(ENDPOINTS.FILE.getReceivedMetadataWithOffsetAndLimit(offset, limit))
        .withMethod('GET')
        .withDefaults()
        .send((response: any) => {
            dispatch(ReceivedActionCreators.setReceivedSelected(selected))
            if (response) {
                const receivedMetadata: IReceivedMetadata[] = response
                dispatch(ReceivedActionCreators.setReceivedMetadata(receivedMetadata))
                setTimeout(() => {
                    dispatch(LoadingActionCreators.setNotLoading())
                }, LOADING_TIMEOUT_MS)
            } else {
                dispatch(ReceivedActionCreators.setReceivedMetadata(null))
                dispatch(LoadingActionCreators.setNotLoading())
            }
        }, () => {
            dispatch(ReceivedActionCreators.setReceivedMetadata(null))
            dispatch(LoadingActionCreators.setNotLoading())
        }
        )
}

export const fetchReceivedMetadataCount = () => async (dispatch: Dispatch<Action>) => {
    await new RequestBuilder()
        .withUrl(ENDPOINTS.FILE.getReceivedMetadataCount)
        .withMethod('GET')
        .withDefaults()
        .send((response: any) => {
            if (response) {
                const receivedCount: { receivedCount: number } = response
                dispatch(ReceivedActionCreators.setReceivedMetadataCount(receivedCount.receivedCount))
            } else {
                dispatch(ReceivedActionCreators.setReceivedMetadataCount(null))
            }
        }, () => dispatch(ReceivedActionCreators.setReceivedMetadataCount(null)))
}