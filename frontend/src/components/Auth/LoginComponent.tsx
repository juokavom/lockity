import { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { DefaultToastOptions, RequestBuilder } from "../../models/RequestBuilder";
import { ENDPOINTS } from "../../models/Server";
import { User } from "../../models/User";
import { toast } from "react-toastify";
import { ROUTES } from "../../models/Routes";

export default function Login() {
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
        <div className="Login">
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="email" >
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        autoFocus
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </Form.Group>
                <Form.Group controlId="password">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </Form.Group>
                <Button type="submit" disabled={!validateForm()}>
                    Login
                </Button>
            </Form>
        </div >
    );
}