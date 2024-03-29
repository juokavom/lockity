type IURL = {
    Backend: string;
    Frontend: string;
}

const dev: IURL = {
    Backend: 'http://localhost:5000',
    Frontend: 'http://localhost:3000'
}

const prod: IURL = {
    Backend: 'https://api.lockity.akramas.com',
    Frontend: 'https://lockity.akramas.com'
}

export const LANDING_URL = "https://lockity.akramas.com/"
export const CONTACT_EMAIL = "mailto:lockity@akramas.com"
export const MAX_STORAGE_SIZE = 16106127360

export const SUPPORTED_VIDEO_TYPES = ['mp4']
export const SUPPORTED_AUDIO_TYPES = ['mp3']
export const SUPPORTED_IMAGE_TYPES = ['jpg', 'jpeg', 'png']
export const SUPPORTED_TEXT_TYPES = ['txt']
export const SUPPORTED_PREVIEW_TYPES = SUPPORTED_AUDIO_TYPES.concat(SUPPORTED_VIDEO_TYPES, SUPPORTED_IMAGE_TYPES, SUPPORTED_TEXT_TYPES)
export const SUPPORTED_EDITING_TYPES = SUPPORTED_AUDIO_TYPES.concat(SUPPORTED_IMAGE_TYPES, SUPPORTED_TEXT_TYPES)

export const URL: IURL = process.env.NODE_ENV === "production" ? prod : dev

export namespace ENDPOINTS {
    export const endpoint = URL.Backend

    export namespace AUTH {
        export const login = endpoint + '/login'
        export const logout = endpoint + '/logout'
        export const register = endpoint + '/register'
        export const registerConfirm = register + '/confirm'
        export const forgotPassword = endpoint + '/forgot-password'
        export const forgotPasswordConfirm = forgotPassword + '/confirm'
    }

    export namespace FILE {
        export const file = endpoint + '/file'
        export const metadata = file + '/metadata'

        export const fileId = (id: string) => file + '/file-id/' + id
        export const fileTitleWithId = (id: string) => file + '/title/file-id/' + id
        export const streamWithFileId = (id: string) => fileId(id) + '/stream'
        export const downloadWithFileId = (id: string) => fileId(id) + '/download'
        export const fileWithReceivedId = (id: string) =>
            file + '/received/receive-id/' + id
        export const streamReceivedWithFileId = (id: string) =>
            fileWithReceivedId(id) + '/stream'
        export const downloadReceivedWithFileId = (id: string) =>
            fileWithReceivedId(id) + '/download'
        export const shareConditionWithFileId = (id: string, condition: boolean) =>
            fileId(id) + '/share/' + condition
        export const fileAnonymous = file + '/anonymous'
        export const getFileMetadataWithOffsetAndLimit = (offset: number, limit: number) =>
            metadata + '/offset/' + offset + '/limit/' + limit
        export const getFileMetadataInfo = metadata + '/info'
        export const getFileMetadataWithTitleLike = (title: string) =>
            metadata + '/title-starts-with/' + title

        export const getReceivedMetadataWithOffsetAndLimit = (offset: number, limit: number) =>
            file + '/received/metadata/offset/' + offset + '/limit/' + limit
        export const getReceivedMetadataCount = file + '/received/metadata/count'

        export const dynlinkId = (id: string) => file + '/dynlink-id/' + id

        export const downloadDynlinkId = (id: string) => dynlinkId(id) + '/download'
        export const fetchDynlinkId = (id: string) => file + '/metadata/dynlink-id/' + id
    }

    export namespace USER {
        export const user = endpoint + '/user'

        export const userId = (id: string) => user + '/' + id
        export const userIdSelf = (id: string) => userId(id) + '/self'
        export const getUserWithUsernameLike = (email: string) => user + '/username-starts-with/' + email
        export const getUserDataWithOffsetAndLimit = (offset: number, limit: number) =>
            user + '/offset/' + offset + '/limit/' + limit
        export const getUserCount = user + '/count'
    }

    export namespace SHARED {
        export const sharedAccess = endpoint + '/shared-access'

        export const sharedId = (id: string) => sharedAccess + '/' + id
        export const getSharedMetadataWithOffsetAndLimit = (offset: number, limit: number) =>
            sharedAccess + '/offset/' + offset + '/limit/' + limit
        export const getSharedMetadataCount = sharedAccess + '/count'
    }

    export namespace API {
        export const api = endpoint + '/api'

        export const tokenId = (id: string) => api + '/api-id/' + id
        export const getAPIDataWithOffsetAndLimit = (offset: number, limit: number) =>
            api + '/offset/' + offset + '/limit/' + limit
        export const getAPICount = api + '/count'
    }
}