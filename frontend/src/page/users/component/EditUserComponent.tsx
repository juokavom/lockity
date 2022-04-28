import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
    Box, FormControl, FormControlLabel, IconButton, Input, InputLabel, MenuItem,
    Select, Switch, TextField
} from '@mui/material';
import { useState } from 'react';
import { toast } from 'react-toastify';
import {
    Button
} from 'reactstrap';
import { LOADING_TIMEOUT_MS } from '../../../model/Constants';
import { DefaultToastOptions, RequestBuilder } from '../../../model/RequestBuilder';
import { ENDPOINTS, MAX_STORAGE_SIZE } from '../../../model/Server';
import { User } from '../../../model/User';
import { bytesToFormattedSize, DataUnit, formattedSizeToBytes } from '../../files/model/FileModels';
import { LoadingSpinner } from '../../main/components/LoadingSpinnerComponent';
import { IUserModalProps } from '../model/UsersModel';

export function EditUser({ userData, callback }: IUserModalProps): JSX.Element {
    const [showPassword, setShowPassword] = useState(false)
    const [formattedSize, setFormattedSize] = useState(bytesToFormattedSize(userData.storageSize))
    const [loading, setLoading] = useState(false);

    const [user, setUser] = useState<{
        username: string | null,
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
        username: userData.username,
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
            user.username != null && user.username !== "" &&
            user.role != null && user.role !== "" &&
            user.registered != null && (
                user.username !== userData.username ||
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
        setLoading(true)
        await new RequestBuilder()
            .withUrl(ENDPOINTS.USER.userId(userData.id))
            .withMethod('PUT')
            .withDefaults()
            .withBody(user)
            .send((response: any) => {
                setTimeout(() => {
                    setLoading(false)
                    toast.success(response.message, DefaultToastOptions)
                    callback(true)
                }, LOADING_TIMEOUT_MS)
            }, () => {
                setLoading(false)
            })
    }

    if (loading) {
        return (
            <div className="row align-items-end d-flex justify-content-center">
                <LoadingSpinner />
            </div>
        );
    }
    else {
        return (
            <div className="container"><Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
                <TextField
                    margin="normal"
                    required
                    disabled
                    fullWidth
                    id="PublicName"
                    label="Public Name"
                    type="PublicName"
                    name="PublicName"
                    autoComplete="PublicName"
                    variant="standard"
                    defaultValue={userData.publicName}
                />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="Username"
                    label="Username"
                    type="Username"
                    name="Username"
                    autoComplete="Username"
                    variant="standard"
                    defaultValue={user.username}
                    onChange={(e: any) => setUser({ ...user, username: e.target.value })}
                />
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
                    defaultValue={user.email}
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
                    defaultValue={user.name}
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
                    defaultValue={user.surname}
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
                        defaultValue={user.role}
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
                    defaultValue={user.registered}
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
                    defaultValue={user.lastActive}
                    onChange={(e: any) => setUser({ ...user, lastActive: e.target.value })}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
                <InputLabel htmlFor="storageSize">Storage size</InputLabel>
                <Input
                    id="storageSize"
                    type="number"
                    fullWidth
                    value={formattedSize.size}
                    onChange={(e: any) => {
                        const number = e.target.value == "" ? 0 : parseInt(e.target.value)
                        let bytes = formattedSizeToBytes({ size: number, unit: formattedSize.unit })
                        if (bytes < 0) bytes = 0
                        else if (bytes > MAX_STORAGE_SIZE) bytes = MAX_STORAGE_SIZE
                        setUser({ ...user, storageSize: bytes })
                        setFormattedSize(bytesToFormattedSize(bytes))
                    }}
                    endAdornment={
                        <Select
                            id="Unit"
                            label="Unit"
                            variant="standard"
                            value={formattedSize.unit}
                            onChange={(e: any) => {
                                let bytes = formattedSizeToBytes({ size: formattedSize.size, unit: e.target.value })
                                if (bytes < 0) bytes = 0
                                else if (bytes > MAX_STORAGE_SIZE) bytes = MAX_STORAGE_SIZE
                                setUser({ ...user, storageSize: bytes })
                                setFormattedSize(bytesToFormattedSize(bytes))
                            }}
                        >
                            <MenuItem value={DataUnit.B}>Byte</MenuItem>
                            <MenuItem value={DataUnit.KB}>Kilobyte</MenuItem>
                            <MenuItem value={DataUnit.MB}>Megabyte</MenuItem>
                            <MenuItem value={DataUnit.GB}>Gigabyte</MenuItem>
                        </Select>
                    }
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
}