import { TextareaAutosize } from "@mui/material";
import { useState } from "react";
import { ENDPOINTS, SUPPORTED_AUDIO_TYPES, SUPPORTED_IMAGE_TYPES, SUPPORTED_TEXT_TYPES, SUPPORTED_VIDEO_TYPES } from "../../../model/Server";
import { fetchBlob, IFilePreviewProps } from "../model/FileModels";
import { fileNameTsx } from "../model/FileNameTsx";

export const FilePreview = ({ id, title, src }: IFilePreviewProps): JSX.Element => {
    const [format] = useState(title.split('.').pop());    
    const [txtContents, setTxtContents] = useState<string | undefined>(undefined)

    const videoJsx = () => (
        <video style={{ maxWidth: "100%" }} controls controlsList="nodownload">
            <source src={src} type="video/mp4" />
        </video>
    );

    const audioJsx = () => (
        <audio style={{ maxWidth: "100%" }} controls controlsList="nodownload">
            <source src={src} type="audio/mpeg" />
        </audio>
    );

    const pictureJsx = () => (
        <img style={{ maxWidth: "100%" }} alt={title} src={src} />
    );

    const txtJsx = () => (
        <TextareaAutosize
            aria-label="minimum height"
            disabled
            minRows={3}
            maxRows={10}
            style={{ width: 400 }}
            value={txtContents}
            onChange={(e: any) => setTxtContents(e.target.value)}
        />
    );

    let selected: JSX.Element | null = null

    if (format) {
        if (SUPPORTED_VIDEO_TYPES.includes(format)) {
            selected = videoJsx()
        } else if (SUPPORTED_AUDIO_TYPES.includes(format)) {
            selected = audioJsx()
        } else if (SUPPORTED_IMAGE_TYPES.includes(format)) {
            selected = pictureJsx()
        } else if (SUPPORTED_TEXT_TYPES.includes(format)) {
            fetchBlob(ENDPOINTS.FILE.streamWithFileId(id), async (response) => {
                setTxtContents(await response.text())
            })
            selected = txtJsx()
        }
    }

    if (selected != null) {
        return (
            <div className="row align-items-end d-flex justify-content-center">
                <div className="row align-items-end d-flex justify-content-center">
                    <div className="col-auto">
                        {fileNameTsx(title)}
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
