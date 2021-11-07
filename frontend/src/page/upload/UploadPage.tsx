import './Upload.scss';
import UploadFiles from '../../component/FileUploaderComponent';
import { ROUTES } from '../../model/Routes';
import { Copyright } from '../login/LoginPage';


function Upload() {
    return (
        <div className="container center-main">
            <div className="row justify-content-center">
                <div className="mainbox col-10 col-md-8 col-lg-6">
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
                                        onClick={() => window.location.replace(ROUTES.login)}
                                    >
                                        Login
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="border-box">
                        <h1 className="ellipse-text">Upload your file here</h1>
                        <h5 className="ellipse-text"><i>(up to 1Gb)</i></h5><br />
                        <div className="col-12 col-md-10 col-xl-8">
                            <UploadFiles />
                        </div>
                    </div>
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