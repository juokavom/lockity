import { IReceivedMetadata } from "../../page/ReceivedPage";
import { Action } from "../actionCreators/Action";
import { ReceivedActionTypes } from "../actionTypes/ReceivedActionTypes";

export type IReceivedState = {
    pageSelected: number,
    receivedMetadatas: IReceivedMetadata[] | null,
    receivedMetadataCount: number | null
}

export const ReceivedReducer = (state: IReceivedState = {
    pageSelected: 1,
    receivedMetadatas: null,
    receivedMetadataCount: null
}, action: Action): IReceivedState => {
    switch (action.type) {
        case ReceivedActionTypes.SET_RECEIVED_SELECTED:
            return { ...state, pageSelected: action.payload }

        case ReceivedActionTypes.SET_RECEIVED_METADATA:
            return { ...state, receivedMetadatas: action.payload }
    
        case ReceivedActionTypes.SET_RECEIVED_METADATA_COUNT:
            return { ...state, receivedMetadataCount: action.payload }

        default:
            return state;
    }
}