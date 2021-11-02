export namespace User {
    export const storagename = "user"

    export enum Role {
        Admin = "Administrator",
        Registered = "Registered"
    }

    export const isRole = (role: Role, input: string) => role === input
        
    export type FrontendUser = {
        name: string;
        surname: string;
        email: string;
        password: string;
        subscribed: boolean;
        role: Role;
    }    
}