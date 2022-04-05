import { Visibility, VisibilityOff } from '@mui/icons-material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import {
    Box, FormControl, FormControlLabel, IconButton, Input, InputLabel, MenuItem,
    Select, Switch, TextField
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Collapse, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Modal, ModalBody, ModalHeader, Nav, Navbar, NavbarToggler, NavItem } from 'reactstrap';
import { LogoutAction } from '../../model/RequestActions';
import { DefaultToastOptions, RequestBuilder } from '../../model/RequestBuilder';
import { ROUTES } from '../../model/Routes';
import { ENDPOINTS } from '../../model/Server';
import { User } from '../../model/User';
import { LocalUserActionCreators } from '../../redux/actionCreators/LocalUserActionCreators';
import { useTypedSelector } from '../../redux/Store';
import { IUserData } from '../UsersPage';
import './Header.scss';

function sayHello() {
    const hellos = [
        "Hola", "Bonjour", "Guten tag", "Ciao", "Nǐn hǎo",
        "Asalaam alaikum", "Hello", "Labas", "Konnichiwa",
        "Shalom"
    ]
    return hellos[Math.floor(Math.random() * hellos.length)]
}

function EditUser({ userData, callback }: IUserEditModalProps): JSX.Element {
    const [showPassword, setShowPassword] = useState(false)

    const [user, setUser] = useState<{
        name: string | null,
        surname: string | null,
        email: string | null,
        password: string | null,
        role: string | null,
        registered: Date | null,
        lastActive: Date | null,
        confirmed: boolean,
        subscribed: boolean,
        storageSize: number | null
    }>({
        name: userData!.name,
        surname: userData!.surname,
        email: userData!.email,
        password: "",
        role: userData!.role,
        registered: userData!.registered,
        lastActive: userData!.lastActive,
        confirmed: userData!.confirmed,
        subscribed: userData!.subscribed,
        storageSize: userData!.storageSize
    });

    const validateForm = () => {
        return user != null &&
            user.email != null && user.email !== "" &&
            user.registered != null && (
                user.email !== userData!.email ||
                user.name !== userData!.name ||
                user.surname !== userData!.surname ||
                user.subscribed !== userData!.subscribed ||
                user.password !== ""
            )
    }

    const handleSubmit = async (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        await EditSelfAction();
    }

    const EditSelfAction = async () => {
        await new RequestBuilder()
            .withUrl(ENDPOINTS.USER.userIdSelf(userData!.id))
            .withMethod('PUT')
            .withDefaults()
            .withBody({
                name: user.name,
                surname: user.surname,
                email: user.email,
                password: user.password,
                subscribed: user.subscribed
            })
            .send((response: any) => {
                toast.success(response.message, DefaultToastOptions)
                callback(true)
            }, () => callback(false)
            )
    }

    return (
        <div className="container"><Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
                margin="normal"
                required
                fullWidth
                id="Email"
                label="Email"
                type="email"
                name="Email"
                autoComplete="Email"
                variant="standard"
                defaultValue={userData!.email}
                onChange={(e: any) => setUser({ ...user, email: e.target.value })}
            />
            <TextField
                margin="normal"
                fullWidth
                id="Name"
                label="Name"
                name="Name"
                autoComplete="Name"
                variant="standard"
                defaultValue={userData!.name}
                onChange={(e: any) => setUser({ ...user, name: e.target.value })}
            />
            <TextField
                margin="normal"
                fullWidth
                id="Surname"
                label="Surname"
                name="Surname"
                autoComplete="Surname"
                variant="standard"
                defaultValue={userData!.surname}
                onChange={(e: any) => setUser({ ...user, surname: e.target.value })}
            />
            <FormControl
                margin="normal"
                fullWidth
                variant="standard"
            >
                <InputLabel htmlFor="password">Password</InputLabel>
                <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    onChange={(e: any) => setUser({ ...user, password: e.target.value })}
                    endAdornment={
                        <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                    }
                />
            </FormControl>
            <FormControl
                disabled
                margin="normal"
                fullWidth
                variant="standard"
                required
            >
                <InputLabel id="Role">Role</InputLabel>
                <Select
                    id="Role"
                    label="Role"
                    value={user.role}
                    defaultValue={userData!.role}
                >
                    <MenuItem value={User.Role.Registered}>{User.Role.Registered}</MenuItem>
                    <MenuItem value={User.Role.Admin}>{User.Role.Admin}</MenuItem>
                </Select>
            </FormControl>
            <TextField
                disabled
                margin="normal"
                required
                fullWidth
                variant="standard"
                id="registered"
                label="Registered"
                type="datetime-local"
                inputProps={{ step: 1 }}
                defaultValue={userData!.registered}
                InputLabelProps={{
                    shrink: true,
                }}
            />
            <TextField
                disabled
                margin="normal"
                fullWidth
                variant="standard"
                id="lastActive"
                label="Last active"
                type="datetime-local"
                inputProps={{ step: 1 }}
                defaultValue={userData!.lastActive}
                InputLabelProps={{
                    shrink: true,
                }}
            />
            <TextField
                disabled
                margin="normal"
                fullWidth
                variant="standard"
                id="storageSize"
                label="Storage size (bytes)"
                type="number"
                value={user.storageSize}
            />
            <FormControlLabel
                disabled
                control={
                    <Switch
                        checked={user.confirmed}
                        name="confirmed"
                    />
                }
                label="Confirmed"
            />
            <FormControlLabel
                control={
                    <Switch
                        checked={user.subscribed}
                        onChange={(e: any) => { setUser({ ...user, subscribed: !user.subscribed }) }}
                        name="subscribed"
                    />
                }
                label="Subscribed"
            />
            <div className="selected-file-wrapper">
                <Button
                    type="submit"
                    variant="contained"
                    className="upload-button"
                    sx={{ mt: 3, mb: 2 }}
                    disabled={!validateForm()}
                >
                    Save
                </Button>
            </div>
        </Box>
        </div>
    );
}

interface IUserEditModalProps {
    userData: IUserData | null,
    callback: (success: boolean) => void
}

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
        [ROUTES.filesPage, ROUTES.receivedPage, ROUTES.sharedPage, ROUTES.sendNewsletter, ROUTES.users]
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
                            <EditUser {...{
                                userData: userData,
                                callback: modalCallback
                            }} />
                        }
                    </div>
                </ModalBody>
            </Modal>
            <Navbar dark expand="lg" >
                <div className="row center-horizontally" style={{ width: "100%" }}>
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
                    <>
                        <div style={{ display: "inline-block" }}>
                            <p style={{ whiteSpace: "pre" }}><b>{hello},&nbsp;</b></p>
                        </div>
                        <div style={{ display: "inline-block" }}>
                            <p><i><b>{localUserState.user?.email}&nbsp;</b></i></p>
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
                                <DropdownItem onClick={() => openModal()}>
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