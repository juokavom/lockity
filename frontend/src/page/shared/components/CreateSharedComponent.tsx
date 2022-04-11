import { Autocomplete, Box, TextField } from "@mui/material";
import { useState } from "react";
import { toast } from "react-toastify";
import { Button } from "reactstrap";
import { DefaultToastOptions, RequestBuilder } from "../../../model/RequestBuilder";
import { ENDPOINTS } from "../../../model/Server";
import { IFileMetadataForSharing, IUserForSharing } from "../model/SharedModels";
import { FetchUsersWithEmailsLike, FetchWithTitlesLike } from "../request/SharedRequests";

export function CreateShared({ callback }: any): JSX.Element {
    const [files, setFiles] = useState<IFileMetadataForSharing[]>([]);
    const [users, setUsers] = useState<IUserForSharing[]>([]);
    const [selectedFile, setSelectedFile] = useState<IFileMetadataForSharing | null>(null);
    const [selectedUser, setSelectedUser] = useState<IUserForSharing | null>(null);

    const validateForm = () => {
        return selectedFile != null && selectedUser != null;
    }

    const handleSubmit = async (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        await CreateSharedFileAction();
    }

    const CreateSharedFileAction = async () => {
        await new RequestBuilder()
            .withUrl(ENDPOINTS.SHARED.sharedAccess)
            .withMethod('POST')
            .withDefaults()
            .withBody({
                fileId: selectedFile?.id,
                userId: selectedUser?.id
            })
            .send((response: any) => {
                toast.success(response.message, DefaultToastOptions)
                callback(true)
            }, () => callback(false))
    }

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
                        getOptionLabel={(option: IUserForSharing) => option.email}
                        options={users}
                        sx={{ mt: 3, width: 300 }}
                        renderInput={(params) =>
                            <TextField {...params}
                                placeholder="Start typing for users to load"
                                label="User"
                                variant="standard"
                                onChange={(e: any) => FetchUsersWithEmailsLike(e.target.value, (users) => {
                                    setUsers(users)
                                })}
                            />
                        }
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

