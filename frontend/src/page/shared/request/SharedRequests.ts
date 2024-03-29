import { Dispatch } from "react"
import { LOADING_TIMEOUT_MS } from "../../../model/Constants"
import { RequestBuilder } from "../../../model/RequestBuilder"
import { ENDPOINTS } from "../../../model/Server"
import { Action } from "../../../redux/Action"
import { LoadingActionCreators } from "../../../redux/actionCreators/LoadingActionCreators"
import { IFileMetadataForSharing, ISharedMetadata, IUserForSharing } from "../model/SharedModels"
import { SharedActionCreators } from "../redux/SharedActionCreators"

const regex = new RegExp("^[a-zA-Z0-9]+$");

export const FetchWithTitlesLike = async (title: string, setFiles: (files: IFileMetadataForSharing[]) => void) => {
    if (regex.test(title)) {
        await new RequestBuilder()
            .withUrl(ENDPOINTS.FILE.getFileMetadataWithTitleLike(title))
            .withMethod('GET')
            .withDefaults()
            .send((response: any) => {
                const files: IFileMetadataForSharing[] = response
                setFiles(files)
            }, () => { })
    }
}

export const FetchUsersWithUsernamesLike = async (username: string, setUsers: (users: IUserForSharing[]) => void) => {
    if (regex.test(username)) {
        await new RequestBuilder()
            .withUrl(ENDPOINTS.USER.getUserWithUsernameLike(username))
            .withMethod('GET')
            .withDefaults()
            .send((response: any) => {
                const users: IUserForSharing[] = response
                setUsers(users)
            }, () => { })
    }
}

export const fetchSharedMetadata = (offset: number, limit: number, selected: number) => async (dispatch: Dispatch<Action>) => {
    dispatch(LoadingActionCreators.setLoading())
    await new RequestBuilder()
        .withUrl(ENDPOINTS.SHARED.getSharedMetadataWithOffsetAndLimit(offset, limit))
        .withMethod('GET')
        .withDefaults()
        .send((response: any) => {
            dispatch(SharedActionCreators.setSharedSelected(selected))
            if (response) {
                const shareMetadata: ISharedMetadata[] = response
                dispatch(SharedActionCreators.setSharedMetadata(shareMetadata))
                setTimeout(() => {
                    dispatch(LoadingActionCreators.setNotLoading())
                }, LOADING_TIMEOUT_MS)
            } else {
                dispatch(SharedActionCreators.setSharedMetadata(null))
                dispatch(LoadingActionCreators.setNotLoading())
            }
        }, () => {
            dispatch(SharedActionCreators.setSharedMetadata(null))
            dispatch(LoadingActionCreators.setNotLoading())
        }
        )
}

export const fetchSharedMetadataCount = () => async (dispatch: Dispatch<Action>) => {
    await new RequestBuilder()
        .withUrl(ENDPOINTS.SHARED.getSharedMetadataCount)
        .withMethod('GET')
        .withDefaults()
        .send((response: any) => {
            if (response) {
                const sharedAccessCount: { sharedAccessCount: number } = response
                dispatch(SharedActionCreators.setSharedMetadataCount(sharedAccessCount.sharedAccessCount))
            } else {
                dispatch(SharedActionCreators.setSharedMetadataCount(null))
            }
        }, () => dispatch(SharedActionCreators.setSharedMetadataCount(null)))
}