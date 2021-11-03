import { useState } from "react";
import './Login.scss';
import Form from "react-bootstrap/Form";
import Button from '@mui/material/Button';
import { DefaultToastOptions, RequestBuilder } from "../../models/RequestBuilder";
import { ENDPOINTS } from "../../models/Server";
import { User } from "../../models/User";
import { toast } from "react-toastify";
import { ROUTES } from "../../models/Routes";
import TextField from '@mui/material/TextField';
import { Box, Checkbox, Grid } from "@mui/material";
import FormControlLabel from '@mui/material/FormControlLabel';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

function Copyright(prop: any) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...prop}>
            {'Copyright © '}
            <Link color="inherit" href="https://lockity.akramas.com/">
                Lockity
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const validateForm = () => {
        return email.length > 0 && password.length > 0;
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
                toast.success('Login successful', DefaultToastOptions)
                localStorage.setItem(User.storagename, JSON.stringify(loggedUser))
                window.location.replace(ROUTES.DEFAULT)
            })
    };

    return (
        <div>
            <div className="backImage"></div>
            <div className="spinner" >
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
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
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
                            autoComplete="current-password"
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
                                <Link href="#" variant="body2">
                                    {"Sign up"}
                                </Link>
                            </Grid>
                        </Grid>
                        <Copyright sx={{ mt: 5 }} />
                    </Box>
                </div>
            </div >
        </div>
    );
}

export default Login;