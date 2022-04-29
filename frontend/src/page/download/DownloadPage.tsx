import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Button } from 'reactstrap';
import { __String } from 'typescript';
import { RequestBuilder } from '../../model/RequestBuilder';
import { ROUTES } from '../../model/Routes';
import { ENDPOINTS } from '../../model/Server';
import { Copyright } from '../login/components/CopyrightComponent';
import { LoadingSpinner } from '../main/components/LoadingSpinnerComponent';

export default function DownloadPage({ match }: any) {
    const [fileData, setFileData] = useState<{
        title: string,
        link: string,
        validUntil: string
    } | null>(null)
    const id = match.params.id
    const history = useHistory();
    const [loading, setLoading] = useState(false);

    const FetchFileData = async () => {
        setLoading(true)
        await new RequestBuilder()
            .withUrl(ENDPOINTS.FILE.fetchDynlinkId(id))
            .withMethod('GET')
            .withDefaults()
            .send((response: any) => {
                setFileData(response)
                setLoading(false)
            },
                () => {
                    setLoading(false)
                    history.push(ROUTES.upload)
                }
            )
    }

    useEffect(() => {
        FetchFileData()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
                                        onClick={() => history.push(ROUTES.login)}>
                                        Login
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {
                        loading && <LoadingSpinner />
                    }
                    {
                        !loading && fileData &&
                        <div className="border-box">
                            <h1>Download file</h1>
                            <div className="col-12 col-md-10 col-xl-10">
                                <h5 className="ellipse-text"><i>({fileData.title})</i></h5>
                                <p className="ellipse-text"><i>File is available until {new Date(fileData?.validUntil).toISOString().split('T')[0]}</i></p><br />
                                <button
                                    className="upload-button"
                                    onClick={() => { window.location.replace(ENDPOINTS.FILE.downloadDynlinkId(fileData.link)) }}
                                >
                                    Download
                                </button>
                            </div>
                            <br />
                            <button
                                className="btn-grad"
                                onClick={() => { history.push(ROUTES.upload) }}
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