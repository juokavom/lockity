import { useState } from "react";
import './Login.scss';
import Button from '@mui/material/Button';
import { DefaultToastOptions, RequestBuilder } from "../../model/RequestBuilder";
import { ENDPOINTS, LANDING_URL } from "../../model/Server";
import { User } from "../../model/User";
import { ROUTES } from "../../model/Routes";
import TextField from '@mui/material/TextField';
import { Box, Grid } from "@mui/material";
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { toast } from "react-toastify";
import { Modal, ModalBody, ModalHeader } from "reactstrap";

export function Copyright(prop: any) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...prop}>
            {'© '}{' '}
            {new Date().getFullYear()}{' '}
            <Link color="inherit" href={LANDING_URL}>
                Lockity.com
            </Link>
        </Typography>
    );
}

function Register({ callback }: { callback: (success: boolean) => void }) {
    const [name, setName] = useState<string | null>(null);
    const [surname, setSurname] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [password, setPassword] = useState<string | null>(null);

    const validateForm = () => {
        return email != null && email.length > 0 && password != null && password.length > 0;
    }

    const handleSubmit = async (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        await RegisterAction();
    }

    const RegisterAction = async () => {
        await new RequestBuilder()
            .withUrl(ENDPOINTS.AUTH.register)
            .withMethod('POST')
            .withDefaults()
            .withBody({
                name: name,
                surname: surname,
                email: email,
                password: password
            })
            .send((response: any) => {
                toast.success(response.message, DefaultToastOptions)
                callback(true)
            }, () => { })
    };

    return (
        <div>
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
                <TextField
                    margin="normal"
                    fullWidth
                    id="name"
                    label="Name"
                    name="name"
                    autoComplete="name"
                    variant="standard"
                    onChange={(e: any) => setName(e.target.value)}
                />
                <TextField
                    margin="normal"
                    fullWidth
                    id="surname"
                    label="Surname"
                    name="surname"
                    autoComplete="surname"
                    variant="standard"
                    onChange={(e: any) => setSurname(e.target.value)}
                />
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
                    Register
                </Button>
            </Box>
        </div>
    );
}

function Login() {
    const [modalOpen, setModalOpen] = useState(false)
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

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
        await new RequestBuilder()
            .withUrl(ENDPOINTS.AUTH.login)
            .withMethod('POST')
            .withDefaults()
            .withBody({
                email: email,
                password: password
            })
            .send((loggedUser: User.FrontendUser) => {
                // toast.success('Login successful', DefaultToastOptions)
                localStorage.setItem(User.storagename, JSON.stringify(loggedUser))
                window.location.replace(ROUTES.myFiles)
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
                            onClick={() => window.location.replace(ROUTES.upload)}
                        >
                            Proceed to upload page
                        </Button>
                        {/* <Copyright sx={{ mt: 2 }} /> */}
                    </Box>
                </div>
            </div >
        </div>
    );
}

export default Login;