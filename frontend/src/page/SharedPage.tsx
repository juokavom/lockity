import { useState, Dispatch, useEffect } from 'react';
import {
    Button, Modal, ModalHeader, ModalBody
} from 'reactstrap';
import { Autocomplete, Box, TextField } from '@mui/material';
import { ENDPOINTS } from '../model/Server';
import { DefaultToastOptions, RequestBuilder } from '../model/RequestBuilder';
import CustomPagination from '../component/PaginationComponent';
import { toast } from 'react-toastify';
import { ROUTES } from '../model/Routes';
import { useDispatch } from 'react-redux';
import { SharedActionCreators } from '../redux/actionCreators/SharedActionCreators';
import { Action } from '../redux/actionCreators/Action';
import { useTypedSelector } from '../redux/Store';

const ShareAction = {
    Create: "Share file",
    Edit: "Edit share ",
    Delete: "Delete share"
}

export interface ISharedMetadata {
    id: string,
    file: IFileMetadataForSharing,
    user: IUserForSharing
}

interface IShareModalProps {
    shareMetadata: ISharedMetadata,
    callback: (success: boolean) => void
}

interface IFileMetadataForSharing {
    id: string,
    title: string
}

interface IUserForSharing {
    id: string,
    email: string
}

function Create({ callback }: any): JSX.Element {
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


const FetchWithTitlesLike = async (title: string, setFiles: (files: IFileMetadataForSharing[]) => void) => {
    if (title !== "") {
        await new RequestBuilder()
            .withUrl(ENDPOINTS.FILE.getFileMetadataWithTitleLike(title))
            .withMethod('GET')
            .withDefaults()
            .send((response: any) => {
                const files: IFileMetadataForSharing[] = response
                setFiles(files)
            }, () => { })
    }
}

const FetchUsersWithEmailsLike = async (email: string, setUsers: (users: IUserForSharing[]) => void) => {
    if (email !== "") {
        await new RequestBuilder()
            .withUrl(ENDPOINTS.USER.getUserWithEmailLike(email))
            .withMethod('GET')
            .withDefaults()
            .send((response: any) => {
                const users: IUserForSharing[] = response
                setUsers(users)
            }, () => { })
    }
}

function Edit({ shareMetadata, callback }: IShareModalProps): JSX.Element {
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

function Delete({ shareMetadata, callback }: IShareModalProps): JSX.Element {
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

export const SHARED_CHUNK_SIZE = 10

const fetchSharedMetadata = (offset: number, limit: number, selected: number) => async (dispatch: Dispatch<Action>) =>
    await new RequestBuilder()
        .withUrl(ENDPOINTS.SHARED.getSharedMetadataWithOffsetAndLimit(offset, limit))
        .withMethod('GET')
        .withDefaults()
        .send((response: any) => {
            dispatch(SharedActionCreators.setSharedSelected(selected))
            if (response) {
                const shareMetadata: ISharedMetadata[] = response
                dispatch(SharedActionCreators.setSharedMetadata(shareMetadata))
            } else {
                dispatch(SharedActionCreators.setSharedMetadata(null))
            }
        }, () => dispatch(SharedActionCreators.setSharedMetadata(null)))


const fetchSharedMetadataCount = () => async (dispatch: Dispatch<Action>) => {
    await new RequestBuilder()
        .withUrl(ENDPOINTS.SHARED.getSharedMetadataCount)
        .withMethod('GET')
        .withDefaults()
        .send((response: any) => {
            if (response) {
                const sharedAccessCount: { sharedAccessCount: number } = response
                dispatch(SharedActionCreators.setSharedMetadataCount(sharedAccessCount.sharedAccessCount))
            } else {
                dispatch(SharedActionCreators.setSharedMetadataCount(null))
            }
        }, () => dispatch(SharedActionCreators.setSharedMetadataCount(null)))
}

export function SharedPage() {
    const [modalOpen, setModalOpen] = useState(false)
    const [modalData, setModalData] = useState<{
        action: string,
        shareMetadata: ISharedMetadata | null
    } | null>(null)

    const dispatch = useDispatch()
    const sharedState = useTypedSelector((state) => state.sharedReducer)

    useEffect(() => {
        // if (isAuthed) {
        dispatch(fetchSharedMetadataCount())
        dispatch(fetchSharedMetadata(0, SHARED_CHUNK_SIZE, 1))
        // }
    }, [])
    
    const toggleModal = () => {
        setModalOpen(!modalOpen)
    }

    const modalCallback = (success: boolean) => {
        setModalOpen(false)
        if (success) {
            // fetchSharedMetadataCount()
            // fetchSharedMetadata(0, SHARE_CHUNK_SIZE, 1)            
            window.location.replace(ROUTES.sharedPage)
        }
    }

    const selectActionJsx = (): JSX.Element => {
        if (modalData) {
            if (modalData.action === ShareAction.Create) return (<Create {...{ callback: modalCallback }} />);
            else if (modalData.shareMetadata) {
                const modalProps: IShareModalProps = {
                    shareMetadata: modalData.shareMetadata,
                    callback: modalCallback
                }
                switch (modalData.action) {
                    case ShareAction.Edit:
                        return (<Edit {...modalProps} />);
                    case ShareAction.Delete:
                        return (<Delete {...modalProps} />);
                }
            }
        }
        return (<div></div>);
    }

    const SharedFileRow = (shareMeta: ISharedMetadata) => (
        <tr>
            <td>{shareMeta.file.title}</td>
            <td>{shareMeta.user.email}</td>
            <td style={{ textAlign: "center" }}>
                <Button
                    color="primary"
                    outline
                    size="sm"
                    onClick={() => {
                        setModalData({
                            action: ShareAction.Edit,
                            shareMetadata: shareMeta
                        })
                        selectActionJsx()
                        toggleModal()
                    }}
                >
                    Edit
                </Button>
            </td>
            <td style={{ textAlign: "center" }}>
                <Button
                    color="danger"
                    outline
                    size="sm"
                    onClick={() => {
                        setModalData({
                            action: ShareAction.Delete,
                            shareMetadata: shareMeta
                        })
                        selectActionJsx()
                        toggleModal()
                    }}
                >
                    Delete
                </Button>
            </td>
        </tr>
    );

    const SharedRows = () => {
        if (sharedState.sharedMetadatas) {
            return sharedState.sharedMetadatas?.map((shareMeta: ISharedMetadata) => {
                return (
                    <SharedFileRow key={shareMeta.id} {...shareMeta} />
                );
            })
        }
        return null
    }

    return (
        <div className="container">
            <div className="row align-items-center d-flex justify-content-center" style={{ marginBottom: "1rem" }}>
                <Box className="col-8 col-md-6 col-lg-4" component="form" noValidate onSubmit={() => { }} sx={{ mt: 1 }}>
                    <Button outline
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        style={{ color: "#ebf0f", width: "100%" }}
                        onClick={() => {
                            setModalData({
                                action: ShareAction.Create,
                                shareMetadata: null
                            })
                            selectActionJsx()
                            toggleModal()
                        }}>
                        Share File
                    </Button>
                </Box>
            </div>
            <Modal className="container" size="" isOpen={modalOpen} toggle={() => { toggleModal() }}>
                <ModalHeader toggle={() => { toggleModal() }} cssModule={{ 'modal-title': 'w-100 text-center' }}>
                    <div className="d-flex justify-content-center">
                        <p>{modalData?.action}</p>
                    </div>
                </ModalHeader>
                <ModalBody className="row align-items-center d-flex justify-content-center m-2">
                    <div className="col">
                        {selectActionJsx()}
                    </div>
                </ModalBody>
            </Modal>
            {
                sharedState.sharedMetadatas && sharedState.sharedMetadatas.length !== 0 ?
                    <div className="row align-items-center d-flex justify-content-center">
                        <table className="table table-hover table-ellipsis">
                            <thead>
                                <tr>
                                    <th scope="col">File</th>
                                    <th scope="col">User</th>
                                    <th style={{ width: "10%" }}></th>
                                    <th style={{ width: "10%" }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {SharedRows()}
                            </tbody>
                        </table>
                    </div>
                    :
                    <div className="container">
                        <div className="row align-items-center d-flex justify-content-center" style={{ height: "400px" }}>
                            <div className="col-auto">
                                <h5><i>You don't have any shared files</i></h5>
                            </div>
                        </div>
                    </div>
            }
            {
                sharedState.sharedMetadataCount && sharedState.sharedMetadataCount > 0 ? <CustomPagination {...{
                    total: sharedState.sharedMetadataCount,
                    chunkSize: SHARED_CHUNK_SIZE,
                    selected: sharedState.pageSelected,
                    fetchItems: (offset: number, limit: number, selected: number) => dispatch(fetchSharedMetadata(offset, limit, selected))
                }} /> : <div></div>
            }
        </div>
    );
}