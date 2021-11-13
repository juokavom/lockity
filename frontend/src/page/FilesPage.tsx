import React, { Component, Dispatch, SetStateAction, useEffect, useState } from 'react';
import {
    Navbar, NavbarBrand, Nav, NavbarToggler, Collapse, NavItem,
    Button, Modal, ModalHeader, ModalBody, FormGroup, Label, Form, Input,
    Dropdown, DropdownToggle, DropdownItem, DropdownMenu, Tooltip
} from 'reactstrap';
import { NavLink } from 'react-router-dom';
import { User } from '../model/User';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import GetAppOutlinedIcon from '@mui/icons-material/GetAppOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { Box, IconButton, Pagination } from '@mui/material';
import { IMyFilesProps } from './main/MainPage';
import { ENDPOINTS, SUPPORTED_FILE_TYPES } from '../model/Server';
import { RequestBuilder } from '../model/RequestBuilder';
import FileUploader from '../component/FileUploaderComponent';
import CustomPagination from '../component/PaginationComponent';

export interface IFileMetadata {
    id: string,
    title: string,
    size: number,
    link: string | null,
}

interface IFileProps {
    fileMetadata: IFileMetadata,
    changedLayout: Boolean,
    action: (action: FileAction) => void
}

export interface IFileState {    
    fileMetadata: IFileMetadata[] | null,
    fileCount: number| null,
    selected: number
}

enum FileAction {
    Upload,
    Edit,
    Preview,
    Download,
    Share,
    Delete
}

function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function File({ fileMetadata, changedLayout, action }: IFileProps) {
    const format = fileMetadata.title.split('.').pop();
    const [tooltipVisible, setTooltipVisible] = useState(true)

    const buttons = (
        <>
            <div className="col-auto">
                <IconButton onClick={() => action(FileAction.Edit)}>
                    <EditOutlinedIcon />
                </IconButton>
            </div>
            <div className="col-auto">
                {format && SUPPORTED_FILE_TYPES.includes(format) ?
                    <IconButton onClick={() => action(FileAction.Preview)}>
                        <VisibilityOutlinedIcon />
                    </IconButton> :
                    <IconButton disabled  >
                        <VisibilityOffOutlinedIcon />
                    </IconButton>
                }
            </div>
            <div className="col-auto">
                <IconButton onClick={() => action(FileAction.Download)}>
                    <GetAppOutlinedIcon />
                </IconButton>
            </div>
            <div className="col-auto">
                <IconButton onClick={() => action(FileAction.Share)}>
                    <ShareOutlinedIcon />
                </IconButton>
            </div>
            <div className="col-auto">
                <IconButton onClick={() => action(FileAction.Delete)}>
                    <DeleteOutlineOutlinedIcon />
                </IconButton>
            </div>
        </>
    );


    return (
        <div className="file container" >
            <div className="row align-items-center d-flex justify-content-center">
                <div className="col col-lg-4 ellipse-text d-flex justify-content-center">
                    <p className="ellipse-text" style={{ maxWidth: "400px" }}>{fileMetadata.title}</p>
                </div>
                <div className="col-4 col-lg-2 d-flex justify-content-center">
                    {formatBytes(fileMetadata.size)}
                </div>
                {!changedLayout && buttons}
            </div>
            {changedLayout &&
                <div className="row align-items-center d-flex justify-content-center">
                    {buttons}
                </div>
            }
        </div>
    );
}

export const FILE_CHUNK_SIZE = 5

export default function MyFiles({ changedLayout, fileMetadata, fileCount, selected, fetchFiles, fetchFileCount }: IMyFilesProps) {
    const [modalOpen, setModalOpen] = useState(false)
    const [modal, setModal] = useState<{
        title: string,
        body: JSX.Element
    } | null>(null)


    const toggleModal = () => {
        setModalOpen(!modalOpen)
    }

    function Upload() {
        return (
            <FileUploader {...{
                isAuthed: true, onUpload: () => {
                    setModalOpen(false)
                    fetchFileCount()
                    fetchFiles(0, FILE_CHUNK_SIZE, 1)
                }, onError: () => { setModalOpen(false) }
            }} />
        );
    }

    function Edit() {
        return (
            <div>Edit</div>
        );
    }


    function Preview() {
        return (
            <div>Preview</div>
        );
    }


    function Share() {
        return (
            <div>Share</div>
        );
    }


    function Delete() {
        return (
            <div>Delete</div>
        );
    }

    const selectActionJsx = (action: FileAction) => {
        switch (action) {
            case FileAction.Upload:
                setModal({
                    title: "Upload File",
                    body: Upload()
                });
                toggleModal();
                break;
            case FileAction.Edit:
                setModal({
                    title: "Edit File",
                    body: Edit()
                });
                toggleModal();
                break;
            case FileAction.Preview:
                setModal({
                    title: "Preview File",
                    body: Preview()
                });
                toggleModal();
                break;
            case FileAction.Share:
                setModal({
                    title: "Share File",
                    body: Share()
                });
                toggleModal();
                break;
            case FileAction.Delete:
                setModal({
                    title: "Delete File",
                    body: Delete()
                });
                toggleModal();
                break;
        }
    }


    const props = (fileMetadata: IFileMetadata): IFileProps => {
        return {
            fileMetadata: fileMetadata,
            changedLayout: changedLayout,
            action: selectActionJsx
        }
    }
    return (
        <div className="container">
            <div className="row align-items-center d-flex justify-content-center">
                <Box className="col-8 col-md-6 col-lg-4" component="form" noValidate onSubmit={() => { }} sx={{ mt: 1 }}>
                    <Button outline
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        style={{ color: "#ebf0f", width: "100%" }}
                        onClick={() => selectActionJsx(FileAction.Upload)}>
                        Upload File
                    </Button>
                </Box>
                <Modal isOpen={modalOpen} toggle={() => { toggleModal() }}>
                    <ModalHeader toggle={() => { toggleModal() }} cssModule={{ 'modal-title': 'w-100 text-center' }}>
                        <div className="d-flex justify-content-center">
                            <p>{modal?.title}</p>
                        </div>
                    </ModalHeader>
                    <ModalBody>
                        {modal?.body}
                    </ModalBody>
                </Modal>
                {
                    fileMetadata ?
                    fileMetadata.map((fileMeta: IFileMetadata) => {
                            return (
                                <File key={fileMeta.id} {...props(fileMeta)}></File>
                            );
                        })
                        :
                        <div className="container">
                            <div className="row align-items-center d-flex justify-content-center" style={{ height: "400px" }}>
                                <div className="col-auto">
                                    <h5><i>You don't have any uploaded files</i></h5>
                                </div>
                            </div>
                        </div>
                }
                {
                    fileCount && fileCount > 0 && <CustomPagination {...{ 
                        total: fileCount, 
                        chunkSize: FILE_CHUNK_SIZE,
                        selected: selected,
                        fetchItems: fetchFiles
                     }} />
                }
            </div>
        </div>
    );
}