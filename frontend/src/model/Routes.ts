import { URL } from "./Server"

export namespace ROUTES {
    export const login = '/login'
    export const upload = '/upload'
    export const test = '/test'

    export const myFiles = '/my-files'
    export const receivedFiles = '/received-files'
    export const sharedFiles = '/shared-files'
    
    export const sendNewsletter = '/send-newsletter'
    export const users = '/users'

    export const getAnonymousFile = (dynlink: string) => URL.Frontend + '/file/' + dynlink
}
