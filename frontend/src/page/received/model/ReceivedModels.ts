export interface IReceivedFileProps {
    receivedMetadata: IReceivedMetadata,
    action: (action: string) => void
}

export interface IReceivedMetadata {
    id: string,
    title: string,
    size: number,
    ownerPublicName: string,
    canEdit: boolean
}

export const FileAction = {
    Preview: "Preview file",
    Edit: "Edit file"
}