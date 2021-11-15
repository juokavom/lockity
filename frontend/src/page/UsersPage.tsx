import React, { Component, Dispatch, SetStateAction, useEffect, useState } from 'react';
import {
    Navbar, NavbarBrand, Nav, NavbarToggler, Collapse, NavItem,
    Button, Modal, ModalHeader, ModalBody, FormGroup, Label, Form, Input,
    Dropdown, DropdownToggle, DropdownItem, DropdownMenu, Tooltip, UncontrolledTooltip, Progress, Table
} from 'reactstrap';
import { NavLink } from 'react-router-dom';
import { User } from '../model/User';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import GetAppOutlinedIcon from '@mui/icons-material/GetAppOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { Autocomplete, Box, IconButton, Pagination, TextField, Typography } from '@mui/material';
import { IMyFilesProps, ISharedProps, IUserProps } from './main/MainPage';
import { ENDPOINTS, SUPPORTED_FILE_TYPES } from '../model/Server';
import { DefaultToastOptions, RequestBuilder } from '../model/RequestBuilder';
import FileUploader, { FileUploadedMetadata } from '../component/FileUploaderComponent';
import CustomPagination from '../component/PaginationComponent';
import { toast } from 'react-toastify';
import { ROUTES } from '../model/Routes';
import { ProgressBar } from 'react-toastify/dist/components';
import { ColorizeOutlined } from '@mui/icons-material';

const UserAction = {
    Create: "Create user",
    Edit: "Edit user",
    Delete: "Delete user"
}

interface IUserModalProps {
    user: IUserData,
    callback: (success: boolean) => void
}

export interface IUserData {
    id: string,
    name: string | null,
    surname: string | null,
    email: string,
    password: string | null,
    role: User.Role,
    registered: Date,
    lastActive: Date | null,
    confirmed: boolean,
    subscribed: boolean,
    storageSize: number
}

// function Create({ callback }: any): JSX.Element {
//     const [files, setFiles] = useState<IFileMetadataForSharing[]>([]);
//     const [users, setUsers] = useState<IUserForSharing[]>([]);
//     const [selectedFile, setSelectedFile] = useState<IFileMetadataForSharing | null>(null);
//     const [selectedUser, setSelectedUser] = useState<IUserForSharing | null>(null);

//     const validateForm = () => {
//         return selectedFile != null && selectedUser != null;
//     }

//     const handleSubmit = async (event: { preventDefault: () => void; }) => {
//         event.preventDefault();
//         await CreateSharedFileAction();
//     }

//     const CreateSharedFileAction = async () => {
//         await new RequestBuilder()
//             .withUrl(ENDPOINTS.SHARED.sharedAccess)
//             .withMethod('POST')
//             .withDefaults()
//             .withBody({
//                 fileId: selectedFile?.id,
//                 userId: selectedUser?.id
//             })
//             .send((response: any) => {
//                 toast.success(response.message, DefaultToastOptions)
//                 callback(true)
//             }, () => callback(false))
//     }

//     return (
//         <div className="container">
//             <Box className="row align-items-center d-flex justify-content-center"
//                 component="form" noValidate onSubmit={handleSubmit}
//             >
//                 <div className="row align-items-end d-flex justify-content-center">
//                     <Autocomplete
//                         disablePortal
//                         className="col-10"
//                         onChange={(event, value) => setSelectedFile(value)}
//                         id="file"
//                         getOptionLabel={(option: IFileMetadataForSharing) => option.title}
//                         options={files}
//                         sx={{ width: 300 }}
//                         renderInput={(params) =>
//                             <TextField {...params}
//                                 placeholder="Start typing for files to load"
//                                 label="File"
//                                 variant="standard"
//                                 onChange={(e: any) => FetchWithTitlesLike(e.target.value, (files) => {
//                                     setFiles(files)
//                                 })}
//                             />
//                         }
//                     />
//                     <Autocomplete
//                         disablePortal
//                         onChange={(event, value) => setSelectedUser(value)}
//                         id="user"
//                         getOptionLabel={(option: IUserForSharing) => option.email}
//                         options={users}
//                         sx={{ mt: 3, width: 300 }}
//                         renderInput={(params) =>
//                             <TextField {...params}
//                                 placeholder="Start typing for users to load"
//                                 label="User"
//                                 variant="standard"
//                                 onChange={(e: any) => FetchUsersWithEmailsLike(e.target.value, (users) => {
//                                     setUsers(users)
//                                 })}
//                             />
//                         }
//                     />
//                 </div>
//                 <div className="selected-file-wrapper">
//                     <Button
//                         type="submit"
//                         variant="contained"
//                         className="upload-button"
//                         sx={{ mt: 3, mb: 2 }}
//                         disabled={!validateForm()}
//                     >
//                         Save
//                     </Button>
//                 </div>
//             </Box>
//         </div>
//     );
// }


// const FetchWithTitlesLike = async (title: string, setFiles: (files: IFileMetadataForSharing[]) => void) => {
//     if (title != "") {
//         await new RequestBuilder()
//             .withUrl(ENDPOINTS.FILE.getFileMetadataWithTitleLike(title))
//             .withMethod('GET')
//             .withDefaults()
//             .send((response: any) => {
//                 const files: IFileMetadataForSharing[] = response
//                 setFiles(files)
//             }, () => { })
//     }
// }

// const FetchUsersWithEmailsLike = async (email: string, setUsers: (users: IUserForSharing[]) => void) => {
//     if (email != "") {
//         await new RequestBuilder()
//             .withUrl(ENDPOINTS.USER.getUserWithEmailLike(email))
//             .withMethod('GET')
//             .withDefaults()
//             .send((response: any) => {
//                 const users: IUserForSharing[] = response
//                 setUsers(users)
//             }, () => { })
//     }
// }

// function Edit({ shareMetadata, callback }: IShareModalProps): JSX.Element {
//     const [users, setUsers] = useState<IUserForSharing[]>([]);

//     const [selectedUser, setSelectedUser] = useState<IUserForSharing | null>(shareMetadata.user);

//     const validateForm = () => {
//         return selectedUser != null && shareMetadata.user != selectedUser;
//     }

//     const handleSubmit = async (event: { preventDefault: () => void; }) => {
//         event.preventDefault();
//         await EditSharedFileAction();
//     }

//     const EditSharedFileAction = async () => {
//         await new RequestBuilder()
//             .withUrl(ENDPOINTS.SHARED.sharedId(shareMetadata.id))
//             .withMethod('PUT')
//             .withDefaults()
//             .withBody({
//                 userId: selectedUser?.id
//             })
//             .send((response: any) => {
//                 toast.success(response.message, DefaultToastOptions)
//                 callback(true)
//             }, () => callback(false))
//     }

//     return (
//         <div className="container">
//             <Box className="row align-items-center d-flex justify-content-center"
//                 component="form" noValidate onSubmit={handleSubmit}
//             >
//                 <div className="row align-items-end d-flex justify-content-center">
//                     <TextField
//                         className="col-10"
//                         label="File"
//                         variant="standard"
//                         disabled={true}
//                         id="file"
//                         sx={{ width: 275 }}
//                         value={shareMetadata.file.title}
//                     />
//                     <Autocomplete
//                         disablePortal
//                         onChange={(event, value) => setSelectedUser(value)}
//                         id="user"
//                         getOptionLabel={(option: IUserForSharing) => option.email}
//                         options={users}
//                         sx={{ mt: 3, width: 300 }}
//                         defaultValue={shareMetadata.user}
//                         renderInput={(params) =>
//                             <TextField {...params}
//                                 placeholder="Start typing for users to load"
//                                 label="User"
//                                 variant="standard"
//                                 onChange={(e: any) => FetchUsersWithEmailsLike(e.target.value, (users) => {
//                                     setUsers(users)
//                                 })}
//                             />
//                         }
//                     />
//                 </div>
//                 <div className="selected-file-wrapper">
//                     <Button
//                         type="submit"
//                         variant="contained"
//                         className="upload-button"
//                         sx={{ mt: 3, mb: 2 }}
//                         disabled={!validateForm()}
//                     >
//                         Save
//                     </Button>
//                 </div>
//             </Box>
//         </div>
//     );
// }

// function Delete({ shareMetadata, callback }: IShareModalProps): JSX.Element {
//     const DeleteFileAction = async () => {
//         await new RequestBuilder()
//             .withUrl(ENDPOINTS.SHARED.sharedId(shareMetadata.id))
//             .withMethod('DELETE')
//             .withDefaults()
//             .send((response: any) => {
//                 toast.success(response.message, DefaultToastOptions)
//                 callback(true)
//             }, () => callback(false))
//     }

//     return (
//         <div className="container">
//             <div className="row align-items-end d-flex justify-content-center">
//                 <div className="col-auto">
//                     <h3 style={{ textAlign: "center" }}>Are you sure you want to delete this shared access?</h3>
//                 </div>
//             </div>
//             <div className="row align-items-end d-flex justify-content-center">
//                 <div className="col-auto">
//                     <p style={{ textAlign: "center" }}><i>{shareMetadata.file.title} & {shareMetadata.user.email}</i></p>
//                 </div>
//             </div>
//             <div className="row align-items-center d-flex justify-content-center"
//                 style={{ marginTop: "20px" }}>
//                 <div className="col-4">
//                     <Button
//                         className="btn btn-danger"
//                         style={{ width: "100%" }}
//                         sx={{ m: 3 }}
//                         onClick={() => DeleteFileAction()}
//                     >
//                         Yes
//                     </Button>
//                 </div>
//                 <div className="col-4">
//                     <Button
//                         className="btn btn-secondary"
//                         style={{ width: "100%" }}
//                         sx={{ m: 3 }}
//                         onClick={() => callback(false)}
//                     >
//                         No
//                     </Button>
//                 </div>
//             </div>
//         </div>
//     );
// }

export const USER_CHUNK_SIZE = 10

export function Users({ userData, userCount, selected,
    fetchUserData, fetchUserCount }: IUserProps) {
    const [modalOpen, setModalOpen] = useState(false)

    const [modalData, setModalData] = useState<{
        action: string,
        userData: IUserData | null
    } | null>(null)

    const toggleModal = () => {
        setModalOpen(!modalOpen)
    }

    const modalCallback = (success: boolean) => {
        setModalOpen(false)
        if (success) {
            // fetchSharedMetadataCount()
            // fetchSharedMetadata(0, SHARE_CHUNK_SIZE, 1)            
            window.location.replace(ROUTES.users)
        }
    }

    const selectActionJsx = (): JSX.Element => {
        /*
        if (modalData) {
            if (modalData.action == UserAction.Create) return (<Create {...{ callback: modalCallback }} />);
            else if (modalData.userData) {
                const modalProps: IUserModalProps = {
                    user: modalData.userData,
                    callback: modalCallback
                }
                switch (modalData.action) {
                    case UserAction.Edit:
                        return (<Edit {...modalProps} />);
                    case UserAction.Delete:
                        // return (<Delete {...modalProps} />);
                }
            }
        }
            */
        return (<div></div>);
    }

    const UserFileRow = (userData: IUserData) => (
        <tr>
            <td>{userData.email}</td>
            <td>{userData.role}</td>
            <td style={{ textAlign: "center" }}>
                <Button
                    color="primary"
                    outline
                    size="sm"
                    onClick={() => {
                        setModalData({
                            action: UserAction.Edit,
                            userData: userData
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
                            action: UserAction.Delete,
                            userData: userData
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

    const UserRows = () => {
        if (userData) {
            return userData?.map((uData: IUserData) => {
                return (
                    <UserFileRow key={uData.id} {...uData} />
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
                                action: UserAction.Create,
                                userData: null
                            })
                            selectActionJsx()
                            toggleModal()
                        }}>
                        Create user
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
                userData && userData.length != 0 ?
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
                                {UserRows()}
                            </tbody>
                        </table>
                    </div>
                    :
                    <div className="container">
                        <div className="row align-items-center d-flex justify-content-center" style={{ height: "400px" }}>
                            <div className="col-auto">
                                <h5><i>There are no users</i></h5>
                            </div>
                        </div>
                    </div>
            }
            {
                userCount && userCount > 0 ? <CustomPagination {...{
                    total: userCount,
                    chunkSize: USER_CHUNK_SIZE,
                    selected: selected,
                    fetchItems: fetchUserData
                }} /> : <div></div>
            }
        </div>
    );
}