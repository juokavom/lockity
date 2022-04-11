import { toast } from "react-toastify";
import { Button } from "reactstrap";
import { DefaultToastOptions, RequestBuilder } from "../../../model/RequestBuilder";
import { ENDPOINTS } from "../../../model/Server";
import { IShareModalProps } from "../model/SharedModels";

export function DeleteShared({ shareMetadata, callback }: IShareModalProps): JSX.Element {
    const DeleteFileAction = async () => {
        await new RequestBuilder()
            .withUrl(ENDPOINTS.SHARED.sharedId(shareMetadata.id))
            .withMethod('DELETE')
            .withDefaults()
            .send((response: any) => {
                toast.success(response.message, DefaultToastOptions)
                callback(true)
            }, () => callback(false))
    }

    return (
        <div className="container">
            <div className="row align-items-end d-flex justify-content-center">
                <div className="col-auto">
                    <h3 style={{ textAlign: "center" }}>Are you sure you want to delete this shared access?</h3>
                </div>
            </div>
            <div className="row align-items-end d-flex justify-content-center">
                <div className="col-auto">
                    <p style={{ textAlign: "center" }}><i>{shareMetadata.file.title} & {shareMetadata.user.email}</i></p>
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