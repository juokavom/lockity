import { useState } from 'react';
import Dropzone from 'react-dropzone';
import { ENDPOINTS } from '../model/Server';
import { toast } from "react-toastify";
import { DefaultToastOptions } from '../model/RequestBuilder';
import { Progress, Spinner } from 'reactstrap';

enum UploaderState {
    None,
    Uploading,
    Saving,
    Uploaded
}

export default function FileUploader() {
    const [file, setFile] = useState<any>()
    const [progress, setProgress] = useState<{
        uploadPercent: number;
        uploadText: string;
    } | null>(null)
    const [state, setState] = useState<UploaderState>(UploaderState.None)
    const [response, setResponse] = useState<{
        fileId: string,
        fileKey: string
    } | null>(null)

    const clearStateHooks = () => {
        setFile(null)
        setProgress(null)
        setState(UploaderState.None)
        setResponse(null)
    }

    const onDrop = (files: any) => {
        if (files.length > 0) {
            setFile(files)
        }
    }

    const upload = () => {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append("file", file[0], file[0].name)
        setState(UploaderState.Uploading)

        xhr.upload.onprogress = event => {
            const percent = (event.loaded / event.total) * 100
            setProgress({
                uploadPercent: percent,
                uploadText: "Uploading " + percent.toFixed(0) + "%"
            })
            if (percent === 100) {
                setProgress(null)
                setState(UploaderState.Saving)
            }
        }

        xhr.onreadystatechange = (ev: Event) => {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                var status = xhr.status;
                if (status === 0 || (status >= 200 && status < 400)) {
                    setResponse(xhr.response)
                    setState(UploaderState.Uploaded)
                    toast.success('Your file was uploaded successfully', DefaultToastOptions)
                } else {
                    clearStateHooks()
                    toast.error('Upload failed!', DefaultToastOptions)
                }
            }
        }

        xhr.open("POST", ENDPOINTS.FILE.fileAnonymous(true));
        xhr.send(formData);
    }

    if (state === UploaderState.Uploaded) {
        return (
            <div className="border-box">
            <h1>Sharing options</h1>
                <div className="col-12 col-md-10 col-xl-10">
                    <h5 className="ellipse-text"><i>({file[0].name})</i></h5><br />
                </div>
            </div>
        );
    } else {
        return (
            <div className="border-box">
                {
                    state === UploaderState.None &&
                    <>
                        <h1 className="ellipse-text">Upload your file here</h1>
                        <h5 className="ellipse-text"><i>(up to 1Gb)</i></h5>
                    </>
                }
                <div className="col-12 col-md-10 col-xl-10">
                    <Dropzone onDrop={onDrop} multiple={false} disabled={state !== UploaderState.None}>
                        {({ getRootProps, getInputProps }: any) => (
                            <section>
                                {
                                    state === UploaderState.Uploading &&
                                    <div>
                                        <h5 className="ellipse-text"><i>Uploading</i></h5>
                                        <Progress style={{ height: "20px" }} animated color="info" value={progress?.uploadPercent} >
                                            {progress?.uploadText}
                                        </Progress>
                                    </div>
                                }

                                {
                                    state === UploaderState.Saving &&
                                    <div>
                                        <h5 className="ellipse-text"><i>Saving</i></h5>
                                        <Spinner color="warning" type="grow" />
                                    </div>
                                }
                                <br />
                                <div {...getRootProps({ className: 'dropzone' })}>
                                    <input {...getInputProps()} />
                                    {file && file[0].name ? (
                                        <div className="selected-file ellipse-text">
                                            {file && file[0].name}
                                        </div>
                                    ) : (
                                        'Drag and drop file here, or click to select file'
                                    )}
                                </div>
                                <aside className="selected-file-wrapper">
                                    {
                                        state === UploaderState.None &&
                                        <button
                                            className="upload-button"
                                            disabled={!file}
                                            onClick={upload}>
                                            Upload
                                        </button>
                                    }
                                </aside>
                            </section>
                        )}
                    </Dropzone>
                </div>
            </div>
        );
    }
}