import { Box } from "@mui/material";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { Button } from "reactstrap";
import { LOADING_TIMEOUT_MS } from "../../../model/Constants";
import { DefaultToastOptions, RequestBuilder } from "../../../model/RequestBuilder";
import { ROUTES } from "../../../model/Routes";
import { ENDPOINTS } from '../../../model/Server';
import { LoadingSpinner } from "./LoadingSpinnerComponent";

export function ConfirmAccount({ match }: any) {
    const history = useHistory()
    const [loading, setLoading] = useState(false);

    const ConfirmAction = async () => {
        setLoading(true)
        await new RequestBuilder()
            .withUrl(ENDPOINTS.AUTH.registerConfirm)
            .withMethod('POST')
            .withDefaults()
            .withBody({
                link: match.params.id
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
                    style={{ maxWidth: "400px", minHeight: "200px", backgroundColor: 'white', borderRadius: 10 }}
                    noValidate sx={{ m: 2 }}
                    className="row align-items-center d-flex justify-content-center"
                >
                    {loading && <LoadingSpinner />}
                    {!loading &&
                        <Button
                            style={{ width: 200 }}
                            type="submit"
                            variant="contained"
                            onClick={() => ConfirmAction()}
                        >
                            Confirm registration
                        </Button>
                    }
                </Box>
            </div>
        </div>
    );
}