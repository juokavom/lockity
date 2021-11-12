import { useLocation } from 'react-router-dom'
import React, { Component, useEffect, useState } from 'react';
import {
    Navbar, NavbarBrand, Nav, NavbarToggler, Collapse, NavItem,
    Button, Modal, ModalHeader, ModalBody, FormGroup, Label, Form, Input,
    Dropdown, DropdownToggle, DropdownItem, DropdownMenu
} from 'reactstrap';
import { NavLink } from 'react-router-dom';
import './Header.scss';
import { User } from '../../model/User';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { ROUTES } from '../../model/Routes';
import { LogoutAction } from '../../model/RequestActions';
import { IPageProps } from '../main/MainPage';



function sayHello() {
    const hellos = [
        "Hola", "Bonjour", "Guten tag", "Ciao", "Nǐn hǎo",
        "Asalaam alaikum", "Hello", "Labas", "Konnichiwa",
        "Shalom"
    ]
    return hellos[Math.floor(Math.random() * hellos.length)]
}

export default function Header({ user, isAdmin, changedLayout }: IPageProps) {
    const [isNavOpen, setNavOpen] = useState(false);
    const [isDropdowOpen, setDropdownOpen] = useState(false);


    const location = useLocation();

    const [hello] = useState(sayHello())

    const emptyNavLinkMap = (): Map<string, string> => {
        const navLinkMap = new Map<string, string>();
        [ROUTES.myFiles, ROUTES.receivedFiles, ROUTES.sharedFiles, ROUTES.sendNewsletter, ROUTES.users]
            .forEach((route: string) => navLinkMap.set(route, "text-color-toggler"))
        return navLinkMap;
    }

    const [navlinkClasses, setNavlinkClasses] = useState(emptyNavLinkMap())


    useEffect(() => {
        const map = emptyNavLinkMap();
        if (map.has(location.pathname)) {
            map.set(location.pathname, "text-color-toggler-selected")
            setNavlinkClasses(map)
        }
    }, [location.pathname])


    return (
        <div className="header">
            <Navbar dark expand="lg" >
                <div className="row center-horizontally" style={{ width: "100%" }}>
                    <NavbarToggler onClick={() => setNavOpen(!isNavOpen)} style={{ width: "200px" }} />
                    <Collapse isOpen={isNavOpen} navbar>
                        <Nav navbar className="center-vertically">
                            <NavItem>
                                <NavLink className="nav-link" to={ROUTES.myFiles} >
                                    <p className={navlinkClasses.get(ROUTES.myFiles)}>My Files</p>
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className="nav-link" to={ROUTES.receivedFiles} >
                                    <p className={navlinkClasses.get(ROUTES.receivedFiles)}>Received Files</p>
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className="nav-link" to={ROUTES.sharedFiles} >
                                    <p className={navlinkClasses.get(ROUTES.sharedFiles)}>Shared Files</p>
                                </NavLink>
                            </NavItem>
                            {isAdmin &&
                                <NavItem>
                                    <NavLink className="nav-link" to={ROUTES.sendNewsletter} >
                                        <p className={navlinkClasses.get(ROUTES.sendNewsletter)}>Send Newsletter</p>
                                    </NavLink>
                                </NavItem>
                            }
                            {isAdmin &&
                                <NavItem>
                                    <NavLink className="nav-link" to={ROUTES.users} >
                                        <p className={navlinkClasses.get(ROUTES.users)}>Users</p>
                                    </NavLink>
                                </NavItem>
                            }
                            {changedLayout &&
                                <>
                                    <NavItem className="nav-link">
                                        <p className="text-color-toggler">My settings</p>
                                    </NavItem>
                                    <NavItem className="nav-link" onClick={async () => await LogoutAction()}>
                                        <p className="text-color-toggler" >Logout</p>
                                    </NavItem>
                                </>
                            }
                        </Nav>
                    </Collapse>
                </div>
                {!changedLayout &&
                    <>
                        <div style={{ display: "inline-block" }}>
                            <p style={{ whiteSpace: "pre" }}><b>{hello},&nbsp;</b></p>
                        </div>
                        <div style={{ display: "inline-block" }}>
                            <p><i><b>{user.email}&nbsp;</b></i></p>
                        </div>
                        <div style={{ display: "inline-block" }}>
                        </div>
                        <Dropdown
                            isOpen={isDropdowOpen}
                            onMouseOver={() => setDropdownOpen(true)}
                            onMouseLeave={() => setDropdownOpen(false)}
                            toggle={() => { }}
                        >
                            <DropdownToggle outline>
                                <PersonOutlineIcon />
                            </DropdownToggle>
                            <DropdownMenu >
                                <DropdownItem>
                                    My settings
                                </DropdownItem>
                                <DropdownItem onClick={async () => await LogoutAction()}>
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