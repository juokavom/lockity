import { TextareaAutosize } from '@mui/material'
import ImageEditor from '@toast-ui/react-image-editor'
import React, { useEffect, useRef, useState } from 'react'
import { Button } from 'reactstrap'
import 'tui-image-editor/dist/tui-image-editor.css'
import { ENDPOINTS } from '../../../model/Server'
import { dataURItoBlob, fetchBlob, IFileModalProps } from "../model/FileModels"
import { uploadEditedFileBlob } from '../request/FilesRequests'

export const FileEditText = ({ fileMetadata, callback }: IFileModalProps): JSX.Element => {
    const [txtContents, setTxtContents] = useState<string | null>(null)

    useEffect(() => {
        fetchBlob(ENDPOINTS.FILE.streamWithFileId(fileMetadata.id), async (response) => {
            setTxtContents(await response.text())
        })
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    if (txtContents) {
        return (
            <div className='container'>
                <TextareaAutosize
                    aria-label="minimum height"
                    minRows={3}
                    maxRows={10}
                    style={{ width: 400 }}
                    value={txtContents}
                    onChange={(e: any) => setTxtContents(e.target.value)}
                />
                <div className="selected-file-wrapper">
                    <Button
                        type="submit"
                        variant="contained"
                        className="upload-button"
                        sx={{ mt: 3, mb: 2 }}
                        onClick={() => {
                            const filePayload = new Blob(([txtContents]), { type: "text/plain" });
                            uploadEditedFileBlob(fileMetadata.id, fileMetadata.title, filePayload,
                                "Your text file was edited successfully!", callback)
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