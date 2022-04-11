import { Action } from "../../../redux/Action"
import { IReceivedMetadata } from "../model/ReceivedModels"
import { ReceivedActionTypes } from "./ReceivedActionTypes"

export type IReceivedState = {
    pageSelected: number,
    receivedMetadatas: IReceivedMetadata[] | null,
    receivedMetadataCount: number | null,
    fetched: boolean
}

export const ReceivedReducer = (state: IReceivedState = {
    pageSelected: 1,
    receivedMetadatas: null,
    receivedMetadataCount: null,
    fetched: false
}, action: Action): IReceivedState => {
    switch (action.type) {
        case ReceivedActionTypes.SET_RECEIVED_SELECTED:
            return { ...state, pageSelected: action.payload }

        case ReceivedActionTypes.SET_RECEIVED_METADATA:
            return { ...state, fetched: true, receivedMetadatas: action.payload }

        case ReceivedActionTypes.SET_RECEIVED_METADATA_COUNT:
            return { ...state, receivedMetadataCount: action.payload }

        default:
            return state;
    }
}