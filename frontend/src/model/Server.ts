type Server = {
    URL: string;
}

const dev: Server = {
    URL: 'http://localhost:5000'
}

const prod: Server = {
    URL: 'https://api.lockity.akramas.com'
}

export const LANDING_URL = "https://lockity.akramas.com/"
export const CONTACT_EMAIL = "mailto:lockity@akramas.com"
export const SUPPORTED_FILE_TYPES = ['mp4', 'mp3', 'jpg', 'jpeg', 'png']

export const SERVER: Server = process.env.NODE_ENV === "production" ? prod : dev

export namespace ENDPOINTS {
    const endpoint = SERVER.URL

    export namespace AUTH {
        export const login = endpoint + '/login'
        export const logout = endpoint + '/logout'
    }
    export namespace FILE {
        export const file = endpoint + '/file'
        export const metadata = file + '/metadata' 

        export const fileId = (id: string) => file + '/file-id/' + id
        export const fileAnonymous = file + '/anonymous'
        export const getFileMetadataWithOffsetAndLimit = (offset: number, limit: number) =>
            metadata + '/offset/' + offset + '/limit/' + limit
        export const getFileMetadataCount = metadata + '/count'
    }
    export namespace DYNLINK {
        export const dynlink = endpoint + '/dynlink'
        export const generateLink = (fileId: string, key: string | null) =>
            dynlink + '/file-id/' + fileId + (key != null ? "?key=" + key : "")
    }
}
