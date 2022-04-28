import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
    Box, FormControl, FormControlLabel, IconButton, Input, InputLabel, MenuItem,
    Select, Switch, TextField
} from '@mui/material';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from 'reactstrap';
import { DefaultToastOptions, RequestBuilder } from '../../../model/RequestBuilder';
import { ENDPOINTS } from '../../../model/Server';
import { User } from '../../../model/User';
import { bytesToFormattedSize, DataUnit } from '../../files/model/FileModels';
import { IUserEditModalProps } from '../model/HeaderModels';

export function EditMyself({ userData, callback }: IUserEditModalProps): JSX.Element {
    const [showPassword, setShowPassword] = useState(false)
    const formattedSize = bytesToFormattedSize(userData?.storageSize)

    const [user, setUser] = useState<{
        name: string | null,
        username: string | null,
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
        username: userData!.username,
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
            user.username != null && user.username !== "" &&
            user.email != null && user.email !== "" &&
            user.registered != null && (
                user.username !== userData!.username ||
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
                username: user.username,
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
                disabled
                fullWidth
                id="PublicName"
                label="Public Name"
                type="PublicName"
                name="PublicName"
                autoComplete="PublicName"
                variant="standard"
                defaultValue={userData!.publicName}
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
                defaultValue={userData!.username}
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
            <FormControl
                margin="normal"
                fullWidth
                variant="standard"
                disabled>
                <InputLabel htmlFor="storageSize">Storage size</InputLabel>
                <Input
                    id="storageSize"
                    type="number"
                    defaultValue={formattedSize.size}
                    endAdornment={
                        <Select
                            id="Unit"
                            label="Unit"
                            defaultValue={formattedSize.unit}
                        >
                            <MenuItem value={DataUnit.B}>Byte</MenuItem>
                            <MenuItem value={DataUnit.KB}>Kilobyte</MenuItem>
                            <MenuItem value={DataUnit.MB}>Megabyte</MenuItem>
                            <MenuItem value={DataUnit.GB}>Gigabyte</MenuItem>
                        </Select>
                    }
                />
            </FormControl>
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