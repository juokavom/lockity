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
import { DefaultToastOptions, RequestBuilder } from '../../../model/RequestBuilder';
import { ENDPOINTS, MAX_STORAGE_SIZE } from '../../../model/Server';
import { User } from '../../../model/User';
import { IUserModalProps } from '../model/UsersModel';

export function EditUser({ userData, callback }: IUserModalProps): JSX.Element {
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
