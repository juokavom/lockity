import { Box } from "@mui/material";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useState } from "react";
import { toast } from "react-toastify";
import { LOADING_TIMEOUT_MS } from "../../../model/Constants";
import { DefaultToastOptions, RequestBuilder } from "../../../model/RequestBuilder";
import { ENDPOINTS } from "../../../model/Server";
import { LoadingSpinner } from "../../main/components/LoadingSpinnerComponent";

export function Register({ callback }: { callback: (success: boolean) => void }) {
    const [name, setName] = useState<string | null>(null);
    const [surname, setSurname] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [password, setPassword] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        return email != null && email.length > 0 && password != null && password.length > 0;
    }

    const handleSubmit = async (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        await RegisterAction();
    }

    const RegisterAction = async () => {
        setLoading(true)
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
                setTimeout(() => {
                    setLoading(false)
                    toast.success(response.message, DefaultToastOptions)
                    callback(true)
                }, LOADING_TIMEOUT_MS)
            }, () => {
                setLoading(false)
             })
    };

    if (loading) {
        return (
            <LoadingSpinner />
        );
    } else {
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
}