import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { LANDING_URL } from "../../../model/Server";

export function Copyright(prop: any) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...prop}>
            {'© '}{' '}
            {new Date().getFullYear()}{' '}
            <Link color="inherit" href={LANDING_URL}>
                Lockity.com
            </Link>
        </Typography>
    );
}