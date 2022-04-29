import { toast } from "react-toastify"
import { DefaultToastOptions } from "../../../model/RequestBuilder"
import { ROUTES } from "../../../model/Routes"
import { User } from "../../../model/User"

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

export interface IFileEditProps {
    fileId: string,
    fileTitle: string,
    src: string,
    uploadSrc: string,
    callback: (success: boolean) => void
}

export interface IFilePreviewProps {
    id: string,
    title: string,
    src: string
}

export interface IWavesurferProps {
    wavesurferRef: any
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

export const fileTitleToFormat = (title: string): string => {
    const format = title.split('.').pop()
    return format ? format : ""
}

export enum DataUnit {
    B = "B",
    KB = "KB",
    MB = "MB",
    GB = "GB"
}

export interface IFormattedSize {
    size: number,
    unit: DataUnit
}

const K = 1024;
const DATA_UNITS = [DataUnit.B, DataUnit.KB, DataUnit.MB, DataUnit.GB];

export const bytesToFormattedSize = (bytes: number | undefined, decimals = 2): IFormattedSize => {
    if (bytes === undefined || bytes === 0) return {
        size: 0,
        unit: DataUnit.B
    };
    const dm = decimals < 0 ? 0 : decimals;
    const i = Math.floor(Math.log(bytes) / Math.log(K));
    return {
        size: parseFloat((bytes / Math.pow(K, i)).toFixed(dm)),
        unit: DATA_UNITS[i]
    }
}

export const formattedSizeToBytes = (formattedSize: IFormattedSize) => {
    return formattedSize.size * Math.pow(K, DATA_UNITS.indexOf(formattedSize.unit))
}

export const fetchBlob = (url: string, callback: (response: any) => void) => {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = (ev: Event) => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            var status = xhr.status;
            if (String(status).charAt(0) === '2') {
                callback(xhr.response)
            } else {
                if (status === 401) {
                    localStorage.removeItem(User.storagename)
                    window.location.replace(ROUTES.login)
                } else {
                    const response = JSON.parse(xhr.response)
                    toast.error('Fetch failed! ' + response.message, DefaultToastOptions)
                }
                callback(xhr.response)
            }
        }
    }
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.withCredentials = true;
    xhr.send();
}

// Šis metodas panaudotas iš interneto šaltinių
// Šaltinis: https://stackoverflow.com/questions/12168909/blob-from-dataurl
export const dataURItoBlob = (dataURI: string) => {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });
    return blob;
}

// Šis metodas panaudotas iš interneto šaltinių
// Šaltinis: https://stackoverflow.com/questions/23150333/html5-javascript-dataurl-to-blob-blob-to-dataurl
export const blobToDataURL = (blob, callback) => {
    var a = new FileReader();
    a.onload = function(e) {
        // @ts-ignore
        callback(e.target.result);
    }
    a.readAsDataURL(blob);
}

// Šis metodas panaudotas iš interneto šaltinių
// Šaltinis: https://stackoverflow.com/questions/60079764/how-to-export-wavesurfer-js-as-audio-file
export const bufferToWave = (abuffer, offset, len, format) => {
    var numOfChan = abuffer.numberOfChannels,
        length = len * numOfChan * 2 + 44,
        buffer = new ArrayBuffer(length),
        view = new DataView(buffer),
        channels = [], i, sample,
        pos = 0;

    // write WAVE header
    setUint32(0x46464952);                         // "RIFF"
    setUint32(length - 8);                         // file length - 8
    setUint32(0x45564157);                         // "WAVE"

    setUint32(0x20746d66);                         // "fmt " chunk
    setUint32(16);                                 // length = 16
    setUint16(1);                                  // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2);                      // block-align
    setUint16(16);                                 // 16-bit (hardcoded in this demo)

    setUint32(0x61746164);                         // "data" - chunk
    setUint32(length - pos - 4);                   // chunk length

    // write interleaved data
    for (i = 0; i < abuffer.numberOfChannels; i++)
        // @ts-ignore
        channels.push(abuffer.getChannelData(i));

    while (pos < length) {
        for (i = 0; i < numOfChan; i++) {             // interleave channels
            sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
            view.setInt16(pos, sample, true);          // update data chunk
            pos += 2;
        }
        offset++                                     // next source sample
    }

    // create Blob
    // return (URL || webkitURL).createObjectURL(new Blob([buffer], { type: format }));
    return new Blob([buffer], { type: format });

    function setUint16(data) {
        view.setUint16(pos, data, true);
        pos += 2;
    }

    function setUint32(data) {
        view.setUint32(pos, data, true);
        pos += 4;
    }
}