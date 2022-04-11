import { Action } from "../../../redux/Action";
import { IFileMetadata, IFileMetadataInfo } from "../model/FileModels";
import { FileActionTypes } from "./FileActionTypes";

export namespace FileActionCreators {
    export const setFileSelected = (pageSelected: number): Action => ({
        type: FileActionTypes.SET_FILE_SELECTED,
        payload: pageSelected
    })
    
    export const setFileMetadata = (fileMetadata: IFileMetadata[] | null): Action => ({
        type: FileActionTypes.SET_FILE_METADATA,
        payload: fileMetadata
    })
    
    export const setFileMetadataInfo = (fileMetadataInfo: IFileMetadataInfo | null): Action => ({
        type: FileActionTypes.SET_FILE_METADATA_INFO,
        payload: fileMetadataInfo
    })
}