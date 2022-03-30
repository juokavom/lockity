import { IFileMetadata, IFileMetadataInfo } from "../../page/FilesPage";
import { FileActionTypes } from "../actionTypes/FileActionTypes";
import { Action } from "./Action";

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