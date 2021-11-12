import React, { Component, useEffect, useState } from 'react';
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

interface IFileMetadata {
    fileId: string,
    title: string,
    size: number,
    dynlink: string | null
}

interface IFileProps {
    fileMetadata: IFileMetadata,
    changedLayout: Boolean
}

function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function File({ fileMetadata, changedLayout }: IFileProps) {
    const buttons = (
        <>
            <div className="col-auto">
                <IconButton >
                    <EditOutlinedIcon />
                </IconButton>
            </div>
            <div className="col-auto">
                <IconButton >
                    <VisibilityOutlinedIcon />
                </IconButton>
                <IconButton disabled >
                    <VisibilityOffOutlinedIcon />
                </IconButton>
            </div>
            <div className="col-auto">
                <IconButton >
                    <GetAppOutlinedIcon />
                </IconButton>
            </div>
            <div className="col-auto">
                <IconButton >
                    <ShareOutlinedIcon />
                </IconButton>
            </div>
            <div className="col-auto">
                <IconButton >
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

export default function MyFiles({ user, isAdmin, changedLayout }: IPageProps) {
    const [modalOpen, setModalOpen] = useState(false)

    const toggleModal = () => {
        setModalOpen(!modalOpen)
    }

    const file: IFileMetadata = {
        fileId: "ffd7e268-9b02-4b76-a473-6d4cda0b2520",
        title: "heldeep",
        size: 700000000,
        dynlink: null
    }
    const props: IFileProps = {
        fileMetadata: file,
        changedLayout: changedLayout
    }

    return (
        <div>
            <Modal isOpen={modalOpen}>
                <ModalHeader toggle={toggleModal}>Login</ModalHeader>
                <ModalBody>

                </ModalBody>
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