import { useEffect, useState } from 'react';
import { Button, UncontrolledTooltip } from 'reactstrap';
import { toast } from 'react-toastify';
import { ROUTES } from '../model/Routes';
import { RequestBuilder } from '../model/RequestBuilder';
import { ENDPOINTS } from '../model/Server';
import { Copyright } from './login/LoginPage';

export default function Download({ match }: any) {
    const [fileData, setFileData] = useState<{
        title: string,
        link: string
    } | null>(null)
    const id = match.params.id

    const FetchFileData = async () => {
        await new RequestBuilder()
            .withUrl(ENDPOINTS.FILE.fetchDynlinkId(id))
            .withMethod('GET')
            .withDefaults()
            .send((response: any) => {
                setFileData(response)
            },
                () => window.location.replace(ROUTES.upload)
            )
    }

    useEffect(() => { FetchFileData() }, [])

    return (
        <div className="container upload-main">
            <div className="row justify-content-center">
                <div className="upload col-10 col-md-8 col-lg-6">
                    <div className="jumbotron-top">
                        <div>
                            <h1>Welcome to Lockity!</h1>
                            <div>
                                <p>
                                    This is a platform for file storing and sharing. Here you can download
                                    public file which was shared with you.
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
                        fileData &&
                        <div className="border-box">
                            <h1>Download file</h1>
                            <div className="col-12 col-md-10 col-xl-10">
                                <h5 className="ellipse-text"><i>({fileData.title})</i></h5><br />
                                <button
                                    className="upload-button"
                                    onClick={() => { window.location.replace(ENDPOINTS.FILE.downloadDynlinkId(fileData.link)) }}
                                >
                                    Download
                                </button>
                            </div>
                            <button
                                style={{ marginTop: "2rem" }}
                                className="upload-button"
                                onClick={() => { window.location.replace(ROUTES.upload) }}
                            >
                                Upload another file
                            </button>
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