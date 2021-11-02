

export class RequestBuilder {
    private input?: RequestInfo
    private init?: RequestInit

    constructor() {
        this.input = undefined
        this.init = {}
    }

    public build = () : Promise<Response> | null => {
        if (this.input && this.init) {
            return fetch(this.input, this.init)
        }
        else return null
    }

    public withUrl = (url: string): RequestBuilder => {
        this.input = url
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

    public withDefaultHeadersAndCredentials = (): RequestBuilder =>
        this.withHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }).withCredentials('include')

    private withInitValid(block: (init: RequestInit) => void): RequestBuilder {
        if (this.init) {
            block(this.init)
        } else {
            console.log('NULL')
        }
        return this
    }

}