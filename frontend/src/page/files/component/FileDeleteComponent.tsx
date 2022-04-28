import { useState } from "react"
import { toast } from "react-toastify"
import { Button } from "reactstrap"
import { LOADING_TIMEOUT_MS } from "../../../model/Constants"
import { DefaultToastOptions, RequestBuilder } from "../../../model/RequestBuilder"
import { ENDPOINTS } from "../../../model/Server"
import { LoadingSpinner } from "../../main/components/LoadingSpinnerComponent"
import { IFileModalProps } from "../model/FileModels"

export const FileDelete = ({ fileMetadata, callback }: IFileModalProps): JSX.Element => {
    const [loading, setLoading] = useState(false);

    const DeleteFileAction = async () => {
        setLoading(true)
        await new RequestBuilder()
            .withUrl(ENDPOINTS.FILE.fileId(fileMetadata.id))
            .withMethod('Delete')
            .withDefaults()
            .send((response: any) => {
                setTimeout(() => {
                    setLoading(false)
                    toast.success(response.message, DefaultToastOptions)
                    callback(true)
                }, LOADING_TIMEOUT_MS)
            }, () => {
                setLoading(false)
                callback(false)
            })
    }

    if (loading) {
        return (
            <div className="container">
                <div className="row align-items-end d-flex justify-content-center">
                    <LoadingSpinner />
                </div>
            </div>
        );
    } else {
        return (
            <div className="container">
                <div className="row align-items-end d-flex justify-content-center">
                    <div className="col-auto">
                        <h3 style={{ textAlign: "center" }}>Are you sure you want to delete this file?</h3>
                    </div>
                </div>
                <div className="row align-items-center d-flex justify-content-center"
                    style={{ marginTop: "20px" }}>
                    <div className="col-4">
                        <Button
                            className="btn btn-danger"
                            style={{ width: "100%" }}
                            sx={{ m: 3 }}
                            onClick={() => DeleteFileAction()}
                        >
                            Yes
                        </Button>
                    </div>
                    <div className="col-4">
                        <Button
                            className="btn btn-secondary"
                            style={{ width: "100%" }}
                            sx={{ m: 3 }}
                            onClick={() => callback(false)}
                        >
                            No
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
}