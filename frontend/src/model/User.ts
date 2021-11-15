export namespace User {
    export const storagename = "user"

    export enum Role {
        Admin = "Administrator",
        Registered = "Registered"
    }

    export const isAuthed = (input: Role) => input === Role.Admin || input === Role.Registered
    export const isAdmin = (input: Role) => input === Role.Admin

    export interface FrontendUser {
        id: string;
        email: string;
        role: Role;
    }
}