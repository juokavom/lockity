import { Action } from "../../../redux/Action";
import { IReceivedMetadata } from "../model/ReceivedModels";
import { ReceivedActionTypes } from "./ReceivedActionTypes";

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
