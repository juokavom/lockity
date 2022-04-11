import { Dispatch } from "react"
import { LOADING_TIMEOUT_MS } from "../../../model/Constants"
import { RequestBuilder } from "../../../model/RequestBuilder"
import { ENDPOINTS } from "../../../model/Server"
import { Action } from "../../../redux/Action"
import { LoadingActionCreators } from "../../../redux/actionCreators/LoadingActionCreators"
import { IFileMetadata, IFileMetadataInfo } from "../model/FileModels"
import { FileActionCreators } from "../redux/FileActionCreators"

export const fetchFileMetadata = (offset: number, limit: number, selected: number) => async (dispatch: Dispatch<Action>) => {
    dispatch(LoadingActionCreators.setLoading())
    await new RequestBuilder()
        .withUrl(ENDPOINTS.FILE.getFileMetadataWithOffsetAndLimit(offset, limit))
        .withMethod('GET')
        .withDefaults()
        .send((response: any) => {
            dispatch(FileActionCreators.setFileSelected(selected))
            if (response) {
                const fileMetadata: IFileMetadata[] = response
                dispatch(FileActionCreators.setFileMetadata(fileMetadata))
                setTimeout(() => {
                    dispatch(LoadingActionCreators.setNotLoading())
                }, LOADING_TIMEOUT_MS)
            } else {
                dispatch(FileActionCreators.setFileMetadata(null))
                dispatch(LoadingActionCreators.setNotLoading())
            }
        }, () => {
            dispatch(FileActionCreators.setFileMetadata(null))
            dispatch(LoadingActionCreators.setNotLoading())
        }
        )
}

export const fetchFileMetadataInfo = () => async (dispatch: Dispatch<Action>) =>
    await new RequestBuilder()
        .withUrl(ENDPOINTS.FILE.getFileMetadataInfo)
        .withMethod('GET')
        .withDefaults()
        .send((response: any) => {
            if (response) {
                const fileMetadataInfo: IFileMetadataInfo = response
                dispatch(FileActionCreators.setFileMetadataInfo(fileMetadataInfo))
            } else {
                dispatch(FileActionCreators.setFileMetadataInfo(null))
            }
        }, () => dispatch(FileActionCreators.setFileMetadataInfo(null))
        )
