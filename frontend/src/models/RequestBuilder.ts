import { toast, ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ROUTES } from './Routes';
import { User } from './User';

export const DefaultToastOptions: ToastOptions = {
    position: "top-center",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
}

export class RequestBuilder {
    private input?: RequestInfo
    private init?: RequestInit
    private errorHandling?: (response: Response) => void

    constructor() {
        this.input = undefined
        this.init = {}
        this.errorHandling = undefined
    }

    public send = async (success: (response: any) => void) => {
        if (this.input && this.init) {
            const response = await fetch(this.input, this.init)
            if (response.status >= 400 && this.errorHandling) {
                this.errorHandling(response)
            } else if (response.ok) {
                success(await response.json())
            }
        }
    }

    public withUrl = (url: string): RequestBuilder => {
        this.input = url
        return this
    }

    public witErrorHandling = (handling: (response: Response) => void): RequestBuilder => {
        this.errorHandling = handling
        return this
    }

    public withMethod = (method: string): RequestBuilder =>
        this.withInitValid((init: RequestInit) => {
            init.method = method
        })

    public withHeaders = (headers: HeadersInit): RequestBuilder =>
        this.withInitValid((init: RequestInit) => {
            init.headers = headers
        })

    public withCredentials = (credentials: RequestCredentials): RequestBuilder =>
        this.withInitValid((init: RequestInit) => {
            init.credentials = credentials
        })

    public withBody = (body: any): RequestBuilder =>
        this.withInitValid((init: RequestInit) => {
            init.body = JSON.stringify(body)
        })

    public withDefaults = (): RequestBuilder =>
        this.withHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
            .withCredentials('include')
            .witErrorHandling(async (response: Response) => {
                toast.error((await response.json()).message, DefaultToastOptions)
                if(response.status === 401) {           
                    localStorage.removeItem(User.storagename)
                    window.location.replace(ROUTES.login)
                }
            })

    private withInitValid(block: (init: RequestInit) => void): RequestBuilder {
        if (this.init) {
            block(this.init)
        }
        return this
    }

}