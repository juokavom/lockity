import FileUploader, { FileUploadedMetadata } from '../../component/FileUploaderComponent';
import { ROUTES } from '../../model/Routes';
import { Copyright } from '../login/LoginPage';
import { useState } from 'react';
import { UncontrolledTooltip } from 'reactstrap';
import { toast } from 'react-toastify';
import { DefaultToastOptions, RequestBuilder } from '../../model/RequestBuilder';
import { ENDPOINTS } from '../../model/Server';

enum UploadPageState {
    Initial,
    Uploaded
}

function Upload() {
    const [state, setState] = useState<UploadPageState>(UploadPageState.Initial)
    const [fileMeta, setFileMeta] = useState<FileUploadedMetadata | null>(null)
    const [fileLink, setFileLink] = useState<string | null>(null)

    const onFileUploaded = async (uploadMetadata: FileUploadedMetadata) => {
        setFileMeta(uploadMetadata)
        setState(UploadPageState.Uploaded)
        await GenerateLinkAction(uploadMetadata)
    }

    const copyFileUrl = async () => {
        if (fileLink) {
            await navigator.clipboard.writeText(fileLink);
            toast.info("Link copied to clipboard!", DefaultToastOptions)
        }
    }

    const GenerateLinkAction = async (fileMetaData: FileUploadedMetadata) => {
        await new RequestBuilder()
            .withUrl(ENDPOINTS.DYNLINK.generateLink(fileMetaData.fileId, fileMetaData.fileKey))
            .withMethod('POST')
            .withDefaults()
            .send((response: any) => {
                setFileLink(response.fileLink)
            })
    };

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
                                    your file and select sharing method either by a link or email.
                                </p>
                                <div className="float-login">
                                    <button
                                        className="upload-button"
                                        onClick={() => window.location.replace(ROUTES.login)}>
                                        Login
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {
                        state === UploadPageState.Initial &&
                        <FileUploader {...{ onUpload: onFileUploaded }} />
                    }
                    {
                        state === UploadPageState.Uploaded &&
                        <div className="border-box">
                            <h1>Sharing options</h1>
                            <div className="col-12 col-md-10 col-xl-10">
                                <h5 className="ellipse-text"><i>({fileMeta?.fileName})</i></h5><br />
                                <div id="fileLink" className="dropzone selected-file ellipse-text" style={{ cursor: "default" }} onClick={copyFileUrl}>
                                    {fileLink}
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