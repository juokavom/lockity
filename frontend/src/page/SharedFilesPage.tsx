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
import { IMyFilesProps, ISharedProps } from './main/MainPage';
import { ENDPOINTS, SUPPORTED_FILE_TYPES } from '../model/Server';
import { DefaultToastOptions, RequestBuilder } from '../model/RequestBuilder';
import FileUploader, { FileUploadedMetadata } from '../component/FileUploaderComponent';
import CustomPagination from '../component/PaginationComponent';
import { toast } from 'react-toastify';
import { ROUTES } from '../model/Routes';
import { ProgressBar } from 'react-toastify/dist/components';
import { ColorizeOutlined } from '@mui/icons-material';


// export interface IReceiver {
//     id: string,
//     email: string
// }

// export interface ISharable {
//     id: string,
//     title: string
// }

// interface IShareFileProps {
//     shareMetadata: IShareMetadata,
//     action: (action: string) => void
// }

// export interface IFileState {
//     fileMetadata: IFileMetadata[] | null,
//     fileCount: number | null,
//     selected: number
// }

// interface IModalProps {
//     fileMetadata: IFileMetadata,
//     callback: (success: boolean) => void
// }

const ShareAction = {
    Create: "Share file",
    Edit: "Edit share ",
    Delete: "Delete share"
}

// function formatBytes(bytes: number, decimals = 2) {
//     if (bytes === 0) return '0 Bytes';

//     const k = 1024;
//     const dm = decimals < 0 ? 0 : decimals;
//     const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

//     const i = Math.floor(Math.log(bytes) / Math.log(k));

//     return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
// }

// function File({ fileMetadata, changedLayout, action }: IFileProps) {
//     const format = fileMetadata.title.split('.').pop();

//     const buttons = (
//         <>
//             <div className="col-auto">
//                 <IconButton onClick={() => action(FileAction.Edit)}>
//                     <EditOutlinedIcon />
//                 </IconButton>
//             </div>
//             <div className="col-auto">
//                 {format && SUPPORTED_FILE_TYPES.includes(format) ?
//                     <IconButton onClick={() => action(FileAction.Preview)}>
//                         <VisibilityOutlinedIcon />
//                     </IconButton> :
//                     <IconButton disabled  >
//                         <VisibilityOffOutlinedIcon />
//                     </IconButton>
//                 }
//             </div>
//             <div className="col-auto">
//                 <IconButton href={ENDPOINTS.FILE.downloadWithFileId(fileMetadata.id)}>
//                     <GetAppOutlinedIcon />
//                 </IconButton>
//             </div>
//             <div className="col-auto">
//                 <IconButton onClick={() => action(FileAction.Share)}>
//                     <ShareOutlinedIcon />
//                 </IconButton>
//             </div>
//             <div className="col-auto">
//                 <IconButton onClick={() => action(FileAction.Delete)}>
//                     <DeleteOutlineOutlinedIcon />
//                 </IconButton>
//             </div>
//         </>
//     );


//     return (
//         <div className="file container" >
//             <div className="row align-items-center d-flex justify-content-center">
//                 <div className="col col-lg-4 ellipse-text d-flex justify-content-center">
//                     <p className="ellipse-text" style={{ maxWidth: "400px" }}>{fileMetadata.title}</p>
//                 </div>
//                 <div className="col-4 col-lg-2 d-flex justify-content-center">
//                     {formatBytes(fileMetadata.size)}
//                 </div>
//                 {!changedLayout && buttons}
//             </div>
//             {changedLayout &&
//                 <div className="row align-items-center d-flex justify-content-center">
//                     {buttons}
//                 </div>
//             }
//         </div>
//     );
// }

export interface IShareMetadata {
    id: string,
    file: IFileMetadataForSharing,
    user: IUserForSharing
}

interface IShareModalProps {
    shareMetadata: IShareMetadata,
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
                toast.success('File was shared successfully', DefaultToastOptions)
                callback(true)
            }, () => callback(false))
    }


    const FetchWithTitlesLike = async (title: string) => {
        if (title != "") {
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

    const FetchUsersWithEmailsLike = async (email: string) => {
        if (email != "") {
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
                                onChange={(e: any) => FetchWithTitlesLike(e.target.value)}
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
                                onChange={(e: any) => FetchUsersWithEmailsLike(e.target.value)}
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

// const fileNameJsx = (title: string) => (
//     <Typography sx={{ mb: 2 }} className="ellipse-text" align="center" component="h1" variant="h5">
//         {title}
//     </Typography>
// );

// function Preview({ fileMetadata, callback }: IModalProps): JSX.Element {
//     const [format] = useState(fileMetadata.title.split('.').pop());

//     const src = ENDPOINTS.FILE.streamWithFileId(fileMetadata.id)

//     const videoJsx = () => (
//         <video style={{ maxWidth: "100%" }} controls controlsList="nodownload nofullscreen">
//             <source src={src} type="video/mp4" />
//         </video>
//     );

//     const audioJsx = () => (
//         <audio style={{ maxWidth: "100%" }} controls controlsList="nodownload nofullscreen">
//             <source src={src} type="audio/mpeg" />
//         </audio>
//     );

//     const pictureJsx = () => (
//         <img style={{ maxWidth: "100%" }} src={src} />
//     );

//     let selected = null

//     if (format) {
//         if (format == "mp4") {
//             selected = videoJsx()
//         } else if (format == "mp3") {
//             selected = audioJsx()
//         } else if (["png", "jpg", "jpeg"].includes(format)) {
//             selected = pictureJsx()
//         }
//     }

//     if (selected != null) {
//         return (
//             <div className="row align-items-end d-flex justify-content-center">
//                 <div className="row align-items-end d-flex justify-content-center">
//                     <div className="col-auto">
//                         {fileNameJsx(fileMetadata.title)}
//                     </div>
//                 </div>
//                 <div className="row align-items-end d-flex justify-content-center">
//                     <div className="col-auto">
//                         {selected}
//                     </div>
//                 </div>
//             </div>
//         );
//     } else {
//         return (<div></div>);
//     }
// }

// function Share({ fileMetadata, callback }: IModalProps): JSX.Element {
//     const [link] = useState(fileMetadata.link);

//     const copyFileUrl = async () => {
//         if (link) {
//             await navigator.clipboard.writeText(ROUTES.getAnonymousFile(link));
//             toast.info("Link copied to clipboard!", DefaultToastOptions)
//         }
//     }

//     const ShareFileAction = async (condition: boolean) => {
//         await new RequestBuilder()
//             .withUrl(ENDPOINTS.FILE.shareConditionWithFileId(fileMetadata.id, condition))
//             .withMethod('PUT')
//             .withDefaults()
//             .send((response: any) => {
//                 toast.success(response.message, DefaultToastOptions)
//                 callback(true)
//             }, () => callback(false))
//     }

//     if (link) {
//         return (
//             <div className="row align-items-end d-flex justify-content-center">
//                 <div className="row align-items-end d-flex justify-content-center">
//                     <div className="col-auto">
//                         {fileNameJsx(fileMetadata.title)}
//                     </div>
//                 </div>
//                 <div className="col-auto">
//                     <p style={{ textAlign: "center" }}><i>File is being shared. Proceed to the link
//                         in the box to download your file anonymously. Press 'Unshare' to
//                         disable this feature.</i></p>
//                 </div>
//                 <div className="col-auto">
//                     <div id="fileLink" className="dropzone selected-file" style={{
//                         marginTop: "20px",
//                         cursor: "default"
//                     }} onClick={copyFileUrl}>
//                         {ROUTES.getAnonymousFile(link)}
//                     </div>
//                     <UncontrolledTooltip
//                         placement="auto"
//                         target="fileLink"
//                     >
//                         Copy to clipboard
//                     </UncontrolledTooltip>
//                 </div>
//                 <div className="selected-file-wrapper">
//                     <Button
//                         variant="contained"
//                         className="upload-button"
//                         sx={{ mt: 1, mb: 2 }}
//                         onClick={() => ShareFileAction(false)}
//                     >
//                         Unshare
//                     </Button>
//                 </div>
//             </div>
//         );
//     } else {
//         return (
//             <div className="row align-items-center d-flex justify-content-center">
//                 <div className="row align-items-center d-flex justify-content-center">
//                     <div className="col-auto">
//                         {fileNameJsx(fileMetadata.title)}
//                     </div>
//                 </div>
//                 <div className="col-auto">
//                     <p style={{ textAlign: "center" }}><i>File is not shared. Press 'Share' to generate dynamic
//                         link and share your file with the world!</i></p>
//                 </div>
//                 <div className="selected-file-wrapper">
//                     <Button
//                         variant="contained"
//                         className="upload-button"
//                         sx={{ mt: 1, mb: 2 }}
//                         onClick={() => ShareFileAction(true)}
//                     >
//                         Share
//                     </Button>
//                 </div>
//             </div>
//         );
//     }

// }

// function Delete({ fileMetadata, callback }: IModalProps): JSX.Element {
//     const DeleteFileAction = async () => {
//         await new RequestBuilder()
//             .withUrl(ENDPOINTS.FILE.fileId(fileMetadata.id))
//             .withMethod('Delete')
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
//                     <h3 style={{ textAlign: "center" }}>Are you sure you want to delete this file?</h3>
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

export const SHARE_CHUNK_SIZE = 10

export function SharedFiles({ sharedMetadata, sharedCount, selected,
    fetchSharedMetadata, fetchSharedMetadataCount }: ISharedProps) {
    const [modalOpen, setModalOpen] = useState(false)

    // const [modalOpen, setModalOpen] = useState(false)
    // const [modalData, setModalData] = useState<{
    //     action: string,
    //     fileMetadata: IFileMetadata | null
    // } | null>(null)

    // const modalCallback = (success: boolean) => {
    //     setModalOpen(false)
    //     if (success) {
    //         fetchFileMetadataInfo()
    //         fetchFileMetadata(0, FILE_CHUNK_SIZE, 1)
    //     }
    // }

    // const toggleModal = () => {
    //     setModalOpen(!modalOpen)
    // }

    // function Upload() {
    //     return (
    //         <FileUploader {...{
    //             isAuthed: true, onUpload: () => modalCallback(true),
    //             onError: () => modalCallback(false)
    //         }} />
    //     );
    // }

    // const selectActionJsx = (): JSX.Element => {
    //     if (modalData) {
    //         if (modalData.action == FileAction.Upload) return (<Upload />);
    //         else if (modalData.fileMetadata) {
    //             const modalProps: IModalProps = {
    //                 fileMetadata: modalData.fileMetadata,
    //                 callback: modalCallback
    //             }
    //             switch (modalData.action) {
    //                 case FileAction.Edit:
    //                     return (<Edit {...modalProps} />);
    //                 case FileAction.Preview:
    //                     return (<Preview {...modalProps} />);
    //                 case FileAction.Share:
    //                     return (<Share {...modalProps} />);
    //                 case FileAction.Delete:
    //                     return (<Delete {...modalProps} />);
    //             }
    //         }
    //     }
    //     return (<div></div>);
    // }

    // const props = (fileMetadata: IFileMetadata): IFileProps => {
    //     return {
    //         fileMetadata: fileMetadata,
    //         changedLayout: changedLayout,
    //         action: (action: string) => {
    //             setModalData({
    //                 action: action,
    //                 fileMetadata: fileMetadata
    //             })
    //             toggleModal()
    //         }
    //     }
    // }

    const [modalData, setModalData] = useState<{
        action: string,
        shareMetadata: IShareMetadata | null
    } | null>(null)

    const toggleModal = () => {
        setModalOpen(!modalOpen)
    }

    const modalCallback = (success: boolean) => {
        setModalOpen(false)
        if (success) {
            fetchSharedMetadataCount()
            fetchSharedMetadata(0, SHARE_CHUNK_SIZE, 1)
        }
    }

    const selectActionJsx = (): JSX.Element => {
        if (modalData) {
            if (modalData.action == ShareAction.Create) return (<Create {...{ callback: modalCallback }} />);
            else if (modalData.shareMetadata) {
                const modalProps: IShareModalProps = {
                    shareMetadata: modalData.shareMetadata,
                    callback: modalCallback
                }
                switch (modalData.action) {
                    case ShareAction.Edit:
                    // return (<Edit {...modalProps} />);
                    case ShareAction.Delete:
                    // return (<Delete {...modalProps} />);
                }
            }
        }
        return (<div></div>);
    }

    const SharedFileRow = (shareMeta: IShareMetadata) => (
        <tr>
            <td>{shareMeta.file.title}</td>
            <td>{shareMeta.user.email}</td>
            <td style={{ textAlign: "center" }}>Edit</td>
            <td style={{ textAlign: "center" }}>Delete</td>
        </tr>
    );

    const SharedRows = () => {
        if (sharedMetadata) {
            return sharedMetadata?.map((shareMeta: IShareMetadata) => {
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
                sharedMetadata && sharedMetadata.length != 0 ?
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
                sharedCount && sharedCount > 0 ? <CustomPagination {...{
                    total: sharedCount,
                    chunkSize: SHARE_CHUNK_SIZE,
                    selected: selected,
                    fetchItems: fetchSharedMetadata
                }} /> : <div></div>
            }
        </div>
    );
}