import { IReceivedMetadata } from "../../page/ReceivedPage";
import { ReceivedActionTypes } from "../actionTypes/ReceivedActionTypes";
import { Action } from "./Action";

export namespace ReceivedActionCreators {
    export const setReceivedSelected = (pageSelected: number): Action => ({
        type: ReceivedActionTypes.SET_RECEIVED_SELECTED,
        payload: pageSelected
    })
    
    export const setReceivedMetadata = (receivedMetadata: IReceivedMetadata[] | null): Action => ({
        type: ReceivedActionTypes.SET_RECEIVED_METADATA,
        payload: receivedMetadata
    })
    
    export const setReceivedMetadataCount = (receivedMetadataCount: number | null): Action => ({
        type: ReceivedActionTypes.SET_RECEIVED_METADATA_COUNT,
        payload: receivedMetadataCount
    })
}
