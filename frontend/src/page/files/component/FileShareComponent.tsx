import { useState } from "react"
import { useDispatch } from "react-redux"
import { toast } from "react-toastify"
import { Button, UncontrolledTooltip } from "reactstrap"
import { LOADING_TIMEOUT_MS } from "../../../model/Constants"
import { DefaultToastOptions, RequestBuilder } from "../../../model/RequestBuilder"
import { ROUTES } from "../../../model/Routes"
import { ENDPOINTS } from "../../../model/Server"
import { LoadingSpinner } from "../../main/components/LoadingSpinnerComponent"
import { IFileModalProps } from "../model/FileModels"
import { fileNameTsx } from "../model/FileNameTsx"
import { FileActionCreators } from "../redux/FileActionCreators"

export const FileShare = ({ fileMetadata, callback }: IFileModalProps): JSX.Element => {
    const [link, setLink] = useState<string | null>(fileMetadata.link);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch()

    const copyFileUrl = async () => {
        if (link) {
            await navigator.clipboard.writeText(ROUTES.getAnonymousFile(link));
            toast.info("Link copied to clipboard!", DefaultToastOptions)
        }
    }

    const ShareFileAction = async (condition: boolean) => {
        setLoading(true)
        await new RequestBuilder()
            .withUrl(ENDPOINTS.FILE.shareConditionWithFileId(fileMetadata.id, condition))
            .withMethod('PUT')
            .withDefaults()
            .send((response: any) => {
                setTimeout(() => {
                    setLoading(false)
                    toast.success(response.message, DefaultToastOptions)
                    setLink(response.fileLink)
                    fileMetadata.link = response.fileLink
                    dispatch(FileActionCreators.editFileShareLink(fileMetadata))
                }, LOADING_TIMEOUT_MS)
            }, () => {
                setLink(null)
                setLoading(false)
            }
            )
    }

    if (loading) {
        return (
            <div className="row align-items-end d-flex justify-content-center">
                <LoadingSpinner />
            </div>
        );
    }
    else if (link) {
        return (
            <div className="row align-items-end d-flex justify-content-center">
                <div className="row align-items-end d-flex justify-content-center">
                    <div className="col-auto">
                        {fileNameTsx(fileMetadata.title)}
                    </div>
                </div>
                <div className="col-auto">
                    <p style={{ textAlign: "center" }}><i>File is being shared. Proceed to the link
                        in the box to download your file anonymously. Press 'Unshare' to
                        disable this feature.</i></p>
                </div>
                <div className="col-auto">
                    <div id="fileLink" className="dropzone selected-file" style={{
                        marginTop: "20px",
                        cursor: "default"
                    }} onClick={copyFileUrl}>
                        {ROUTES.getAnonymousFile(link)}
                    </div>
                    <UncontrolledTooltip
                        placement="auto"
                        target="fileLink"
                    >
                        Copy to clipboard
                    </UncontrolledTooltip>
                </div>
                <div className="selected-file-wrapper">
                    <Button
                        variant="contained"
                        className="upload-button"
                        sx={{ mt: 1, mb: 2 }}
                        onClick={() => ShareFileAction(false)}
                    >
                        Unshare
                    </Button>
                </div>
            </div>
        );
    } else {
        return (
            <div className="row align-items-center d-flex justify-content-center">
                <div className="row align-items-center d-flex justify-content-center">
                    <div className="col-auto">
                        {fileNameTsx(fileMetadata.title)}
                    </div>
                </div>
                <div className="col-auto">
                    <p style={{ textAlign: "center" }}><i>File is not shared. Press 'Share' to generate dynamic
                        link and share your file with the world!</i></p>
                </div>
                <div className="selected-file-wrapper">
                    <Button
                        variant="contained"
                        className="upload-button"
                        sx={{ mt: 1, mb: 2 }}
                        onClick={() => ShareFileAction(true)}
                    >
                        Share
                    </Button>
                </div>
            </div>
        );
    }

}