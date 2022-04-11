import { Autocomplete, Box, TextField } from "@mui/material";
import { useState } from "react";
import { toast } from "react-toastify";
import { Button } from "reactstrap";
import { DefaultToastOptions, RequestBuilder } from "../../../model/RequestBuilder";
import { ENDPOINTS } from "../../../model/Server";
import { IShareModalProps, IUserForSharing } from "../model/SharedModels";
import { FetchUsersWithEmailsLike } from "../request/SharedRequests";

export function EditShared({ shareMetadata, callback }: IShareModalProps): JSX.Element {
    const [users, setUsers] = useState<IUserForSharing[]>([]);

    const [selectedUser, setSelectedUser] = useState<IUserForSharing | null>(shareMetadata.user);

    const validateForm = () => {
        return selectedUser !== null && shareMetadata.user !== selectedUser;
    }

    const handleSubmit = async (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        await EditSharedFileAction();
    }

    const EditSharedFileAction = async () => {
        await new RequestBuilder()
            .withUrl(ENDPOINTS.SHARED.sharedId(shareMetadata.id))
            .withMethod('PUT')
            .withDefaults()
            .withBody({
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
                    <TextField
                        className="col-10"
                        label="File"
                        variant="standard"
                        disabled={true}
                        id="file"
                        sx={{ width: 275 }}
                        value={shareMetadata.file.title}
                    />
                    <Autocomplete
                        disablePortal
                        onChange={(event, value) => setSelectedUser(value)}
                        id="user"
                        getOptionLabel={(option: IUserForSharing) => option.email}
                        options={users}
                        sx={{ mt: 3, width: 300 }}
                        defaultValue={shareMetadata.user}
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