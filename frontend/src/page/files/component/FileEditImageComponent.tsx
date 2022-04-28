import ImageEditor from '@toast-ui/react-image-editor'
import React, { useEffect, useRef, useState } from 'react'
import { Button } from 'reactstrap'
import 'tui-image-editor/dist/tui-image-editor.css'
import { LoadingSpinner } from '../../main/components/LoadingSpinnerComponent'
import { blobToDataURL, dataURItoBlob, fetchBlob, IFileEditProps } from "../model/FileModels"
import { uploadEditedFileBlob } from '../request/FilesRequests'

export const FileEditImage = ({ fileId, fileTitle, src, uploadSrc, callback }: IFileEditProps): JSX.Element => {
    const imageEditor = useRef<any>(null)
    const [imgContents, setImgContents] = useState<string | null>(null)
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true)
        fetchBlob(src, (response) => {
            blobToDataURL(response, (dataUrlResponse) => {
                setImgContents(dataUrlResponse)
                setLoading(false)
            })
        })
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    if (loading) {
        return (
            <div className='container'>
                <LoadingSpinner />
            </div>
        );
    } else if (imgContents) {
        return (
            <div className='container'>
                <div style={{ overflowX: 'auto' }}>
                    <ImageEditor
                        ref={imageEditor}
                        includeUI={{
                            loadImage: {
                                path: imgContents,
                                name: fileTitle,
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
                            setLoading(true)
                            //@ts-ignore
                            const fileDataUrl = imageEditor.current.getInstance().toDataURL()
                            const filePayload = dataURItoBlob(fileDataUrl)
                            console.log(filePayload)
                            uploadEditedFileBlob(uploadSrc, fileId, fileTitle, filePayload,
                                "Your image was edited successfully!", () => {
                                    setLoading(false)
                                    callback(true)
                                })
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