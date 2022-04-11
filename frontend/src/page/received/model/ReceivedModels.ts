export interface IReceivedFileProps {
    receivedMetadata: IReceivedMetadata,
    action: (action: string) => void
}

export interface IReceivedMetadata {
    id: string,
    title: string,
    size: number,
    ownerEmail: string
}

export const FileAction = {
    Preview: "Preview file"
}