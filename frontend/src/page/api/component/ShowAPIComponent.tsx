import {
    Box, Card, CardHeader, Checkbox, Divider, List, ListItem, ListItemIcon, ListItemText, TextField
} from '@mui/material';
import React from 'react';
import { APIPermissions, IAPIModalProps, numberOfChecked } from '../model/APIModel';

export function ShowAPI({ apiData, callback }: IAPIModalProps): JSX.Element {
    const permissions = Object.values(APIPermissions)
    return (
        <div className="container">
            <Box component="form" noValidate sx={{ mt: 1 }}>
                <TextField
                    disabled
                    margin="normal"
                    required
                    fullWidth
                    id="Title"
                    label="Title"
                    name="Title"
                    autoComplete="Title"
                    variant="standard"
                    defaultValue={apiData.title}
                />
                <TextField
                        margin="normal"
                        required
                        disabled
                        fullWidth
                        id="Token"
                        label="Token"
                        name="Token"
                        autoComplete="Token"
                        variant="standard"
                        defaultValue={apiData.token + "*".repeat(28) }
                    />
                <Card
                    sx={{ mt: 2 }}>
                    <CardHeader
                        sx={{ px: 2 }}
                        avatar={
                            <Checkbox
                                disabled
                                checked={
                                    numberOfChecked(apiData.permissions, permissions) === permissions.length && permissions.length !== 0
                                }
                                indeterminate={
                                    numberOfChecked(apiData.permissions, permissions) !== permissions.length &&
                                    numberOfChecked(apiData.permissions, permissions) !== 0
                                }
                                inputProps={{
                                    "aria-label": "all items selected"
                                }}
                            />
                        }
                        title={"Permissions"}
                        subheader={`${numberOfChecked(apiData.permissions, permissions)}/${permissions.length} selected`}
                    />
                    <Divider />
                    <List
                        sx={{
                            height: 230,
                            bgcolor: "background.paper",
                            overflow: "auto"
                        }}
                        dense
                        component="div"
                        role="list"
                    >
                        {permissions.map((value: string) => {
                            return (
                                <ListItem                                
                                    disabled
                                    key={value}
                                    role="listitem"
                                    button>
                                    <ListItemIcon>
                                        <Checkbox
                                            checked={apiData.permissions.indexOf(value) !== -1}
                                            tabIndex={-1}
                                            disableRipple
                                        />
                                    </ListItemIcon>
                                    <ListItemText id={value + 'id'} primary={value} />
                                </ListItem>
                            );
                        })}
                        <ListItem />
                    </List>
                </Card>
                <TextField
                    disabled
                    margin="normal"
                    required
                    fullWidth
                    variant="standard"
                    id="validFrom"
                    label="Valid from"
                    type="datetime-local"
                    inputProps={{ step: 1 }}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    defaultValue={apiData.validFrom}
                />
                <TextField
                disabled
                    margin="normal"
                    fullWidth
                    required
                    variant="standard"
                    id="validTo"
                    label="Valid to"
                    type="datetime-local"
                    inputProps={{ step: 1 }}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    defaultValue={apiData.validTo}
                />
            </Box>
        </div>
    );
}
