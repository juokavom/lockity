export const ShareAction = {
    Create: "Share file",
    Edit: "Edit share ",
    Delete: "Delete share"
}

export interface ISharedMetadata {
    id: string,
    file: IFileMetadataForSharing,
    user: IUserForSharing
}

export interface IShareModalProps {
    shareMetadata: ISharedMetadata,
    callback: (success: boolean) => void
}

export interface IFileMetadataForSharing {
    id: string,
    title: string
}

export interface IUserForSharing {
    id: string,
    email: string
}