import { IUserData } from "../../users/model/UsersModel"

export function sayHello() {
    const hellos = [
        "Hola", "Bonjour", "Guten tag", "Ciao", "Nǐn hǎo",
        "Asalaam alaikum", "Hello", "Labas", "Konnichiwa",
        "Shalom"
    ]
    return hellos[Math.floor(Math.random() * hellos.length)]
}

export interface IUserEditModalProps {
    userData: IUserData | null,
    callback: (success: boolean) => void
}