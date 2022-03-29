import { IFileMetadata, IFileMetadataInfo } from "../page/FilesPage";
import * as ActionTypes from "./ActionTypes";

export type Action = {
    type: string
    payload: any
}

export const setFileSelected = (fileSelected: number): Action => ({
    type: ActionTypes.SET_FILE_SELECTED,
    payload: fileSelected
})

export const setFileMetadata = (fileMetadata: IFileMetadata[] | null): Action => ({
    type: ActionTypes.SET_FILE_METADATA,
    payload: fileMetadata
})

export const setFileMetadataInfo = (fileMetadataInfo: IFileMetadataInfo | null): Action => ({
    type: ActionTypes.SET_FILE_METADATA_INFO,
    payload: fileMetadataInfo
})