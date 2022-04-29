import { useState } from 'react';
import Dropzone from 'react-dropzone';
import { toast } from "react-toastify";
import { Progress, Spinner } from 'reactstrap';
import { DefaultToastOptions } from '../../../model/RequestBuilder';
import { ROUTES } from '../../../model/Routes';
import { ENDPOINTS } from '../../../model/Server';
import { User } from '../../../model/User';
import { FileUploaderProps, UploaderState } from '../model/UploadModels';

export default function FileUploader(props: FileUploaderProps) {
    const [file, setFile] = useState<any>()
    const [progress, setProgress] = useState<{
        uploadPercent: number;
        uploadText: string;
    } | null>(null)
    const [state, setState] = useState<UploaderState>(UploaderState.Initial)

    const clearStateHooks = () => {
        setFile(null)
        setProgress(null)
        setState(UploaderState.Initial)
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
                if (String(status).charAt(0) === '2') {
                    toast.success('Your file was uploaded successfully', DefaultToastOptions)
                    if (props.isAuthed) {
                        props.onUpload()
                    } else {
                        const response = JSON.parse(xhr.response)
                        props.onUpload({
                            link: response.link,
                            validUntil: response.validUntil,
                            fileName: file[0].name
                        })
                    }
                } else {
                    props.onError()
                    if (status === 401) {
                        localStorage.removeItem(User.storagename)
                        window.location.replace(ROUTES.login)
                    } else {
                        const response = JSON.parse(xhr.response)
                        toast.error('Upload failed! ' + response.message, DefaultToastOptions)
                    }
                }
                clearStateHooks()
            }
        }

        xhr.open("POST", props.isAuthed ? ENDPOINTS.FILE.file : ENDPOINTS.FILE.fileAnonymous);
        xhr.withCredentials = true;
        xhr.send(formData);
    }

    return (
        <div className="border-box">
            {
                !props.isAuthed && state === UploaderState.Initial &&
                <>
                    <h1 className="ellipse-text">Upload your file here</h1>
                    <h5 className="ellipse-text"><i>(up to 1Gb)</i></h5>
                </>
            }
            {
                props.isAuthed && state === UploaderState.Initial &&
                <>
                    <h3 className="ellipse-text">Upload your file here</h3>
                    <p><i>Be sure your file size does not exceed your storage space</i></p>
                </>
            }
            <div className="col-12 col-md-10 col-xl-10">
                <Dropzone onDrop={onDrop} multiple={false} disabled={state !== UploaderState.Initial}>
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
                                    state === UploaderState.Initial &&
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