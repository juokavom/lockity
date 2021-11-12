import { useLocation } from 'react-router-dom'
import React, { Component, useEffect, useState } from 'react';
import {
    Navbar, NavbarBrand, Nav, NavbarToggler, Collapse, NavItem,
    Button, Modal, ModalHeader, ModalBody, FormGroup, Label, Form, Input,
    Dropdown, DropdownToggle, DropdownItem, DropdownMenu
} from 'reactstrap';
import { NavLink } from 'react-router-dom';
import './Header.scss';
import { User, IUserProps } from '../../model/User';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { ROUTES } from '../../model/Routes';
import { LogoutAction } from '../../model/RequestActions';


function useWindowSize() {
    const [windowSize, setWindowSize] = useState<{
        width: number | null,
        height: number | null
    }>({
        width: null,
        height: null,
    });
    useEffect(() => {
        function handleResize() {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    return windowSize;
}

function sayHello() {
    const hellos = [
        "Hola", "Bonjour", "Guten tag", "Ciao", "Nǐn hǎo",
        "Asalaam alaikum", "Hello", "Labas", "Konnichiwa",
        "Shalom"
    ]
    return hellos[Math.floor(Math.random() * hellos.length)]
}

export default function Header({ user, isAdmin }: IUserProps) {
    const [isNavOpen, setNavOpen] = useState(false);
    const [isDropdowOpen, setDropdownOpen] = useState(false);

    const windowSize = useWindowSize();
    const [changeLayout, setChangeLayout] = useState(false);

    const [hello] = useState(sayHello())

    const location = useLocation();

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
                            {changeLayout &&
                                <>
                                    <NavItem className="nav-link">
                                        <p className="text-color-toggler-static">My settings</p>
                                    </NavItem>
                                    <NavItem className="nav-link" onClick={async () => await LogoutAction()}>
                                        <p className="text-color-toggler-static" >Logout</p>
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