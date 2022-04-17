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
    title: string,
    src: string
}

export interface ModalSize { 
    width: "sm" | "lg" | "xl" | undefined 
    height: string | undefined
}

export const FileAction = {
    Upload: "Upload file",
    Rename: "Rename file",
    Preview: "Preview file",
    Edit: "Edit file",
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

export const fetchToDataURL = (url: string, callback: (response: any) => void) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
        const reader = new FileReader();
        reader.onloadend = () => {
            callback(reader.result);
        }
        reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.withCredentials = true;
    xhr.send();
}

// Source: https://stackoverflow.com/questions/12168909/blob-from-dataurl
export const dataURItoBlob = (dataURI: string) => {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], {type: mimeString});
    return blob;
}