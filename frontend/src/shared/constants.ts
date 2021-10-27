type Server = {
    URL: string;
}

const dev: Server = {
    URL: 'http://localhost:5000'
}

const prod: Server = {
    URL: 'https://api.lockity.akramas.com'
}

export const SERVER: Server = process.env.NODE_ENV === "production" ? prod : dev

export namespace ENDPOINTS {
    const endpoint = SERVER.URL
    export namespace AUTH {
        const auth = endpoint + '/auth'        
        export const login = auth + '/login'
    }
}