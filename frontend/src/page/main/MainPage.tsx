import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button } from 'reactstrap';
import { DefaultToastOptions, RequestBuilder } from '../../model/RequestBuilder';
import { ROUTES } from '../../model/Routes';
import { ENDPOINTS } from '../../model/Server';
import { WindowActionCreators } from '../../redux/actionCreators/WindowActionCreators';
import { useTypedSelector } from '../../redux/Store';
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

export default function Main() {
    const dispatch = useDispatch()

    useEffect(() => {
        window.addEventListener("resize", () => {
            dispatch(WindowActionCreators.setWindowWidth(window.innerWidth))
        });
    }, []);

    const localUserState = useTypedSelector((state) => state.localUserReducer)

    if (!localUserState.isAuthed) {
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
                        <Header />
                        <div className="route-holder">
                            <Switch>
                                <Route exact path={ROUTES.test} component={() => <Test />} />

                                <Route exact path={ROUTES.filesPage} component={() => <FilesPage />} />
                                <Route exact path={ROUTES.receivedPage} component={() => <ReceivedPage />} />
                                <Route exact path={ROUTES.sharedPage} component={() => <SharedPage />} />

                                {localUserState.isAdmin &&
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