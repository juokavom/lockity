import { Box, Grid } from "@mui/material";
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from "react";
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
import { Register } from "./components/RegisterComponent";
import './styles/Login.scss';

export default function LoginPage() {
    const [modalOpen, setModalOpen] = useState(false)
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const history = useHistory();
    const dispatch = useDispatch();

    const validateForm = () => {
        return email.length > 0 && password.length > 0;
    }

    const toggleModal = () => {
        setModalOpen(!modalOpen)
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
                    localStorage.setItem(User.storagename, JSON.stringify(loggedUser))
                    dispatch(LocalUserActionCreators.setUser(loggedUser))
                    history.push(ROUTES.filesPage)
                }, LOADING_TIMEOUT_MS)
            }, () => { })
    };

    return (
        <div>
            <Modal className="container" isOpen={modalOpen} toggle={() => { toggleModal() }}>
                <ModalHeader toggle={() => { toggleModal() }} cssModule={{ 'modal-title': 'w-100 text-center' }}>
                    <div className="d-flex justify-content-center">
                        <p>Register</p>
                    </div>
                </ModalHeader>
                <ModalBody className="row align-items-center d-flex justify-content-center m-2">
                    <div className="col">
                        <Register {...{ callback: (success: boolean) => toggleModal() }} />
                    </div>
                </ModalBody>
            </Modal>
            <div className="backImage"></div>
            <div className="loginspinner" >
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
                                onChange={(e: any) => setEmail(e.target.value)}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                autoComplete="password"
                                variant="standard"
                                onChange={(e: any) => setPassword(e.target.value)}
                            />
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
                                    <Link href="#" variant="body2">
                                        Forgot password?
                                    </Link>
                                </Grid>
                                <Grid item>
                                    <Link href="#" variant="body2" onClick={() => toggleModal()}>
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