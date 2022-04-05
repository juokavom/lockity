import { Dispatch, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button } from 'reactstrap';
import { DefaultToastOptions, RequestBuilder } from '../../model/RequestBuilder';
import { ROUTES } from '../../model/Routes';
import { ENDPOINTS } from '../../model/Server';
import { User } from '../../model/User';
import { Action } from '../../redux/actionCreators/Action';
import { GlobalActionCreators } from '../../redux/actionCreators/GlobalActionCreators';
import Download from '../DownloadPage';
import { FilesPage } from '../FilesPage';
import Footer from '../FooterComponent';
import Header from '../Header/HeaderComponent';
import Login from '../login/LoginPage';
import { ReceivedPage } from '../ReceivedPage';
import { SharedPage } from '../SharedPage';
import Test from '../TestPage';
import Upload from '../upload/UploadPage';
import { Users } from '../UsersPage';
import './Main.scss';

export interface IHeaderProps {
    user: User.FrontendUser,
    isAuthed: Boolean,
    isAdmin: Boolean
}

const setWindowSize = (width: number) => async (dispatch: Dispatch<Action>) => {
    dispatch(GlobalActionCreators.setWindowWidth(width))
}

export default function Main() {
    const localStorageUser = localStorage.getItem(User.storagename)    
    const user: User.FrontendUser | null = localStorageUser? JSON.parse(localStorageUser) : null

    const dispatch = useDispatch()

    const isAdmin = user != null ? User.isAdmin(user.role) : false
    const isAuthed = user != null ? User.isAuthed(user.role) : false

    useEffect(() => {
        window.addEventListener("resize", () => {
            dispatch(setWindowSize(window.innerWidth))
        });
    }, []);

    const headerProps: IHeaderProps = {
        user: user!,
        isAuthed: isAuthed,
        isAdmin: isAdmin
    }

    if (!isAuthed) {
        return (
            <div>
                <Switch>
                    <Route path="/confirm/:id" component={ConfirmWithId} />
                    <Route exact path={ROUTES.login} component={() => <Login />} />
                    <Route exact path={ROUTES.upload} component={() => <Upload />} />
                    <Route path={ROUTES.download + "/:id"}  component={Download} />
                    <Route exact path={ROUTES.test} component={() => <Test />} />
                    <Redirect to={ROUTES.upload} />
                </Switch>
            </div>
        );
    } else {
        return (
            <div className="container mainbox-main">
                <div className="row justify-content-center">
                    <div className="mainbox col-10 col-sm-12 col-xl-10">
                        <Header {...headerProps} />
                        <div className="route-holder">
                            <Switch>
                                <Route exact path={ROUTES.test} component={() => <Test />} />

                                <Route exact path={ROUTES.filesPage} component={() => <FilesPage />} />
                                <Route exact path={ROUTES.receivedPage} component={() => <ReceivedPage />} />
                                <Route exact path={ROUTES.sharedPage} component={() => <SharedPage />} />

                                {isAdmin &&
                                    <Route exact path={ROUTES.users} component={() => <Users />} />
                                }

                                <Redirect to={ROUTES.filesPage} />
                            </Switch>
                        </div>
                        <Footer />
                    </div>
                </div>
            </div >
        );
    }
}


const ConfirmWithId = ({ match }: any) => {
    const ConfirmAction = async () => {
        await new RequestBuilder()
            .withUrl(ENDPOINTS.AUTH.registerConfirm)
            .withMethod('POST')
            .withDefaults()
            .withBody({
                link: match.params.id
            })
            .send((response: any) => {
                toast.success(response.message, DefaultToastOptions)
                window.location.replace(ROUTES.login)
            }, () => { })
    };

    return (
        <div className="container mainbox-main">
            <div className="row align-center justify-content-center" >
                <div className="col-auto" >
                    <Button
                        type="submit"
                        variant="contained"
                        onClick={() => ConfirmAction()}
                    >
                        Confirm registration
                    </Button>
                </div>
            </div>
        </div>
    );
}