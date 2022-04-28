import { Autocomplete, Box, FormControlLabel, Switch, TextField } from "@mui/material";
import { useState } from "react";
import { toast } from "react-toastify";
import { Button } from "reactstrap";
import { LOADING_TIMEOUT_MS } from "../../../model/Constants";
import { DefaultToastOptions, RequestBuilder } from "../../../model/RequestBuilder";
import { ENDPOINTS } from "../../../model/Server";
import { LoadingSpinner } from "../../main/components/LoadingSpinnerComponent";
import { IFileMetadataForSharing, IUserForSharing } from "../model/SharedModels";
import { FetchUsersWithUsernamesLike, FetchWithTitlesLike } from "../request/SharedRequests";

export function CreateShared({ callback }: any): JSX.Element {
    const [files, setFiles] = useState<IFileMetadataForSharing[]>([]);
    const [users, setUsers] = useState<IUserForSharing[]>([]);
    const [selectedFile, setSelectedFile] = useState<IFileMetadataForSharing | null>(null);
    const [selectedUser, setSelectedUser] = useState<IUserForSharing | null>(null);
    const [canEdit, setCanEdit] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        return selectedFile != null && selectedUser != null;
    }

    const handleSubmit = async (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        await CreateSharedFileAction();
    }

    const CreateSharedFileAction = async () => {
        setLoading(true)
        await new RequestBuilder()
            .withUrl(ENDPOINTS.SHARED.sharedAccess)
            .withMethod('POST')
            .withDefaults()
            .withBody({
                fileId: selectedFile?.id,
                userId: selectedUser?.id,
                canEdit: canEdit
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

    if (loading) {
        return (
            <div className="row align-items-end d-flex justify-content-center">
                <LoadingSpinner />
            </div>
        );
    }
    else {
        return (
            <div className="container">
                <Box className="row align-items-center d-flex justify-content-center"
                    component="form" noValidate onSubmit={handleSubmit}
                >
                    <div className="row align-items-end d-flex justify-content-center">
                        <Autocomplete
                            disablePortal
                            className="col-10"
                            onChange={(event, value) => setSelectedFile(value)}
                            id="file"
                            getOptionLabel={(option: IFileMetadataForSharing) => option.title}
                            options={files}
                            sx={{ width: 300 }}
                            renderInput={(params) =>
                                <TextField {...params}
                                    placeholder="Start typing for files to load"
                                    label="File"
                                    variant="standard"
                                    onChange={(e: any) => FetchWithTitlesLike(e.target.value, (files) => {
                                        setFiles(files)
                                    })}
                                />
                            }
                        />
                        <Autocomplete
                            disablePortal
                            onChange={(event, value) => setSelectedUser(value)}
                            id="user"
                            getOptionLabel={(option: IUserForSharing) => option.publicName}
                            options={users}
                            sx={{ mt: 3, width: 300 }}
                            renderInput={(params) =>
                                <TextField {...params}
                                    placeholder="Start typing for users to load"
                                    label="User"
                                    variant="standard"
                                    onChange={(e: any) => FetchUsersWithUsernamesLike(e.target.value, (users) => {
                                        setUsers(users)
                                    })}
                                />
                            }
                        />
                        <FormControlLabel
                            sx={{ mt: 3, width: 300 }}
                            control={
                                <Switch
                                    checked={canEdit}
                                    onChange={(e: any) => { setCanEdit(!canEdit) }}
                                    name="canEdit"
                                />
                            }
                            label="Can edit"
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
                </Box>
            </div>
        );
    }
}

