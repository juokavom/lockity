import { Dispatch } from "react"
import { toast } from "react-toastify"
import { LOADING_TIMEOUT_MS } from "../../../model/Constants"
import { DefaultToastOptions, RequestBuilder } from "../../../model/RequestBuilder"
import { ROUTES } from "../../../model/Routes"
import { ENDPOINTS } from "../../../model/Server"
import { User } from "../../../model/User"
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

export const uploadEditedFileBlob = (fileId: string, title: string, filePayload: Blob,
    message: string, callback: (success: boolean) => void) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", filePayload, title)

    xhr.onreadystatechange = (ev: Event) => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            var status = xhr.status;
            if (String(status).charAt(0) === '2') {
                toast.success(message, DefaultToastOptions)
                callback(true)
            } else {
                if (status === 401) {
                    localStorage.removeItem(User.storagename)
                    window.location.replace(ROUTES.login)
                } else {
                    const response = JSON.parse(xhr.response)
                    toast.error('Upload failed! ' + response.message, DefaultToastOptions)
                }
                callback(false)
            }
        }
    }

    xhr.open("PUT", ENDPOINTS.FILE.fileId(fileId));
    xhr.withCredentials = true;
    xhr.send(formData);
}

export const fetchBlob = (url: string, callback: (response: any) => void) => {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = (ev: Event) => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            var status = xhr.status;
            if (String(status).charAt(0) === '2') {
                callback(xhr.response)
            } else {
                if (status === 401) {
                    localStorage.removeItem(User.storagename)
                    window.location.replace(ROUTES.login)
                } else {
                    const response = JSON.parse(xhr.response)
                    toast.error('Fetch failed! ' + response.message, DefaultToastOptions)
                }
                callback(xhr.response)
            }
        }
    }
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.withCredentials = true;
    xhr.send();
}
