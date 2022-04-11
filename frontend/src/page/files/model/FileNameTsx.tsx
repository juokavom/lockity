import { Typography } from "@mui/material";

export const fileNameTsx = (title: string): JSX.Element => (
    <Typography sx={{ mb: 2 }} className="ellipse-text" align="center" component="h1" variant="h5">
        {title}
    </Typography>
);