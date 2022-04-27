import { User } from "../../../model/User"

export const UserAction = {
    Create: "Create user",
    Edit: "Edit user",
    Delete: "Delete user"
}

export interface IUserModalProps {
    userData: IUserData,
    callback: (success: boolean) => void
}

export interface IUserData {
    id: string,
    username: string,
    name: string | null,
    surname: string | null,
    email: string,
    password: string | null,
    role: User.Role,
    registered: Date,
    lastActive: Date | null,
    confirmed: boolean,
    subscribed: boolean,
    storageSize: number,
    publicName: string
}
