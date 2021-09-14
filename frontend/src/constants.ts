type Server = {
    URL: string;
}

const dev: Server = {
    URL: 'https://localhost:5000/'
}

const prod: Server = {
    URL: 'https://api.lockity.akramas.com/'
}

export const SERVER: Server = process.env.NODE_ENV === "production" ? prod : dev