import { Button } from "react-bootstrap";
import { SimpleAction, RegisteredAction, AdminAction, LogoutAction } from "../models/RequestActions";

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