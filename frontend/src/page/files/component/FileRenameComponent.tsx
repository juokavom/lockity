import { Box, TextField } from "@mui/material"
import { useState } from "react"
import { toast } from "react-toastify"
import { Button } from "reactstrap"
import { LOADING_TIMEOUT_MS } from "../../../model/Constants"
import { DefaultToastOptions, RequestBuilder } from "../../../model/RequestBuilder"
import { ENDPOINTS } from "../../../model/Server"
import { LoadingSpinner } from "../../main/components/LoadingSpinnerComponent"
import { fileTitleToFormat, IFileModalProps } from "../model/FileModels"

export const FileRename = ({ fileMetadata, callback }: IFileModalProps): JSX.Element => {
    const [format] = useState("." + fileTitleToFormat(fileMetadata.title));
    const [newTitle, setTitle] = useState(fileMetadata.title.replace(format, ''));
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        return newTitle.length > 0 && newTitle + format !== fileMetadata.title;
    }

    const handleSubmit = async (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        await EditFileAction(newTitle, fileMetadata.id);
    }

    const EditFileAction = async (title: string, fileId: string) => {
        setLoading(true)
        await new RequestBuilder()
            .withUrl(ENDPOINTS.FILE.fileTitleWithId(fileId))
            .withMethod('PUT')
            .withDefaults()
            .withBody({
                title: title
            })
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

    return (
        <div className="container">
            <Box className="row align-items-center d-flex justify-content-center"
                component="form" noValidate onSubmit={handleSubmit}>
                {loading && <LoadingSpinner />}
                {!loading &&
                    <>
                        <div className="row align-items-end d-flex justify-content-center">
                            <TextField
                                className="col-10"
                                required
                                defaultValue={newTitle}
                                id="title"
                                label="Title"
                                name="title"
                                variant="standard"
                                onChange={(e: any) => setTitle(e.target.value)}
                            />
                            <TextField
                                className="col-2"
                                disabled={true}
                                value={format}
                                variant="filled"
                            />
                        </div>
                        <div className="selected-file-wrapper">
                            <Button
                                type="submit"
                                variant="contained"
                                className="upload-button"
                                sx={{ mt: 3, mb: 2 }}
                                disabled={!validateForm()}
                            >
                                Save
                            </Button>
                        </div>
                    </>
                }
            </Box>
        </div>
    );
}

