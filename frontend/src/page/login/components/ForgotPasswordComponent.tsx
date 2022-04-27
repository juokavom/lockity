import { Box } from "@mui/material";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useState } from "react";
import { toast } from "react-toastify";
import { LOADING_TIMEOUT_MS } from "../../../model/Constants";
import { DefaultToastOptions, RequestBuilder } from "../../../model/RequestBuilder";
import { ENDPOINTS } from "../../../model/Server";
import { LoadingSpinner } from "../../main/components/LoadingSpinnerComponent";

export function ForgotPassword({ callback }: { callback: (success: boolean) => void }) {
    const [email, setEmail] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        return email != null && email.length > 0;
    }

    const handleSubmit = async (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        await RegisterAction();
    }

    const RegisterAction = async () => {
        setLoading(true)
        await new RequestBuilder()
            .withUrl(ENDPOINTS.AUTH.forgotPassword)
            .withMethod('POST')
            .withDefaults()
            .withBody({
                email: email
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
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={!validateForm()}
                    >
                        Restore
                    </Button>
                </Box>
            </div>
        );
    }
}