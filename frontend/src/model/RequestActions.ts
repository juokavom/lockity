import { toast } from 'react-toastify';
import { DefaultToastOptions, RequestBuilder } from './RequestBuilder';
import { ROUTES } from './Routes';
import { ENDPOINTS, SERVER } from './Server';
import { User } from './User';

export const LogoutAction = async () => {
    await new RequestBuilder()
        .withUrl(ENDPOINTS.AUTH.logout)
        .withMethod('POST')
        .withDefaults()
        .send((response: any) => {
            // toast.success(response.message, DefaultToastOptions)
            localStorage.removeItem(User.storagename)
            window.location.replace(ROUTES.login)
        })
};

export const SimpleAction = async () => {
    await new RequestBuilder()
        .withUrl(SERVER.URL + '/auth/simple')
        .withMethod('GET')
        .withDefaults()
        .send((response: any) => {
            console.log('success simple!, reps = ', response)
        })
};

export const RegisteredAction = async () => {
    await new RequestBuilder()
        .withUrl(SERVER.URL + '/auth/authenticated')
        .withMethod('GET')
        .withDefaults()
        .send((response: any) => {
            console.log('success authed!, reps = ', response)
        })
};

export const AdminAction = async () => {
    await new RequestBuilder()
        .withUrl(SERVER.URL + '/auth/admin')
        .withMethod('GET')
        .withDefaults()
        .send((response: any) => {
            console.log('success admin!, reps = ', response)
        })
};