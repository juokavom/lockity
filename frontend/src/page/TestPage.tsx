import { Button } from "@mui/material";
import { SimpleAction, RegisteredAction, AdminAction, LogoutAction } from "../model/RequestActions";

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