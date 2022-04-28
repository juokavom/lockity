import React, { useState } from 'react';
import 'tui-image-editor/dist/tui-image-editor.css';
import { SUPPORTED_AUDIO_TYPES, SUPPORTED_IMAGE_TYPES, SUPPORTED_TEXT_TYPES } from '../../../model/Server';
import { fileTitleToFormat, IFileEditProps } from "../model/FileModels";
import { fileNameTsx } from '../model/FileNameTsx';
import { FileEditAudio } from './FileEditAudioComponent';
import { FileEditImage } from './FileEditImageComponent';
import { FileEditText } from './FileEditTextComponent';

export const FileEdit = (fileEditProps: IFileEditProps): JSX.Element => {
    const [format] = useState(fileTitleToFormat(fileEditProps.fileTitle));

    let selected: JSX.Element | null = null

    if (format) {
        if (SUPPORTED_AUDIO_TYPES.includes(format)) {
            selected = (<FileEditAudio {...fileEditProps} />)
        } else if (SUPPORTED_IMAGE_TYPES.includes(format)) {
            selected = (<FileEditImage {...fileEditProps} />)
        } else if (SUPPORTED_TEXT_TYPES.includes(format)) {
            selected = (<FileEditText {...fileEditProps} />)
        }
    }

    if (selected != null) {
        return (
            <div className="row align-items-end d-flex justify-content-center">
                <div className="row align-items-end d-flex justify-content-center">
                    <div className="col-auto">
                        {fileNameTsx(fileEditProps.fileTitle)}
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