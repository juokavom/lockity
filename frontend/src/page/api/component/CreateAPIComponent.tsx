import {
    Box, Card, CardHeader, Checkbox, Divider, List, ListItem, ListItemIcon, ListItemText, TextField
} from '@mui/material';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import {
    Button, UncontrolledTooltip
} from 'reactstrap';
import { LOADING_TIMEOUT_MS } from '../../../model/Constants';
import { DefaultToastOptions, RequestBuilder } from '../../../model/RequestBuilder';
import { ENDPOINTS } from '../../../model/Server';
import { LoadingSpinner } from '../../main/components/LoadingSpinnerComponent';
import { APIPermissions, numberOfChecked } from '../model/APIModel';

export function CreateAPI({ callback }: any): JSX.Element {
    const permissions = Object.values(APIPermissions)
    const [createdToken, setCreatedToken] = useState<string | null>(null)
    const [token, setToken] = useState<{
        title: string | null,
        permissions: string[],
        validFrom: Date | null,
        validTo: Date | null,
    }>({
        title: null,
        permissions: permissions,
        validFrom: null,
        validTo: null,
    });
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        return token != null &&
            token.title !== null && token.title !== "" &&
            token.permissions.length !== 0 &&
            token.validFrom !== null &&
            token.validTo !== null
    }

    const handleSubmit = async (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        await CreateTokenAction();
    }

    const CreateTokenAction = async () => {
        setLoading(true)
        await new RequestBuilder()
            .withUrl(ENDPOINTS.API.api)
            .withMethod('POST')
            .withDefaults()
            .withBody(token)
            .send((response: any) => {
                setTimeout(() => {
                    setLoading(false)
                    toast.success(response.message, DefaultToastOptions)
                    setCreatedToken(response.token)
                }, LOADING_TIMEOUT_MS)
            }, () => {                
                setLoading(false)
             })
    }

    function not(array: string[], element: string) {
        return array.filter((value) => element.indexOf(value) === -1);
    }

    function union(a: any, b: any) {
        return [...a, ...not(b, a)];
    }

    const handleToggle = (value: string) => () => {
        const currentIndex = token.permissions.indexOf(value);
        const newChecked = [...token.permissions];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setToken({ ...token, permissions: newChecked })
    }

    const handleToggleAll = (items: any) => () => {
        if (numberOfChecked(token.permissions, items) === items.length) {
            setToken({ ...token, permissions: not(token.permissions, items) })
        } else {
            setToken({ ...token, permissions: union(token.permissions, items) })
        }
    };

    const copyToken = async () => {
        if (createdToken) {
            await navigator.clipboard.writeText(createdToken);
            toast.info("Token copied to clipboard!", DefaultToastOptions)
        }
    }

    if (loading) {
        return (
            <div className="row align-items-end d-flex justify-content-center">
                <LoadingSpinner />
            </div>
        );
    }
    else if (createdToken) {
        return (
            <div className="border-box">
                <h3>Generated token</h3>
                <div className="col-12 col-md-10 col-xl-10">
                    <div id="fileLink" className="dropzone selected-file" style={{
                        cursor: "default",
                        overflowWrap: "break-word"
                    }} onClick={copyToken}>
                        {createdToken}
                    </div>
                    <UncontrolledTooltip
                        placement="auto"
                        target="fileLink"
                    >
                        Copy to clipboard
                    </UncontrolledTooltip>
                </div>
                <Button
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    style={{ color: "#ebf0f" }}
                    onClick={() => callback(true)}
                >
                    Return
                </Button>
            </div>
        );
    } else {
        return (
            <div className="container">
                <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="Title"
                        label="Title"
                        name="Title"
                        autoComplete="Title"
                        variant="standard"
                        defaultValue={token.title}
                        onChange={(e: any) => setToken({ ...token, title: e.target.value })}
                    />
                    <Card
                        sx={{ mt: 2 }} >
                        <CardHeader
                            sx={{ px: 2 }}
                            avatar={
                                <Checkbox
                                    onClick={handleToggleAll(permissions)}
                                    checked={
                                        numberOfChecked(token.permissions, permissions) === permissions.length && permissions.length !== 0
                                    }
                                    indeterminate={
                                        numberOfChecked(token.permissions, permissions) !== permissions.length &&
                                        numberOfChecked(token.permissions, permissions) !== 0
                                    }
                                    disabled={permissions.length === 0}
                                    inputProps={{
                                        "aria-label": "all items selected"
                                    }}
                                />
                            }
                            title={"File permissions"}
                            subheader={`${numberOfChecked(token.permissions, permissions)}/${permissions.length} selected`}
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
                                        key={value}
                                        role="listitem"
                                        button
                                        onClick={handleToggle(value)}>
                                        <ListItemIcon>
                                            <Checkbox
                                                checked={token.permissions.indexOf(value) !== -1}
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
                        margin="normal"
                        required
                        fullWidth
                        variant="standard"
                        id="validFrom"
                        label="Valid from"
                        type="datetime-local"
                        inputProps={{ step: 1 }}
                        defaultValue={token.validFrom}
                        onChange={(e: any) => setToken({ ...token, validFrom: e.target.value })}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                    <TextField
                        margin="normal"
                        fullWidth
                        required
                        variant="standard"
                        id="validTo"
                        label="Valid to"
                        type="datetime-local"
                        inputProps={{ step: 1 }}
                        defaultValue={token.validTo}
                        onChange={(e: any) => setToken({ ...token, validTo: e.target.value })}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                    <div className="selected-file-wrapper">
                        <Button
                            type="submit"
                            variant="contained"
                            className="upload-button"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={!validateForm()}
                        >
                            Save
                        </Button>
                    </div>
                </Box>
            </div>
        );
    }
}