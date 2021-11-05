import './Upload.scss';
import UploadFiles from '../../component/FileUploaderComponent';

function Upload() {
    return (
        <div className="container center-main">
            <div className="row justify-content-center">
                <div className="mainbox col-10 col-md-8 col-lg-6">
                    <div className="border-box">
                        <h1 className="ellipse-text">Upload your file here</h1><br />
                        <div className="col-12 col-md-10 col-xl-8">
                            <UploadFiles />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Upload;