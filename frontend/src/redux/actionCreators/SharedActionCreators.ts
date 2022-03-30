import { ISharedMetadata } from "../../page/SharedPage";
import { SharedActionTypes } from "../actionTypes/SharedActionTypes";
import { Action } from "./Action";

export namespace SharedActionCreators {
    export const setSharedSelected = (pageSelected: number): Action => ({
        type: SharedActionTypes.SET_SHARED_SELECTED,
        payload: pageSelected
    })
    
    export const setSharedMetadata = (sharedMetadata: ISharedMetadata[] | null): Action => ({
        type: SharedActionTypes.SET_SHARED_METADATA,
        payload: sharedMetadata
    })
    
    export const setSharedMetadataCount = (sharedMetadataCount: number | null): Action => ({
        type: SharedActionTypes.SET_SHARED_METADATA_COUNT,
        payload: sharedMetadataCount
    })
}
