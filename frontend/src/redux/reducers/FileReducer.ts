import { IFileMetadata, IFileMetadataInfo } from "../../page/FilesPage";
import { Action } from "../ActionCreators";
import * as ActionTypes from "../ActionTypes";

export type IFileState = {
    fileSelected: number,
    fileMetadatas: IFileMetadata[] | null,
    fileMetadataInfo: IFileMetadataInfo | null
}

export const FileReducer = (state: IFileState = {
    fileSelected: 1,
    fileMetadatas: null,
    fileMetadataInfo: null
}, action: Action): IFileState => {
    switch (action.type) {
        case ActionTypes.SET_FILE_SELECTED:
            return { ...state, fileSelected: action.payload }

        case ActionTypes.SET_FILE_METADATA:
            return { ...state, fileMetadatas: action.payload }
    
        case ActionTypes.SET_FILE_METADATA_INFO:
            return { ...state, fileMetadataInfo: action.payload }

        default:
            return state;
    }
}