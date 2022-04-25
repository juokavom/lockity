import React, { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { Button } from 'reactstrap'
import 'tui-image-editor/dist/tui-image-editor.css'
import { DefaultToastOptions, RequestBuilder } from '../../../../model/RequestBuilder'
import { ENDPOINTS } from '../../../../model/Server'
import { dataURItoBlob, IFileModalProps, IVideoSave } from "../../model/FileModels"
import { fetchBlob, uploadEditedFileBlob } from '../../request/FilesRequests'
import VideoEditor from './VideoEditor/Editor'

export const FileEditVideo = ({ fileMetadata, callback }: IFileModalProps): JSX.Element => {
    const [videoContents, setVideoContents] = useState<Blob | null>(null)

    useEffect(() => {
        fetchBlob(ENDPOINTS.FILE.streamWithFileId(fileMetadata.id), (response) => {
            setVideoContents(response)
        })
    }, []) // eslint-disable-line react-hooks/exhaustive-deps


    const EditVideoAction = async (videoSaveMetadata: IVideoSave, fileId: string) => {
        await new RequestBuilder()
            .withUrl(ENDPOINTS.FILE.fileVideoWithId(fileId))
            .withMethod('PUT')
            .withDefaults()
            .withBody(videoSaveMetadata)
            .send((response: any) => {
                toast.success(response.message, DefaultToastOptions)
                callback(true)
            }, () => callback(false))
    }

    const saveVideo = async (videoSaveMetadata: IVideoSave) => {
        const isVideoNotEdited = videoSaveMetadata.trim_times.length < 2
            && videoSaveMetadata.trim_times[0].start == 0
            && videoSaveMetadata.trim_times[0].end == videoSaveMetadata.duration
            && !videoSaveMetadata.mute
        if (!isVideoNotEdited) {
            await EditVideoAction(videoSaveMetadata, fileMetadata.id)
        }
    }

    if (videoContents) {
        return (
            <div className='container'>
                <VideoEditor videoUrl={URL.createObjectURL(videoContents)}
                    saveVideo={saveVideo}
                    fileMetadata={fileMetadata}
                />
            </div>
        );
    } else {
        return (<></>);
    }

}