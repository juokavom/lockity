import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Box, FormControl, IconButton, Input, InputLabel } from '@mui/material';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button } from 'reactstrap';
import { LOADING_TIMEOUT_MS } from '../../../model/Constants';
import { DefaultToastOptions, RequestBuilder } from '../../../model/RequestBuilder';
import { ROUTES } from '../../../model/Routes';
import { ENDPOINTS } from '../../../model/Server';
import { LoadingSpinner } from './LoadingSpinnerComponent';

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
    const [loading, setLoading] = useState(false);
    const history = useHistory()

    const validateForm = () => {
        return password.first != null && password.first.length > 0 &&
            password.second != null && password.second.length > 0 && password.first === password.second;
    }

    const ConfirmAction = async () => {
        setLoading(true)
        await new RequestBuilder()
            .withUrl(ENDPOINTS.AUTH.forgotPasswordConfirm)
            .withMethod('POST')
            .withDefaults()
            .withBody({
                link: match.params.id,
                password: password.first
            })
            .send((response: any) => {
                setTimeout(() => {
                    setLoading(false)
                    toast.success(response.message, DefaultToastOptions)
                    history.push(ROUTES.login)
                }, LOADING_TIMEOUT_MS)
            }, () => {
                setLoading(false)
            })
    };

    return (
        <div className="container">
            <div className="row align-items-center d-flex justify-content-center">
                <Box component="form"
                    style={{ maxWidth: "400px", backgroundColor: 'white', borderRadius: 10 }}
                    noValidate sx={{ m: 2 }}>
                    {loading && <LoadingSpinner />}
                    {!loading &&
                        <>
                            <h5 style={{ textAlign: "center", marginTop: 15 }}><i>Reset password</i></h5>
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
                        </>
                    }
                </Box>
            </div>
        </div>
    );
}