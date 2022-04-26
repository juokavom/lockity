export const APIAction = {
    Create: "Create token",
    Show: "Show token",
    Revoke: "Revoke token"
}

export interface IAPIModalProps {
    apiData: IAPIData,
    callback: (success: boolean) => void
}

export interface IAPIData {
    id: string,
    title: string,
    token: string,
    permissions: string[],
    validFrom: Date,
    validTo: Date
}

export enum APIPermissions {
    Create = "CREATE",
    Read = "READ",
    Update = "UPDATE",
    Delete = "DELETE"
}

export const numberOfChecked = (permissions: any, items: any) => intersection(permissions, items).length;

function intersection(array: string[], element: string) {
    return array.filter((value) => element.indexOf(value) !== -1);
}