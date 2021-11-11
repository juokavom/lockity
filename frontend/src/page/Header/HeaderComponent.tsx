import React, { Component, useState } from 'react';
import {
    Navbar, NavbarBrand, Nav, NavbarToggler, Collapse, NavItem,
    Button, Modal, ModalHeader, ModalBody, FormGroup, Label, Form, Input,
    Dropdown, DropdownToggle, DropdownItem, DropdownMenu
} from 'reactstrap';
import { NavLink } from 'react-router-dom';
import './Header.scss';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

export default function Header() {
    const [isNavOpen, setNavOpen] = useState(false);
    const [isDropdowOpen, setDropdownOpen] = useState(false);

    return (
        <div className="header">
            <Navbar dark expand="lg">
                <NavbarToggler onClick={() => setNavOpen(!isNavOpen)} />
                <Collapse isOpen={isNavOpen} navbar>
                    <Nav navbar>
                        <NavItem>
                            <NavLink className="nav-link" to="/home" >
                                <p className="text-color-toggler">My Files</p>
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink className="nav-link" to="/aboutus" >
                                <p className="text-color-toggler">Received Files</p>
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink className="nav-link" to="/menu" >
                                <p className="text-color-toggler">Shared Files</p>
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink className="nav-link" to="/contactus" >
                                <p className="text-color-toggler">Send Newsletter</p>
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink className="nav-link" to="/contactus" >
                                <p className="text-color-toggler">Users</p>
                            </NavLink>
                        </NavItem>
                    </Nav>
                </Collapse>
                {!isNavOpen &&
                    <>
                        <div style={{ display: "inline-block" }}>
                            <p>Hello,&nbsp;</p>
                        </div>
                        <div style={{ display: "inline-block" }}>
                            <p><i>registered@lockity.com&nbsp;</i></p>
                        </div>
                        <div style={{ display: "inline-block" }}>
                        </div>
                    </>
                }
                <Dropdown
                    isOpen={isDropdowOpen}
                    onMouseOver={() => setDropdownOpen(true)}
                    onMouseLeave={() => setDropdownOpen(false)}
                    toggle={() => { }}
                >
                    <DropdownToggle >
                        <PersonOutlineIcon />
                    </DropdownToggle>
                    <DropdownMenu >
                        <DropdownItem>
                            My settings
                        </DropdownItem>
                        <DropdownItem>
                            Logout
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </Navbar>
        </div>
    );
}