import { Button } from "@mui/material";
import { RequestBuilder } from "../../model/RequestBuilder";
import { ENDPOINTS } from "../../model/Server";
import { LogoutAction } from "../header/HeaderComponent";

const SimpleAction = async () => {
    await new RequestBuilder()
        .withUrl(ENDPOINTS.endpoint + '/auth/simple')
        .withMethod('GET')
        .withDefaults()
        .send((response: any) => {
            console.log('success simple!, reps = ', response)
        }, () => console.log('error'))
};

const RegisteredAction = async () => {
    await new RequestBuilder()
        .withUrl(ENDPOINTS.endpoint + '/auth/authenticated')
        .withMethod('GET')
        .withDefaults()
        .send((response: any) => {
            console.log('success authed!, reps = ', response)
        }, () => console.log('error'))
};

const AdminAction = async () => {
    await new RequestBuilder()
        .withUrl(ENDPOINTS.endpoint + '/auth/admin')
        .withMethod('GET')
        .withDefaults()
        .send((response: any) => {
            console.log('success admin!, reps = ', response)
        }, () => console.log('error'))
};

export default function Test() {
    return (
        <div>
            <h1>TESTING COMPONENT</h1>
            <Button onClick={async () => await SimpleAction()}>Simple</Button>
            <Button onClick={async () => await RegisteredAction()}>Authed</Button >
            <Button onClick={async () => await AdminAction()}>Admin</Button>
            <Button onClick={async () => await LogoutAction()}>Logout</Button>
        </div>
    );
}