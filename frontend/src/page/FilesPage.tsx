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
import { IconButton } from '@mui/material';
import { IPageProps } from './main/MainPage';
import { SUPPORTED_FILE_TYPES } from '../model/Server';

interface IFileMetadata {
    fileId: string,
    title: string,
    size: number,
    dynlink: string | null,
}

interface IFileProps {
    fileMetadata: IFileMetadata,
    changedLayout: Boolean,
    action: (action: FileAction) => void
}

enum FileAction {
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
                    <IconButton disabled >
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

function Edit(toggleModal: () => void) {
    return (
        <>
            <ModalHeader toggle={() => { toggleModal() }}>Edit</ModalHeader>
            <ModalBody>
                Edit
            </ModalBody>
        </>
    );
}


function Preview(toggleModal: () => void) {
    return (
        <>
            <ModalHeader toggle={() => { toggleModal() }}>Preview</ModalHeader>
            <ModalBody>
                Preview
            </ModalBody>
        </>
    );
}

function Share(toggleModal: () => void) {
    return (
        <>
            <ModalHeader toggle={() => { toggleModal() }}>Share</ModalHeader>
            <ModalBody>
                Share
            </ModalBody>
        </>
    );
}

function Delete(toggleModal: () => void) {
    return (
        <>
            <ModalHeader toggle={() => { toggleModal() }}>Delete</ModalHeader>
            <ModalBody>
                Delete
            </ModalBody>
        </>
    );
}

export default function MyFiles({ user, isAdmin, changedLayout }: IPageProps) {
    const [modalOpen, setModalOpen] = useState(false)
    const [modalBody, setModalBody] = useState(<div></div>)

    const toggleModal = () => {
        setModalOpen(!modalOpen)
    }

    const handleAction = (action: FileAction) => {
        const jsxElement = selectActionJsw(action)
        if (jsxElement) {
            setModalBody(jsxElement)
            toggleModal()
        }
    }

    const selectActionJsw = (action: FileAction) => {
        switch (action) {
            case FileAction.Edit:
                return Edit(toggleModal)
            case FileAction.Preview:
                return Preview(toggleModal)
            case FileAction.Share:
                return Share(toggleModal)
            case FileAction.Delete:
                return Delete(toggleModal)
        }
    }

    const file: IFileMetadata = {
        fileId: "ffd7e268-9b02-4b76-a473-6d4cda0b2520",
        title: "heldeep.mp4",
        size: 700000000,
        dynlink: null
    }
    const props: IFileProps = {
        fileMetadata: file,
        changedLayout: changedLayout,
        action: handleAction
    }

    return (
        <div>
            <Modal isOpen={modalOpen} toggle={() => { toggleModal() }}>
                {modalBody}
            </Modal>
            <File {...props} />
            <File {...props} />
            <File {...props} />
            <File {...props} />
            <File {...props} />
            <File {...props} />
        </div>
    );
}