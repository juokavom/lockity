import { IFileMetadata, IFileMetadataInfo } from "../../page/FilesPage";
import { Action } from "../actionCreators/Action";
import { FileActionTypes } from "../actionTypes/FileActionTypes";

export type IFileState = {
    pageSelected: number,
    fileMetadatas: IFileMetadata[] | null,
    fileMetadataInfo: IFileMetadataInfo | null
}

export const FileReducer = (state: IFileState = {
    pageSelected: 1,
    fileMetadatas: null,
    fileMetadataInfo: null
}, action: Action): IFileState => {
    switch (action.type) {
        case FileActionTypes.SET_FILE_SELECTED:
            return { ...state, pageSelected: action.payload }

        case FileActionTypes.SET_FILE_METADATA:
            return { ...state, fileMetadatas: action.payload }
    
        case FileActionTypes.SET_FILE_METADATA_INFO:
            return { ...state, fileMetadataInfo: action.payload }

        default:
            return state;
    }
}