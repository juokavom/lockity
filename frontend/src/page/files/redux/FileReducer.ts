import { Action } from "../../../redux/Action"
import { IFileMetadata, IFileMetadataInfo } from "../model/FileModels"
import { FileActionTypes } from "./FileActionTypes"

export type IFileState = {
    pageSelected: number,
    fileMetadatas: IFileMetadata[] | null,
    fileMetadataInfo: IFileMetadataInfo | null,
    fetched: boolean
}

export const FileReducer = (state: IFileState = {
    pageSelected: 1,
    fileMetadatas: null,
    fileMetadataInfo: null,
    fetched: false
}, action: Action): IFileState => {
    switch (action.type) {
        case FileActionTypes.SET_FILE_SELECTED:
            return { ...state, pageSelected: action.payload }

        case FileActionTypes.SET_FILE_METADATA:
            return { ...state, fetched: true, fileMetadatas: action.payload }

        case FileActionTypes.EDIT_FILE_METADATA:
            const replacableFileMetadata: IFileMetadata = action.payload
            const newFileMetadatas: IFileMetadata[] | undefined = state.fileMetadatas?.map<IFileMetadata>((fileMeta: IFileMetadata) =>
                fileMeta.id === replacableFileMetadata.id? replacableFileMetadata : fileMeta
            )
            return { ...state, fileMetadatas: newFileMetadatas? newFileMetadatas : null }
    
        case FileActionTypes.SET_FILE_METADATA_INFO:
            return { ...state, fileMetadataInfo: action.payload }

        default:
            return state;
    }
}