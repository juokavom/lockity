import { TextareaAutosize } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Button } from 'reactstrap'
import 'tui-image-editor/dist/tui-image-editor.css'
import { LoadingSpinner } from '../../main/components/LoadingSpinnerComponent'
import { fetchBlob, IFileEditProps } from "../model/FileModels"
import { uploadEditedFileBlob } from '../request/FilesRequests'

export const FileEditText = ({ fileId, fileTitle, src, uploadPUTSrc, uploadPOSTSrc, callback }: IFileEditProps): JSX.Element => {
    const [txtContents, setTxtContents] = useState<string>("")
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true)
        fetchBlob(src, async (response) => {
            setTxtContents(await response.text())
            setLoading(false)
        })
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    if (loading) {
        return (
            <div className='container'>
                <LoadingSpinner />
            </div>
        );
    } else {
        return (
            <div className='container'>
                <TextareaAutosize
                    aria-label="minimum height"
                    minRows={3}
                    maxRows={20}
                    style={{ width: 400 }}
                    value={txtContents}
                    onChange={(e: any) => setTxtContents(e.target.value)}
                />
                <div className="row justify-content-center">
                    {
                        uploadPOSTSrc &&
                        <div className="col-auto m-1">
                            <Button
                                type="submit"
                                variant="contained"
                                className="upload-button"
                                sx={{ mt: 3, mb: 2 }}
                                onClick={() => {
                                    setLoading(true)
                                    const filePayload = new Blob(([txtContents]), { type: "text/plain" });
                                    uploadEditedFileBlob(uploadPOSTSrc, "POST", "copy_" + fileTitle, filePayload,
                                        "Your text file was saved successfully!", () => {
                                            setLoading(false)
                                            callback(true)
                                        })
                                }}>
                                Save as copy
                            </Button>
                        </div>
                    }
                    <div className="col-auto m-1">
                        <Button
                            type="submit"
                            variant="contained"
                            className="upload-button"
                            sx={{ mt: 3, mb: 2 }}
                            onClick={() => {
                                setLoading(true)
                                const filePayload = new Blob(([txtContents]), { type: "text/plain" });
                                uploadEditedFileBlob(uploadPUTSrc, "PUT", fileTitle, filePayload,
                                    "Your text file was edited successfully!", () => {
                                        setLoading(false)
                                        callback(true)
                                    })
                            }}
                        >
                            Save
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
}