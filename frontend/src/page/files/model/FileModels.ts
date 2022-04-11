export interface IFileMetadata {
    id: string,
    title: string,
    size: number,
    link: string | null,
}

export interface StorageData {
    totalSize: number,
    usedSize: number
}

export interface IFileMetadataInfo {
    storageData: StorageData,
    fileCount: number
}

export interface IFileProps {
    fileMetadata: IFileMetadata,
    action: (action: string) => void
}

export interface IFileModalProps {
    fileMetadata: IFileMetadata,
    callback: (success: boolean) => void
}

export interface IFilePreviewProps {
    id: string,
    title: string
}

export const FileAction = {
    Upload: "Upload file",
    Edit: "Edit file",
    Preview: "Preview file",
    Share: "Share file",
    Delete: "Delete file"
}

export function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
