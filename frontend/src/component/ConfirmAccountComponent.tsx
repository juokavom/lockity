import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { Button } from "reactstrap";
import { DefaultToastOptions, RequestBuilder } from "../model/RequestBuilder";
import { ROUTES } from "../model/Routes";
import { ENDPOINTS } from '../model/Server';

export function ConfirmAccount({ match }: any) {
    const history = useHistory()

    const ConfirmAction = async () => {
        await new RequestBuilder()
            .withUrl(ENDPOINTS.AUTH.registerConfirm)
            .withMethod('POST')
            .withDefaults()
            .withBody({
                link: match.params.id
            })
            .send((response: any) => {
                toast.success(response.message, DefaultToastOptions)
                history.push(ROUTES.login)
            }, () => { })
    };

    return (
        <div className="container mainbox-main">
            <div className="row align-center justify-content-center" >
                <div className="col-auto" >
                    <Button
                        type="submit"
                        variant="contained"
                        onClick={() => ConfirmAction()}
                    >
                        Confirm registration
                    </Button>
                </div>
            </div>
        </div>
    );
}