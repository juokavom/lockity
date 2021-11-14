type URL = {
    Backend: string;
    Frontend: string;
}

const dev: URL = {
    Backend: 'http://localhost:5000',
    Frontend: 'http://localhost:3000'
}

const prod: URL = {
    Backend: 'https://api.lockity.akramas.com',
    Frontend: 'https://lockity.akramas.com'
}

export const LANDING_URL = "https://lockity.akramas.com/"
export const CONTACT_EMAIL = "mailto:lockity@akramas.com"
export const SUPPORTED_FILE_TYPES = ['mp4', 'mp3', 'jpg', 'jpeg', 'png']

export const URL: URL = process.env.NODE_ENV === "production" ? prod : dev

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
    }
    export namespace DYNLINK {
        export const dynlink = endpoint + '/dynlink'
        export const generateLink = (fileId: string, key: string | null) =>
            dynlink + '/file-id/' + fileId + (key != null ? "?key=" + key : "")
    }
}