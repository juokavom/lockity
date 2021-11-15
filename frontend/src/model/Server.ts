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
export const SUPPORTED_FILE_TYPES = ['mp4', 'mp3', 'jpg', 'jpeg', 'png']
export const MAX_STORAGE_SIZE = 15000000000

export const URL: IURL = process.env.NODE_ENV === "production" ? prod : dev

export namespace ENDPOINTS {
    const endpoint = URL.Backend

    export namespace AUTH {
        export const login = endpoint + '/login'
        export const logout = endpoint + '/logout'
    }
    export namespace FILE {
        export const file = endpoint + '/file'
        export const metadata = file + '/metadata'

        export const fileId = (id: string) => file + '/file-id/' + id
        export const streamWithFileId = (id: string) => fileId(id) + '/stream'
        export const downloadWithFileId = (id: string) => fileId(id) + '/download'
        export const shareConditionWithFileId = (id: string, condition: boolean) =>
            fileId(id) + '/share/' + condition
        export const fileAnonymous = file + '/anonymous'
        export const getFileMetadataWithOffsetAndLimit = (offset: number, limit: number) =>
            metadata + '/offset/' + offset + '/limit/' + limit
        export const getFileMetadataInfo = metadata + '/info'
        export const getFileMetadataWithTitleLike = (title: string) =>
            metadata + '/title-starts-with/' + title
    }
    export namespace USER {
        export const user = endpoint + '/user'

        export const userId = (id: string) => user + '/' + id
        export const getUserWithEmailLike = (email: string) => user + '/email-starts-with/' + email
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
}