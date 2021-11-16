import FileUploader, { FileUploadedMetadata } from '../../component/FileUploaderComponent';
import { ROUTES } from '../../model/Routes';
import { Copyright } from '../login/LoginPage';
import { useState } from 'react';
import { Button, UncontrolledTooltip } from 'reactstrap';
import { toast } from 'react-toastify';
import { DefaultToastOptions, } from '../../model/RequestBuilder';

enum UploadPageState {
    Initial,
    Uploaded
}

function Upload() {
    const [state, setState] = useState<UploadPageState>(UploadPageState.Initial)
    const [fileMeta, setFileMeta] = useState<any | null>(null)

    const onFileUploaded = async (uploadMetadata?: any) => {
        if (uploadMetadata) {
            setFileMeta(uploadMetadata)
            setState(UploadPageState.Uploaded)
        }
    }

    const copyFileUrl = async () => {
        if (fileMeta?.link) {
            await navigator.clipboard.writeText(ROUTES.getAnonymousFile(fileMeta?.link));
            toast.info("Link copied to clipboard!", DefaultToastOptions)
        }
    }

    return (
        <div className="container upload-main">
            <div className="row justify-content-center">
                <div className="upload col-10 col-md-8 col-lg-6">
                    <div className="jumbotron-top">
                        <div>
                            <h1>Welcome to Lockity!</h1>
                            <div>
                                <p>
                                    This is a platform for file storing and sharing. Here you can upload
                                    your file and share it with the world.
                                </p>
                                <div className="float-login" style={{ marginTop: "1rem" }}>
                                    <Button
                                        outline
                                        variant="contained"
                                        sx={{ mt: 3, mb: 2 }}
                                        style={{ color: "#ebf0f" }}
                                        onClick={() => window.location.replace(ROUTES.login)}>
                                        Login
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {
                        state === UploadPageState.Initial &&
                        <FileUploader {...{ isAuthed: false, onUpload: onFileUploaded, onError: () => { } }} />
                    }
                    {
                        state === UploadPageState.Uploaded &&
                        <div className="border-box">
                            <h1>Sharing link</h1>
                            <div className="col-12 col-md-10 col-xl-10">
                                <h5 className="ellipse-text"><i>({fileMeta?.fileName})</i></h5><br />
                                <div id="fileLink" className="dropzone selected-file" style={{ cursor: "default" }} onClick={copyFileUrl}>
                                    {ROUTES.getAnonymousFile(fileMeta?.link)}
                                </div>
                                <UncontrolledTooltip
                                    placement="auto"
                                    target="fileLink"
                                >
                                    Copy to clipboard
                                </UncontrolledTooltip>
                            </div>
                        </div>
                    }
                    <div className="jumbotron-bottom">
                        <p>
                            Please consider signing in to unlock full features of the platform, such as
                            easier file management and playback in browser!
                        </p>
                        <Copyright sx={{ mt: 3 }} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Upload;