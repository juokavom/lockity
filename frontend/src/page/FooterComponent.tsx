import MailOutlineIcon from '@mui/icons-material/MailOutline';
import { Copyright } from './login/LoginPage';
import { createTheme, ThemeProvider } from '@mui/material';
import { CONTACT_EMAIL } from '../model/Server';

let theme = createTheme({
    palette: {
        primary: {
            main: '#79a3d1',
        },
    },
});

export default function Footer() {
    return (
        <div className="footer">
            <ThemeProvider theme={theme}>
                <a href={CONTACT_EMAIL}> <MailOutlineIcon color="primary" style={{ fontSize: 26 }}/></a>
            </ThemeProvider>
            <p className="permanent-marker">Lockity</p>
            <Copyright />
        </div>
    );
}