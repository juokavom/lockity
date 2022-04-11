import { useState } from "react"
import { useDispatch } from "react-redux"
import { toast } from "react-toastify"
import { Button, UncontrolledTooltip } from "reactstrap"
import { DefaultToastOptions, RequestBuilder } from "../../../model/RequestBuilder"
import { ROUTES } from "../../../model/Routes"
import { ENDPOINTS } from "../../../model/Server"
import { IFileModalProps } from "../model/FileModels"
import { fileNameTsx } from "../model/FileNameTsx"
import { FileActionCreators } from "../redux/FileActionCreators"

export const FileShare = ({ fileMetadata, callback }: IFileModalProps): JSX.Element => {
    const [link, setLink] = useState<string | null>(fileMetadata.link);
    const dispatch = useDispatch()
    
    const copyFileUrl = async () => {
        if (link) {
            await navigator.clipboard.writeText(ROUTES.getAnonymousFile(link));
            toast.info("Link copied to clipboard!", DefaultToastOptions)
        }
    }

    const ShareFileAction = async (condition: boolean) => {
        await new RequestBuilder()
            .withUrl(ENDPOINTS.FILE.shareConditionWithFileId(fileMetadata.id, condition))
            .withMethod('PUT')
            .withDefaults()
            .send((response: any) => {
                toast.success(response.message, DefaultToastOptions)
                setLink(response.fileLink)
                fileMetadata.link = response.fileLink
                dispatch(FileActionCreators.editFileShareLink(fileMetadata))
            }, () =>
                setLink(null)
            )
    }

    if (link) {
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