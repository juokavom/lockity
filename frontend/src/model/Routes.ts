import { URL } from "./Server"

export namespace ROUTES {
    export const login = '/login'
    export const upload = '/upload'
    export const download = '/download'
    export const test = '/test'
    export const confirm = '/confirm'
    export const reset = '/reset'

    export const filesPage = '/files'
    export const receivedPage = '/received'
    export const sharedPage = '/shared'
    export const APIPage = '/api'
    
    export const sendNewsletter = '/send-newsletter'
    export const users = '/users'

    export const getAnonymousFile = (dynlink: string) => URL.Frontend + '/download/' + dynlink
}
