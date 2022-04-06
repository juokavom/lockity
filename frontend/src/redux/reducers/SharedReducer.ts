import { ISharedMetadata } from "../../page/SharedPage";
import { Action } from "../actionCreators/Action";
import { SharedActionTypes } from "../actionTypes/SharedActionTypes";

export type ISharedState = {
    pageSelected: number,
    sharedMetadatas: ISharedMetadata[] | null,
    sharedMetadataCount: number | null,
    fetched: boolean
}

export const SharedReducer = (state: ISharedState = {
    pageSelected: 1,
    sharedMetadatas: null,
    sharedMetadataCount: null,
    fetched: false
}, action: Action): ISharedState => {
    switch (action.type) {
        case SharedActionTypes.SET_SHARED_SELECTED:
            return { ...state, pageSelected: action.payload }

        case SharedActionTypes.SET_SHARED_METADATA:
            return { ...state, fetched: true, sharedMetadatas: action.payload }
    
        case SharedActionTypes.SET_SHARED_METADATA_COUNT:
            return { ...state, sharedMetadataCount: action.payload }

        default:
            return state;
    }
}