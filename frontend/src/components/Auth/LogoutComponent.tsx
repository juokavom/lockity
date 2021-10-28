import { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { ENDPOINTS } from "../../shared/constants";

export default function Logout() {
    const handleLogout = async () => {        
        const response = await fetch(ENDPOINTS.AUTH.logout, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include'
        });
        console.log('response = ', response);
    }

    return (
        <div className="Logout">
            <Button type="submit" onClick={handleLogout}>
                Logout
            </Button>
        </div>
    );
}