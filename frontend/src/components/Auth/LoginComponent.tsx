import { useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Props } from "../MainComponent";

export default function Login(props: Props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const validateForm = () => {
        return email.length > 0 && password.length > 0;
    }

    const handleSubmit = async (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        await props.login(email, password)
    }

    useEffect(() => {
        console.log('logged user = ', props.auth.user)
    }, [props.auth]);

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
        </div>
    );
}