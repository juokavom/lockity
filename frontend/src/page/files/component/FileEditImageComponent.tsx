import ImageEditor from '@toast-ui/react-image-editor'
import React, { useEffect, useRef, useState } from 'react'
import { Button } from 'reactstrap'
import 'tui-image-editor/dist/tui-image-editor.css'
import { ENDPOINTS } from '../../../model/Server'
import { blobToDataURL, dataURItoBlob, fetchBlob, IFileModalProps } from "../model/FileModels"
import { uploadEditedFileBlob } from '../request/FilesRequests'

export const FileEditImage = ({ fileMetadata, callback }: IFileModalProps): JSX.Element => {
    const imageEditor = useRef<any>(null)
    const [imgContents, setImgContents] = useState<string | null>(null)

    useEffect(() => {
        fetchBlob(ENDPOINTS.FILE.streamWithFileId(fileMetadata.id), (response) => {
            blobToDataURL(response, (dataUrlResponse) => {
                setImgContents(dataUrlResponse)
            })
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
                            //@ts-ignore
                            const fileDataUrl = imageEditor.current.getInstance().toDataURL()
                            const filePayload = dataURItoBlob(fileDataUrl)
                            console.log(filePayload)
                            uploadEditedFileBlob(fileMetadata.id, fileMetadata.title, filePayload, 
                                "Your image was edited successfully!", callback)
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