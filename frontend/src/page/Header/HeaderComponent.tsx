import React, { Component, useEffect, useState } from 'react';
import {
    Navbar, NavbarBrand, Nav, NavbarToggler, Collapse, NavItem,
    Button, Modal, ModalHeader, ModalBody, FormGroup, Label, Form, Input,
    Dropdown, DropdownToggle, DropdownItem, DropdownMenu
} from 'reactstrap';
import { NavLink } from 'react-router-dom';
import './Header.scss';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { useWindowSize } from '../main/MainPage';

export default function Header() {
    const [isNavOpen, setNavOpen] = useState(false);
    const [isDropdowOpen, setDropdownOpen] = useState(false);

    const windowSize = useWindowSize();
    const [changeLayout, setChangeLayout] = useState(false);

    useEffect(() => {
        if (windowSize.width && windowSize.width < 992) setChangeLayout(true)
        else setChangeLayout(false)
    }, [windowSize])

    return (
        <div className="header">
            <Navbar dark expand="lg" >
                <NavbarToggler onClick={() => setNavOpen(!isNavOpen)} />
                <Collapse isOpen={isNavOpen} navbar>
                    <Nav navbar className="center-vertically">
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
                        {changeLayout &&
                            <>
                                <NavItem>
                                    <NavLink className="nav-link" to="/contactus" >
                                        <p className="text-color-toggler">My settings</p>
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink className="nav-link" to="/contactus" >
                                        <p className="text-color-toggler">Logout</p>
                                    </NavLink>
                                </NavItem>
                            </>
                        }
                    </Nav>
                </Collapse>
                {!changeLayout &&
                    <>
                        <div style={{ display: "inline-block" }}>
                            <p><b>Hello,&nbsp;</b></p>
                        </div>
                        <div style={{ display: "inline-block" }}>
                            <p><i><b>registered@lockity.com&nbsp;</b></i></p>
                        </div>
                        <div style={{ display: "inline-block" }}>
                        </div>
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
                    </>
                }
            </Navbar>
        </div>
    );
}