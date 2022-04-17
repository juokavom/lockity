import ImageEditor from '@toast-ui/react-image-editor'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { Button } from 'reactstrap'
import 'tui-image-editor/dist/tui-image-editor.css'
import { DefaultToastOptions } from '../../../model/RequestBuilder'
import { ROUTES } from '../../../model/Routes'
import { ENDPOINTS } from '../../../model/Server'
import { User } from '../../../model/User'
import { dataURItoBlob, fetchToDataURL, IFileModalProps } from "../model/FileModels"

export const FileEdit = ({ fileMetadata, callback }: IFileModalProps): JSX.Element => {
    const imageEditor = useRef<any>(null)
    const [imgContents, setImgContents] = useState<string | null>(null)

    const upload = () => {
        if (imageEditor.current) {
            const xhr = new XMLHttpRequest();
            const formData = new FormData();
            
            //@ts-ignore
            const fileDataUrl = imageEditor.current.getInstance().toDataURL()
            const filePayload = dataURItoBlob(fileDataUrl)
            formData.append("file", filePayload, fileMetadata.title)

            xhr.onreadystatechange = (ev: Event) => {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    var status = xhr.status;
                    if (String(status).charAt(0) === '2') {
                        toast.success('Your file was uploaded successfully', DefaultToastOptions)
                        callback(true)
                    } else {
                        if (status === 401) {
                            localStorage.removeItem(User.storagename)
                            window.location.replace(ROUTES.login)
                        } else {
                            const response = JSON.parse(xhr.response)
                            toast.error('Upload failed! ' + response.message, DefaultToastOptions)
                        }
                        callback(false)
                    }
                }
            }

            xhr.open("PUT", ENDPOINTS.FILE.fileId(fileMetadata.id));
            xhr.withCredentials = true;
            xhr.send(formData);
        }
    }

    useEffect(() => {
        fetchToDataURL(ENDPOINTS.FILE.streamWithFileId(fileMetadata.id), (response) => {
            setImgContents(response)
        })
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    if (imgContents) {
        return (
            <div className='container'>
                <div style={{ overflowX: 'auto' }}>
                    <ImageEditor
                        ref={imageEditor}
                        includeUI={{
                            loadImage: {
                                path: imgContents,
                                name: fileMetadata.title,
                            },
                            theme: {
                                "header.display": "none"
                            },
                            initMenu: 'filter',
                            uiSize: {
                                width: '1050px',
                                height: '700px',
                            },
                            menuBarPosition: 'bottom',
                        }}
                        selectionStyle={{
                            cornerSize: 20,
                            rotatingPointOffset: 70,
                        }}
                        usageStatistics={false}
                    />
                </div>
                <div className="selected-file-wrapper">
                    <Button
                        type="submit"
                        variant="contained"
                        className="upload-button"
                        sx={{ mt: 3, mb: 2 }}
                        onClick={() => {
                            upload()
                        }}
                    >
                        Save
                    </Button>
                </div>
            </div>
        );
    } else {
        return <></>
    }
}

