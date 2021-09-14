type Server = {
    URL: string;
}

const dev: Server = {
    URL: 'https://localhost:500/'
}

const prod: Server = {
    URL: 'https://api.lockity.akramas.com/'
}

export const SERVER: Server = process.env.ENV === undefined && process.env.ENV !== "prod" ? dev : prod 