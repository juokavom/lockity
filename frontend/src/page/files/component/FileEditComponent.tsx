import React, { useState } from 'react'
import 'tui-image-editor/dist/tui-image-editor.css'
import { SUPPORTED_AUDIO_TYPES, SUPPORTED_IMAGE_TYPES, SUPPORTED_VIDEO_TYPES } from '../../../model/Server';
import { fileTitleToFormat, IFileModalProps } from "../model/FileModels"
import { fileNameTsx } from '../model/FileNameTsx';
import { FileEditAudio } from './FileEditAudioComponent';
import { FileEditImage } from './FileEditImageComponent';

export const FileEdit = (modalProps: IFileModalProps): JSX.Element => {
    const [format] = useState(fileTitleToFormat(modalProps.fileMetadata.title));

    let selected: JSX.Element | null = null

    if (format) {
        if (SUPPORTED_AUDIO_TYPES.includes(format)) {
            selected = (<FileEditAudio {...modalProps} />)
        } else if (SUPPORTED_IMAGE_TYPES.includes(format)) {
            selected = (<FileEditImage {...modalProps} />)
        }
    }

    if (selected != null) {
        return (
            <div className="row align-items-end d-flex justify-content-center">
                <div className="row align-items-end d-flex justify-content-center">
                    <div className="col-auto">
                        {fileNameTsx(modalProps.fileMetadata.title)}
                    </div>
                </div>
                <div className="row align-items-end d-flex justify-content-center">
                    <div className="col-auto">
                        {selected}
                    </div>
                </div>
            </div>
        );
    } else {
        return (<div></div>);
    }
}