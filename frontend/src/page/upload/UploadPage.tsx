import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, UncontrolledTooltip } from 'reactstrap';
import { DefaultToastOptions } from '../../model/RequestBuilder';
import { ROUTES } from '../../model/Routes';
import { Copyright } from '../login/components/CopyrightComponent';
import FileUploader from './components/FileUploaderComponent';
import { UploadPageState } from './model/UploadModels';

export default function UploadPage() {
    const [state, setState] = useState<UploadPageState>(UploadPageState.Initial)
    const [fileMeta, setFileMeta] = useState<any | null>(null)
    const history = useHistory();

    const onFileUploaded = async (uploadMetadata?: any) => {
        if (uploadMetadata) {
            setFileMeta(uploadMetadata)
            setState(UploadPageState.Uploaded)
        }
    }

    const clearHooks = () => {
        setState(UploadPageState.Initial)
        setFileMeta(null)
    }

    const copyFileUrl = async () => {
        if (fileMeta?.link) {
            await navigator.clipboard.writeText(ROUTES.getAnonymousFile(fileMeta?.link));
            toast.info("Link copied to clipboard!", DefaultToastOptions)
        }
    }

    return (
        <div className="container upload-main fade-in">
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
                                        variant="contained"
                                        sx={{ mt: 3, mb: 2 }}
                                        className="primary"
                                        onClick={() => history.push(ROUTES.login)}>
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
                                <div id="fileLink" className="dropzone selected-file" style={{
                                    cursor: "default",
                                    overflowWrap: "break-word"
                                }} onClick={copyFileUrl}>
                                    {ROUTES.getAnonymousFile(fileMeta?.link)}
                                </div>
                                <UncontrolledTooltip
                                    placement="auto"
                                    target="fileLink"
                                >
                                    Copy to clipboard
                                </UncontrolledTooltip>
                            </div>
                            <Button
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                                className="btn-grad"
                                onClick={() => clearHooks()}
                            >
                                Upload another file
                            </Button>
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
        </div >
    );
}