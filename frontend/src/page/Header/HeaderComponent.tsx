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
import { useWindowSize } from '../main/MainPage';
import { ROUTES } from '../../model/Routes';
import { LogoutAction } from '../../model/RequestActions';

interface IHeaderProps {
    user: User.FrontendUser,
    isAdmin: Boolean
}

function sayHello() {
    const hellos = [
        "Hola", "Bonjour", "Guten tag", "Ciao", "Nǐn hǎo",
        "Asalaam alaikum", "Hello", "Labas", "Konnichiwa",
        "Shalom"
    ]
    return hellos[Math.floor(Math.random() * hellos.length)]
}

export default function Header({ user, isAdmin }: IHeaderProps) {
    const [isNavOpen, setNavOpen] = useState(false);
    const [isDropdowOpen, setDropdownOpen] = useState(false);

    const windowSize = useWindowSize();
    const [changeLayout, setChangeLayout] = useState(false);

    const [hello] = useState(sayHello())

    useEffect(() => {
        if (windowSize.width && windowSize.width < 992) setChangeLayout(true)
        else setChangeLayout(false)
    }, [windowSize])

    return (
        <div className="header">
            <Navbar dark expand="lg" >
                <div className="row center-horizontally" style={{ width: "100%" }}>
                    <NavbarToggler onClick={() => setNavOpen(!isNavOpen)} style={{ width: "200px" }} />
                    <Collapse isOpen={isNavOpen} navbar>
                        <Nav navbar className="center-vertically">
                            <NavItem>
                                <NavLink className="nav-link" to={ROUTES.myFiles} >
                                    <p className="text-color-toggler">My Files</p>
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className="nav-link" to={ROUTES.receivedFiles} >
                                    <p className="text-color-toggler">Received Files</p>
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className="nav-link" to={ROUTES.sharedFiles} >
                                    <p className="text-color-toggler">Shared Files</p>
                                </NavLink>
                            </NavItem>
                            {isAdmin &&
                                <NavItem>
                                    <NavLink className="nav-link" to={ROUTES.sendNewsletter} >
                                        <p className="text-color-toggler">Send Newsletter</p>
                                    </NavLink>
                                </NavItem>
                            }
                            {isAdmin &&
                                <NavItem>
                                    <NavLink className="nav-link" to={ROUTES.users} >
                                        <p className="text-color-toggler">Users</p>
                                    </NavLink>
                                </NavItem>
                            }
                            {changeLayout &&
                                <>
                                    <NavItem>
                                        <NavLink className="nav-link" to="/contactus" >
                                            <p className="text-color-toggler">My settings</p>
                                        </NavLink>
                                    </NavItem>
                                    <NavItem onClick={async () => await LogoutAction()}>
                                        <NavLink className="nav-link" to="" >
                                            <p className="text-color-toggler" >Logout</p>
                                        </NavLink>
                                    </NavItem>
                                </>
                            }
                        </Nav>
                    </Collapse>
                </div>
                {!changeLayout &&
                    <>
                        {windowSize.width && windowSize.width > 1200 &&
                            <div style={{ display: "inline-block" }}>
                                <p style={{ whiteSpace: "pre" }}><b>{hello},&nbsp;</b></p>
                            </div>

                        }
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
                            <DropdownToggle outline >
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