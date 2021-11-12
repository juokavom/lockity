import React, { Component, useEffect, useState } from 'react';
import {
    Navbar, NavbarBrand, Nav, NavbarToggler, Collapse, NavItem,
    Button, Modal, ModalHeader, ModalBody, FormGroup, Label, Form, Input,
    Dropdown, DropdownToggle, DropdownItem, DropdownMenu
} from 'reactstrap';
import { NavLink } from 'react-router-dom';
import { IUserProps, User } from '../model/User';

interface FileMetadata {
    fileId: string,
    title: string,
    size: number,
    dynlink: string | null
}

function File(FileMetadata: FileMetadata) {
    return (
        <div className="file container" >
            <div className="row">
                <div className="col">
                {FileMetadata.title}
                </div>
                <div className="col">{FileMetadata.size}
                </div>
            </div>
        </div>
    );
}

export default function MyFiles({ user, isAdmin }: IUserProps) {
    const file: FileMetadata = {
        fileId: "ffd7e268-9b02-4b76-a473-6d4cda0b2520",
        title: "heldens",
        size: 700000000,
        dynlink: null
    }
    return (
        <div>
            <File {...file} />
            <File {...file} />
            <File {...file} />
            <File {...file} />
            <File {...file} />
            <File {...file} />
        </div>
    );
}