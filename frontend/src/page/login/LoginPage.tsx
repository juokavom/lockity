import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Box, FormControl, Grid, IconButton, Input, InputLabel } from "@mui/material";
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import { LOADING_TIMEOUT_MS } from "../../model/Constants";
import { RequestBuilder } from "../../model/RequestBuilder";
import { ROUTES } from "../../model/Routes";
import { ENDPOINTS } from "../../model/Server";
import { User } from "../../model/User";
import { LocalUserActionCreators } from "../../redux/actionCreators/LocalUserActionCreators";
import { LoadingSpinner } from "../main/components/LoadingSpinnerComponent";
import { ForgotPassword } from "./components/ForgotPasswordComponent";
import { Register } from "./components/RegisterComponent";
import './styles/Login.scss';

export default function LoginPage() {
    const [modalOpen, setModalOpen] = useState(false)
    const [modalTitle, setModalTitle] = useState<string | null>(null)
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false)

    const history = useHistory();
    const dispatch = useDispatch();

    const validateForm = () => {
        return email.length > 0 && password.length > 0;
    }

    const toggleModal = () => {
        setModalOpen(!modalOpen)
    }

    enum LoginModalActions {
        Register = "Register",
        RestorePassword = "Restore Password"
    }

    const handleSubmit = async (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        await LoginAction(email, password)
    }

    const LoginAction = async (email: string, password: string) => {
        setLoading(true)
        await new RequestBuilder()
            .withUrl(ENDPOINTS.AUTH.login)
            .withMethod('POST')
            .withDefaults()
            .withBody({
                email: email,
                password: password
            })
            .send((loggedUser: User.FrontendUser) => {
                setTimeout(() => {
                    setLoading(false)
                    dispatch(LocalUserActionCreators.setUser(loggedUser))
                    history.push(ROUTES.filesPage)
                }, LOADING_TIMEOUT_MS)
            }, () => {
                setLoading(false)
            })
    };

    return (
        <div>
            <Modal className="container" isOpen={modalOpen} toggle={() => { toggleModal() }}>
                <ModalHeader toggle={() => { toggleModal() }} cssModule={{ 'modal-title': 'w-100 text-center' }}>
                    <div className="d-flex justify-content-center">
                        <p>{modalTitle}</p>
                    </div>
                </ModalHeader>
                <ModalBody className="row align-items-center d-flex justify-content-center m-2">
                    <div className="col">
                        {
                            modalTitle && modalTitle == LoginModalActions.Register &&
                            <Register {...{ callback: (success: boolean) => toggleModal() }} />
                        }
                        {
                            modalTitle && modalTitle == LoginModalActions.RestorePassword &&
                            <ForgotPassword {...{ callback: (success: boolean) => toggleModal() }} />
                        }
                    </div>
                </ModalBody>
            </Modal>
            <div className="loginspinner fade-in">
                <div>
                    {loading && <LoadingSpinner />}
                    {!loading &&
                        <>
                            <Typography align="center" component="h1" variant="h5">
                                Log in
                            </Typography>
                            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="email"
                                    label="Email"
                                    name="email"
                                    autoComplete="email"
                                    variant="standard"
                                    defaultValue={email}
                                    onChange={(e: any) => setEmail(e.target.value)}
                                />
                                <FormControl
                                    margin="normal"
                                    fullWidth
                                    variant="standard"
                                    required       
                                >
                                    <InputLabel htmlFor="password">Password</InputLabel>
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        onChange={(e: any) => setPassword(e.target.value)}
                                        defaultValue={password}
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
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    sx={{ mt: 3, mb: 2 }}
                                    disabled={!validateForm()}
                                >
                                    Sign In
                                </Button>
                                <Grid container>
                                    <Grid item xs>
                                        <Link href="#" variant="body2" onClick={() => {
                                            setModalTitle(LoginModalActions.RestorePassword)
                                            toggleModal()
                                        }}>
                                            Forgot password?
                                        </Link>
                                    </Grid>
                                    <Grid item>
                                        <Link href="#" variant="body2" onClick={() => {
                                            setModalTitle(LoginModalActions.Register)
                                            toggleModal()
                                        }}>
                                            {"Sign up"}
                                        </Link>
                                    </Grid>
                                </Grid>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    sx={{ mt: 3, mb: 2 }}
                                    style={{ color: "#ebf0f" }}
                                    onClick={() => history.push(ROUTES.upload)}
                                >
                                    Proceed to upload page
                                </Button>
                            </Box>
                        </>
                    }
                </div>
            </div >
        </div>
    );
}