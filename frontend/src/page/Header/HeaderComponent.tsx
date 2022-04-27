import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import { Collapse, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Modal, ModalBody, ModalHeader, Nav, Navbar, NavbarToggler, NavItem } from 'reactstrap';
import { RequestBuilder } from '../../model/RequestBuilder';
import { ROUTES } from '../../model/Routes';
import { ENDPOINTS } from '../../model/Server';
import { User } from '../../model/User';
import { LocalUserActionCreators } from '../../redux/actionCreators/LocalUserActionCreators';
import { useTypedSelector } from '../../redux/Store';
import { IUserData } from '../users/model/UsersModel';
import { EditMyself } from './component/EditMyselfComponent';
import { sayHello } from './model/HeaderModels';
import './styles/Header.scss';

export const LogoutAction = async () => {
    await new RequestBuilder()
        .withUrl(ENDPOINTS.AUTH.logout)
        .withMethod('POST')
        .withDefaults()
        .send((response: any) => {
            localStorage.removeItem(User.storagename)
            window.location.replace(ROUTES.login)
        }, () => {
            localStorage.removeItem(User.storagename)
            window.location.replace(ROUTES.login)
        })
};

export default function Header() {
    const [isNavOpen, setNavOpen] = useState(false);
    const [isDropdowOpen, setDropdownOpen] = useState(false);
    const [modalOpen, setModalOpen] = useState(false)
    const [userData, setUserData] = useState<IUserData | null>(null)
    const [hello] = useState(sayHello())

    const windowState = useTypedSelector((state) => state.windowReducer)
    const localUserState = useTypedSelector((state) => state.localUserReducer)
    const location = useLocation();
    const dispatch = useDispatch()

    const toggleModal = () => {
        setModalOpen(!modalOpen)
    }

    const fetchUserData = async (onSuccess: (response: any) => void) => {
        if (localUserState.user) {
            await new RequestBuilder()
                .withUrl(ENDPOINTS.USER.userId(localUserState.user.id))
                .withMethod('GET')
                .withDefaults()
                .send((response: any) => {
                    onSuccess(response)
                }, () => { }
                )
        }
    }

    const openModal = async () => {
        fetchUserData((response) => {
            const userdata: IUserData = response
            setUserData(userdata)
            setModalOpen(true)
        })
    }

    const emptyNavLinkMap = (): Map<string, string> => {
        const navLinkMap = new Map<string, string>();
        [ROUTES.filesPage, ROUTES.receivedPage, ROUTES.sharedPage, ROUTES.APIPage, ROUTES.users]
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

    const modalCallback = (success: boolean) => {
        setModalOpen(false)
        if (success) {
            fetchUserData((response) => {
                const userdata: IUserData = response
                dispatch(LocalUserActionCreators.setUser(userdata))
            })
        }
    }

    return (
        <div className="header">
            <Modal className="container" size="" isOpen={modalOpen} toggle={() => { toggleModal() }}>
                <ModalHeader toggle={() => { toggleModal() }} cssModule={{ 'modal-title': 'w-100 text-center' }}>
                    <div className="d-flex justify-content-center">
                        <p>Edit my data</p>
                    </div>
                </ModalHeader>
                <ModalBody className="row align-items-center d-flex justify-content-center m-2">
                    <div className="col">
                        {userData &&
                            <EditMyself {...{
                                userData: userData,
                                callback: modalCallback
                            }} />
                        }
                    </div>
                </ModalBody>
            </Modal>
            <Navbar dark expand="lg">
                <div style={{ width: "100%", maxWidth: "600px" }}>
                    <NavbarToggler onClick={() => setNavOpen(!isNavOpen)} style={{ width: "200px" }} />
                    <Collapse isOpen={isNavOpen} navbar>
                        <Nav navbar className="center-vertically">
                            <NavItem>
                                <NavLink className="nav-link" to={ROUTES.filesPage} >
                                    <p className={navlinkClasses.get(ROUTES.filesPage)}>My Files</p>
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className="nav-link" to={ROUTES.receivedPage} >
                                    <p className={navlinkClasses.get(ROUTES.receivedPage)}>Received Files</p>
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className="nav-link" to={ROUTES.sharedPage} >
                                    <p className={navlinkClasses.get(ROUTES.sharedPage)}>Shared Files</p>
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className="nav-link" to={ROUTES.APIPage} >
                                    <p className={navlinkClasses.get(ROUTES.APIPage)}>API</p>
                                </NavLink>
                            </NavItem>
                            {localUserState.isAdmin &&
                                <NavItem>
                                    <NavLink className="nav-link" to={ROUTES.users} >
                                        <p className={navlinkClasses.get(ROUTES.users)}>Users</p>
                                    </NavLink>
                                </NavItem>
                            }
                            {windowState.smallView &&
                                <>
                                    <NavItem className="nav-link" onClick={() => openModal()}>
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
                {!windowState.smallView &&
                    <div className="d-flex align-items-center justify-content-end">
                        <div style={{ display: "inline-block" }}>
                            <p style={{ whiteSpace: "pre" }}><b>{hello},&nbsp;</b></p>
                        </div>
                        <div style={{ display: "inline-block", maxWidth: "200px", marginRight: 10 }}>
                            <p style={{ textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden" }}>
                                <i><b>{localUserState.user?.username}&nbsp;</b></i></p>
                        </div>
                        <div style={{ display: "inline-block" }}>
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
                                    <DropdownItem onClick={() => openModal()}>
                                        My settings
                                    </DropdownItem>
                                    <DropdownItem onClick={async () => await LogoutAction()}>
                                        Logout
                                    </DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        </div>
                    </div>
                }
            </Navbar>
        </div>
    );
}