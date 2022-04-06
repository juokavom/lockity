import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
    Box, FormControl, FormControlLabel, IconButton, Input, InputLabel, MenuItem,
    Select, Switch, TextField
} from '@mui/material';
import { Dispatch, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import {
    Button, Modal, ModalBody, ModalHeader
} from 'reactstrap';
import CustomPagination from '../component/PaginationComponent';
import { LOADING_TIMEOUT_MS, USER_CHUNK_SIZE } from '../model/Constants';
import { DefaultToastOptions, RequestBuilder } from '../model/RequestBuilder';
import { ROUTES } from '../model/Routes';
import { ENDPOINTS, MAX_STORAGE_SIZE } from '../model/Server';
import { User } from '../model/User';
import { Action } from '../redux/actionCreators/Action';
import { LoadingActionCreators } from '../redux/actionCreators/LoadingActionCreators';
import { UserActionCreators } from '../redux/actionCreators/UserActionCreators';
import { useTypedSelector } from '../redux/Store';

const UserAction = {
    Create: "Create user",
    Edit: "Edit user",
    Delete: "Delete user"
}

interface IUserModalProps {
    userData: IUserData,
    callback: (success: boolean) => void
}

export interface IUserData {
    id: string,
    name: string | null,
    surname: string | null,
    email: string,
    password: string | null,
    role: User.Role,
    registered: Date,
    lastActive: Date | null,
    confirmed: boolean,
    subscribed: boolean,
    storageSize: number
}

function Create({ callback }: any): JSX.Element {
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
        name: null,
        surname: null,
        email: null,
        password: null,
        role: "",
        registered: null,
        lastActive: null,
        confirmed: false,
        subscribed: false,
        storageSize: 0
    });

    const validateForm = () => {
        return user != null &&
            user.email !== null && user.email !== "" &&
            user.password !== null && user.password !== "" &&
            user.role !== null && user.role !== "" &&
            user.registered != null
    }

    const handleSubmit = async (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        await CreateUserAction();
    }

    const CreateUserAction = async () => {
        await new RequestBuilder()
            .withUrl(ENDPOINTS.USER.user)
            .withMethod('POST')
            .withDefaults()
            .withBody(user)
            .send((response: any) => {
                toast.success(response.message, DefaultToastOptions)
                // callback(true)
            }, () => callback(false))
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
                onChange={(e: any) => setUser({ ...user, surname: e.target.value })}
            />
            <FormControl
                margin="normal"
                required
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
                    onChange={(e: any) => setUser({ ...user, role: e.target.value })}
                >
                    <MenuItem value={User.Role.Registered}>{User.Role.Registered}</MenuItem>
                    <MenuItem value={User.Role.Admin}>{User.Role.Admin}</MenuItem>
                </Select>
            </FormControl>
            <TextField
                margin="normal"
                required
                fullWidth
                variant="standard"
                id="registered"
                label="Registered"
                type="datetime-local"
                inputProps={{ step: 1 }}
                onChange={(e: any) => setUser({ ...user, registered: e.target.value })}
                InputLabelProps={{
                    shrink: true,
                }}
            />
            <TextField
                margin="normal"
                fullWidth
                variant="standard"
                id="lastActive"
                label="Last active"
                type="datetime-local"
                inputProps={{ step: 1 }}
                onChange={(e: any) => setUser({ ...user, lastActive: e.target.value })}
                InputLabelProps={{
                    shrink: true,
                }}
            />
            <TextField
                margin="normal"
                fullWidth
                variant="standard"
                id="storageSize"
                label="Storage size (bytes)"
                type="number"
                value={user.storageSize}
                onChange={(e: any) => {
                    let number = parseInt(e.target.value)
                    if (number < 0) number = 0
                    else if (number > MAX_STORAGE_SIZE) number = MAX_STORAGE_SIZE
                    setUser({ ...user, storageSize: number })
                }}
            />
            <FormControlLabel
                control={
                    <Switch
                        checked={user.confirmed}
                        onChange={(e: any) => { setUser({ ...user, confirmed: !user.confirmed }) }}
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

function Edit({ userData, callback }: IUserModalProps): JSX.Element {
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
        name: userData.name,
        surname: userData.surname,
        email: userData.email,
        password: "",
        role: userData.role,
        registered: userData.registered,
        lastActive: userData.lastActive,
        confirmed: userData.confirmed,
        subscribed: userData.subscribed,
        storageSize: userData.storageSize
    });

    const validateForm = () => {
        return user != null &&
            user.email != null && user.email !== "" &&
            user.role != null && user.role !== "" &&
            user.registered != null && (
                user.email !== userData.email ||
                user.name !== userData.name ||
                user.surname !== userData.surname ||
                user.role !== userData.role ||
                user.registered !== userData.registered ||
                user.lastActive !== userData.lastActive ||
                user.confirmed !== userData.confirmed ||
                user.subscribed !== userData.subscribed ||
                user.storageSize !== userData.storageSize ||
                user.password !== ""
            )
    }

    const handleSubmit = async (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        await EditUserAction();
    }

    const EditUserAction = async () => {
        await new RequestBuilder()
            .withUrl(ENDPOINTS.USER.userId(userData.id))
            .withMethod('PUT')
            .withDefaults()
            .withBody(user)
            .send((response: any) => {
                toast.success(response.message, DefaultToastOptions)
                callback(true)
            }, () => callback(false))
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
                defaultValue={userData.email}
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
                defaultValue={userData.name}
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
                defaultValue={userData.surname}
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
                    defaultValue={userData.role}
                    onChange={(e: any) => setUser({ ...user, role: e.target.value })}
                >
                    <MenuItem value={User.Role.Registered}>{User.Role.Registered}</MenuItem>
                    <MenuItem value={User.Role.Admin}>{User.Role.Admin}</MenuItem>
                </Select>
            </FormControl>
            <TextField
                margin="normal"
                required
                fullWidth
                variant="standard"
                id="registered"
                label="Registered"
                type="datetime-local"
                inputProps={{ step: 1 }}
                defaultValue={userData.registered}
                onChange={(e: any) => setUser({ ...user, registered: e.target.value })}
                InputLabelProps={{
                    shrink: true,
                }}
            />
            <TextField
                margin="normal"
                fullWidth
                variant="standard"
                id="lastActive"
                label="Last active"
                type="datetime-local"
                inputProps={{ step: 1 }}
                defaultValue={userData.lastActive}
                onChange={(e: any) => setUser({ ...user, lastActive: e.target.value })}
                InputLabelProps={{
                    shrink: true,
                }}
            />
            <TextField
                margin="normal"
                fullWidth
                variant="standard"
                id="storageSize"
                label="Storage size (bytes)"
                type="number"
                value={user.storageSize}
                defaultValue={userData.storageSize}
                onChange={(e: any) => {
                    let number = parseInt(e.target.value)
                    if (number < 0) number = 0
                    else if (number > MAX_STORAGE_SIZE) number = MAX_STORAGE_SIZE
                    setUser({ ...user, storageSize: number })
                }}
            />
            <FormControlLabel
                control={
                    <Switch
                        checked={user.confirmed}
                        onChange={(e: any) => { setUser({ ...user, confirmed: !user.confirmed }) }}
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
                    Update
                </Button>
            </div>
        </Box>
        </div>
    );
}

function Delete({ userData, callback }: IUserModalProps): JSX.Element {
    const DeleteUserAction = async () => {
        await new RequestBuilder()
            .withUrl(ENDPOINTS.USER.userId(userData.id))
            .withMethod('DELETE')
            .withDefaults()
            .send((response: any) => {
                toast.success(response.message, DefaultToastOptions)
                callback(true)
            }, () => callback(false))
    }

    return (
        <div className="container">
            <div className="row align-items-end d-flex justify-content-center">
                <div className="col-auto">
                    <h3 style={{ textAlign: "center" }}>Are you sure you want to delete this user?</h3>
                </div>
            </div>
            <div className="row align-items-end d-flex justify-content-center">
                <div className="col-auto">
                    <p style={{ textAlign: "center" }}><i>{userData.email}</i></p>
                </div>
            </div>
            <div className="row align-items-center d-flex justify-content-center"
                style={{ marginTop: "20px" }}>
                <div className="col-4">
                    <Button
                        className="btn btn-danger"
                        style={{ width: "100%" }}
                        sx={{ m: 3 }}
                        onClick={() => DeleteUserAction()}
                    >
                        Yes
                    </Button>
                </div>
                <div className="col-4">
                    <Button
                        className="btn btn-secondary"
                        style={{ width: "100%" }}
                        sx={{ m: 3 }}
                        onClick={() => callback(false)}
                    >
                        No
                    </Button>
                </div>
            </div>
        </div>
    );
}

const fetchUserData = (offset: number, limit: number, selected: number) => async (dispatch: Dispatch<Action>) => {
    dispatch(LoadingActionCreators.setLoading())
    await new RequestBuilder()
        .withUrl(ENDPOINTS.USER.getUserDataWithOffsetAndLimit(offset, limit))
        .withMethod('GET')
        .withDefaults()
        .send((response: any) => {
            dispatch(UserActionCreators.setUserSelected(selected))
            if (response) {
                const userData: IUserData[] = response
                dispatch(UserActionCreators.setUserData(userData))
                setTimeout(() => {
                    dispatch(LoadingActionCreators.setNotLoading())
                }, LOADING_TIMEOUT_MS)
            } else {
                dispatch(UserActionCreators.setUserData(null))
                dispatch(LoadingActionCreators.setNotLoading())
            }
        }, () => {
            dispatch(UserActionCreators.setUserData(null)) 
            dispatch(LoadingActionCreators.setNotLoading())
        }
        )
}


const fetchUserCount = () => async (dispatch: Dispatch<Action>) => {
    await new RequestBuilder()
        .withUrl(ENDPOINTS.USER.getUserCount)
        .withMethod('GET')
        .withDefaults()
        .send((response: any) => {
            if (response) {
                const userCount: { userCount: number } = response
                dispatch(UserActionCreators.setUserCount(userCount.userCount))
            } else {
                dispatch(UserActionCreators.setUserCount(null))
            }
        }, () => dispatch(UserActionCreators.setUserCount(null)))
}

export function Users() {
    const [modalOpen, setModalOpen] = useState(false)
    const [modalData, setModalData] = useState<{
        action: string,
        userData: IUserData | null
    } | null>(null)

    const dispatch = useDispatch()
    const userState = useTypedSelector((state) => state.userReducer)

    const fetchData = () => {
        dispatch(fetchUserCount())
        dispatch(fetchUserData(0, USER_CHUNK_SIZE, 1))
    }

    useEffect(() => {
        if (!userState.fetched) { 
            fetchData()    
        }
    }, [])

    const toggleModal = () => {
        setModalOpen(!modalOpen)
    }

    const modalCallback = (success: boolean) => {
        setModalOpen(false)
        if (success) {       
            fetchData()
        }
    }

    const selectActionJsx = (): JSX.Element => {
        if (modalData) {
            if (modalData.action === UserAction.Create) return (<Create {...{ callback: modalCallback }} />);
            else if (modalData.userData) {
                const modalProps: IUserModalProps = {
                    userData: modalData.userData,
                    callback: modalCallback
                }
                switch (modalData.action) {
                    case UserAction.Edit:
                        return (<Edit {...modalProps} />);
                    case UserAction.Delete:
                        return (<Delete {...modalProps} />);
                }
            }
        }
        return (<div></div>);
    }

    const UserFileRow = (userData: IUserData) => (
        <tr>
            <td>{userData.email}</td>
            <td>{userData.role}</td>
            <td style={{ textAlign: "center" }}>
                <Button
                    color="primary"
                    outline
                    size="sm"
                    onClick={() => {
                        setModalData({
                            action: UserAction.Edit,
                            userData: userData
                        })
                        selectActionJsx()
                        toggleModal()
                    }}
                >
                    Edit
                </Button>
            </td>
            <td style={{ textAlign: "center" }}>
                <Button
                    color="danger"
                    outline
                    size="sm"
                    onClick={() => {
                        setModalData({
                            action: UserAction.Delete,
                            userData: userData
                        })
                        selectActionJsx()
                        toggleModal()
                    }}
                >
                    Delete
                </Button>
            </td>
        </tr>
    );

    const UserRows = () => {
        if (userState.userDatas) {
            return userState.userDatas?.map((uData: IUserData) => {
                return (
                    <UserFileRow key={uData.id} {...uData} />
                );
            })
        }
        return null
    }

    return (
        <div className="container">
            <div className="row align-items-center d-flex justify-content-center" style={{ marginBottom: "1rem" }}>
                <Box className="col-8 col-md-6 col-lg-4" component="form" noValidate onSubmit={() => { }} sx={{ mt: 1 }}>
                    <Button outline
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        style={{ color: "#ebf0f", width: "100%" }}
                        onClick={() => {
                            setModalData({
                                action: UserAction.Create,
                                userData: null
                            })
                            selectActionJsx()
                            toggleModal()
                        }}>
                        Create user
                    </Button>
                </Box>
            </div>
            <Modal className="container" size="" isOpen={modalOpen} toggle={() => { toggleModal() }}>
                <ModalHeader toggle={() => { toggleModal() }} cssModule={{ 'modal-title': 'w-100 text-center' }}>
                    <div className="d-flex justify-content-center">
                        <p>{modalData?.action}</p>
                    </div>
                </ModalHeader>
                <ModalBody className="row align-items-center d-flex justify-content-center m-2">
                    <div className="col">
                        {selectActionJsx()}
                    </div>
                </ModalBody>
            </Modal>
            {
                userState.userDatas && userState.userDatas.length !== 0 ?
                    <div className="row align-items-center d-flex justify-content-center">
                        <table className="table table-hover table-ellipsis">
                            <thead>
                                <tr>
                                    <th scope="col">Email</th>
                                    <th scope="col">Role</th>
                                    <th style={{ width: "10%" }}></th>
                                    <th style={{ width: "10%" }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {UserRows()}
                            </tbody>
                        </table>
                    </div>
                    :
                    <div className="container">
                        <div className="row align-items-center d-flex justify-content-center" style={{ height: "400px" }}>
                            <div className="col-auto">
                                <h5><i>There are no users</i></h5>
                            </div>
                        </div>
                    </div>
            }
            {
                userState.userCount && userState.userCount > 0 ? <CustomPagination {...{
                    total: userState.userCount,
                    chunkSize: USER_CHUNK_SIZE,
                    selected: userState.pageSelected,
                    fetchItems:  (offset: number, limit: number, selected: number) => dispatch(fetchUserData(offset, limit, selected))
                }} /> : <div></div>
            }
        </div>
    );
}