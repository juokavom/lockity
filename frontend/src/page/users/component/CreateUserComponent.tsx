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

export function CreateUser({ callback }: any): JSX.Element {
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