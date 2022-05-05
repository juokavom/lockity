import { TextareaAutosize } from "@mui/material";
import { useEffect, useState } from "react";
import { SUPPORTED_AUDIO_TYPES, SUPPORTED_IMAGE_TYPES, SUPPORTED_TEXT_TYPES, SUPPORTED_VIDEO_TYPES } from "../../../model/Server";
import { LoadingSpinner } from "../../main/components/LoadingSpinnerComponent";
import { blobToDataURL, fetchBlob, IFilePreviewProps } from "../model/FileModels";
import { fileNameTsx } from "../model/FileNameTsx";

export const FilePreview = ({ id, title, src }: IFilePreviewProps): JSX.Element => {
    const [format] = useState(title.split('.').pop());
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<JSX.Element | null>(null);

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

    const pictureJsx = (url: string) => (
        <img style={{ maxWidth: "100%" }} alt={title} src={url} />
    );

    const txtJsx = (contents: string) => (
        <TextareaAutosize
            aria-label="minimum height"
            disabled
            minRows={3}
            maxRows={20}
            style={{ width: 400 }}
            value={contents}
        />
    );

    useEffect(() => {
        if (format) {
            if (SUPPORTED_VIDEO_TYPES.includes(format)) {
                setSelected(videoJsx())
            } else if (SUPPORTED_AUDIO_TYPES.includes(format)) {
                setSelected(audioJsx())
            } else if (SUPPORTED_IMAGE_TYPES.includes(format)) {
                setLoading(true)
                fetchBlob(src, async (response) => {
                    blobToDataURL((response), (url: string) => {
                        setSelected(pictureJsx(url))
                        setLoading(false)
                    })
                })
            } else if (SUPPORTED_TEXT_TYPES.includes(format)) {
                setLoading(true)
                fetchBlob(src, async (response) => {
                    setSelected(txtJsx(await response.text()))
                    setLoading(false)
                })
            }
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    if (loading) {
        return (
            <div className='container'>
                <LoadingSpinner />
            </div>
        );
    } else if (selected != null) {
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
