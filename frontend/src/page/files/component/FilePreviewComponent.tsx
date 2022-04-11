import { useState } from "react";
import { IFilePreviewProps } from "../model/FileModels";
import { fileNameTsx } from "../model/FileNameTsx";

export const FilePreview = ({ id, title, src }: IFilePreviewProps): JSX.Element => {
    const [format] = useState(title.split('.').pop());

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

    let selected = null

    if (format) {
        if (format === "mp4") {
            selected = videoJsx()
        } else if (format === "mp3") {
            selected = audioJsx()
        } else if (["png", "jpg", "jpeg"].includes(format)) {
            selected = pictureJsx()
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
