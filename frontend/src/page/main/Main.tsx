import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';
import { ConfirmAccount } from './components/ConfirmAccountComponent';
import { LoadingSpinner } from './components/LoadingSpinnerComponent';
import { ROUTES } from '../../model/Routes';
import { WindowActionCreators } from '../../redux/actionCreators/WindowActionCreators';
import { useTypedSelector } from '../../redux/Store';
import Download from '../download/DownloadPage';
import { FilesPage } from '../files/FilesPage';
import Footer from './components/FooterComponent';
import Login from '../login/LoginPage';
import { ReceivedPage } from '../received/ReceivedPage';
import { SharedPage } from '../shared/SharedPage';
import Test from '../test/TestPage';
import Upload from '../upload/UploadPage';
import { UsersPage } from '../users/UsersPage';
import './styles/Main.scss';
import Header from '../Header/HeaderComponent';
import { APIPage } from '../api/APIPage';
import RestorePasswordPage from './components/RestorePasswordPage';

export default function Main() {
    const dispatch = useDispatch()
    const localUserState = useTypedSelector((state) => state.localUserReducer)
    const loadingState = useTypedSelector((state) => state.loadingReducer)

    useEffect(() => {
        window.addEventListener("resize", () => {
            dispatch(WindowActionCreators.setWindowWidth(window.innerWidth))
        });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    if (!localUserState.isAuthed) {
        return (
            <div>
                <Switch>
                    <Route path={ROUTES.confirm + "/:id"} component={ConfirmAccount} />
                    <Route exact path={ROUTES.login} component={() => <Login />} />
                    <Route exact path={ROUTES.upload} component={() => <Upload />} />
                    <Route path={ROUTES.download + "/:id"} component={Download} />
                    <Route path={ROUTES.reset + "/:id"} component={RestorePasswordPage} />
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
                        {loadingState.loading && <LoadingSpinner />}
                        {!loadingState.loading &&
                            <div className="route-holder">
                                <Switch>
                                    <Route exact path={ROUTES.test} component={() => <Test />} />

                                    <Route exact path={ROUTES.filesPage} component={() => <FilesPage />} />
                                    <Route exact path={ROUTES.receivedPage} component={() => <ReceivedPage />} />
                                    <Route exact path={ROUTES.sharedPage} component={() => <SharedPage />} />
                                    <Route exact path={ROUTES.APIPage} component={() => <APIPage />} />

                                    {localUserState.isAdmin &&
                                        <Route exact path={ROUTES.users} component={() => <UsersPage />} />
                                    }

                                    <Redirect to={ROUTES.filesPage} />
                                </Switch>
                            </div>
                        }
                        <Footer />
                    </div>
                </div>
            </div >
        );
    }
}