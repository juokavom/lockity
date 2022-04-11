export interface FileUploaderProps {
    isAuthed: Boolean,
    onUpload: (uploadMetadata?: any) => void,
    onError: () => void
}

export interface FileUploadedMetadata {
    fileId: string,
    fileKey: string,
    fileName: string
}

export enum UploaderState {
    Initial,
    Uploading,
    Saving
}

export enum UploadPageState {
    Initial,
    Uploaded
}