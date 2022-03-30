import { useEffect, useState } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button } from 'reactstrap';
import { DefaultToastOptions, RequestBuilder } from '../../model/RequestBuilder';
import { ROUTES } from '../../model/Routes';
import { ENDPOINTS } from '../../model/Server';
import { User } from '../../model/User';
import Download from '../DownloadPage';
import { FilesPage } from '../FilesPage';
import Footer from '../FooterComponent';
import Header from '../header/HeaderComponent';
import Login from '../login/LoginPage';
import { ReceivedPage } from '../ReceivedPage';
import { SharedPage } from '../SharedPage';
import Test from '../TestPage';
import Upload from '../upload/UploadPage';
import { IUserData, Users, USER_CHUNK_SIZE } from '../UsersPage';
import './Main.scss';

const localStorageUser = localStorage.getItem(User.storagename)
let parsedUser: User.FrontendUser | null = null

if (localStorageUser) {
    parsedUser = JSON.parse(localStorageUser)
}

function useWindowSize() {
    const [windowSize, setWindowSize] = useState<{
        width: number | null,
        height: number | null
    }>({
        width: null,
        height: null,
    });
    useEffect(() => {
        function handleResize() {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    return windowSize;
}

export interface IHeaderProps {
    user: User.FrontendUser,
    isAdmin: Boolean,
    changedLayout: Boolean
}

export default function Main() {
    const [user] = useState<User.FrontendUser | null>(parsedUser)

    const [changedLayout, setChangedLayout] = useState(false);

    const isAdmin = user != null ? User.isAdmin(user.role) : false
    const isAuthed = user != null ? User.isAuthed(user.role) : false

    const windowSize = useWindowSize();

    useEffect(() => {
        if (windowSize.width && windowSize.width < 992) {
            if (!changedLayout) setChangedLayout(true)
        }
        else {
            if (changedLayout) setChangedLayout(false)
        }
    }, [windowSize])

    const headerProps: IHeaderProps = {
        user: user!,
        isAdmin: isAdmin,
        changedLayout: changedLayout
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