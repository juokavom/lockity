import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Box, FormControl, IconButton, Input, InputLabel, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button } from 'reactstrap';
import { DefaultToastOptions, RequestBuilder } from '../../../model/RequestBuilder';
import { ROUTES } from '../../../model/Routes';
import { ENDPOINTS } from '../../../model/Server';

export default function RestorePasswordPage({ match }: any) {
    const [showPassword, setShowPassword] = useState<{
        first: boolean,
        second: boolean
    }>({
        first: false,
        second: false
    })
    const [password, setPassword] = useState<{
        first: string | null,
        second: string | null
    }>({
        first: null,
        second: null
    });

    const history = useHistory()

    const validateForm = () => {
        return password.first != null && password.first.length > 0 &&
            password.second != null && password.second.length > 0 && password.first == password.second;
    }

    const ConfirmAction = async () => {
        await new RequestBuilder()
            .withUrl(ENDPOINTS.AUTH.forgotPasswordConfirm)
            .withMethod('POST')
            .withDefaults()
            .withBody({
                link: match.params.id,
                password: password.first
            })
            .send((response: any) => {
                toast.success(response.message, DefaultToastOptions)
                history.push(ROUTES.login)
            }, () => { })
    };

    return (
        <div className="container">
            <div className="row align-items-center d-flex justify-content-center">
                <Box component="form" style={{ maxWidth: "400px", backgroundColor: 'white', borderRadius: 10 }} noValidate sx={{ m: 2 }}>
                    <h5 style={{textAlign: "center", marginTop: 15}}><i>Reset password</i></h5>
                    <FormControl
                        margin="normal"
                        fullWidth
                        variant="standard"
                        required
                    >
                        <InputLabel htmlFor="password">Password</InputLabel>
                        <Input
                            id="password"
                            type={showPassword.first ? 'text' : 'password'}
                            onChange={(e: any) => setPassword({ ...password, first: e.target.value })}
                            defaultValue={password.first}
                            endAdornment={
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={() => setShowPassword({ ...showPassword, first: !showPassword.first })}
                                >
                                    {showPassword.first ? <Visibility /> : <VisibilityOff />}
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
                        <InputLabel htmlFor="password">Repeat password</InputLabel>
                        <Input
                            id="password"
                            type={showPassword.second ? 'text' : 'password'}
                            onChange={(e: any) => setPassword({ ...password, second: e.target.value })}
                            defaultValue={password.second}
                            endAdornment={
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={() => setShowPassword({ ...showPassword, second: !showPassword.second })}
                                >
                                    {showPassword.second ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                            }
                        />
                    </FormControl>
                    <div className="row align-center justify-content-center mt-4 mb-3" >
                        <div className="col-auto" >
                            <Button
                                variant="contained"
                                disabled={!validateForm()}
                                onClick={() => ConfirmAction()}
                            >
                                Confirm password
                            </Button>
                        </div>
                    </div>
                </Box>
            </div>
        </div>
    );
}