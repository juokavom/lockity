import Upload from '../upload/UploadPage';
import { Switch, Route, Redirect } from 'react-router-dom';
import Login from '../login/LoginPage';
import { ROUTES } from '../../model/Routes';
import { useState } from 'react';
import { User } from '../../model/User';
import Test from '../TestPage';
import './Main.scss';
import MyFiles from '../FilesPage';
import Header from '../Header/HeaderComponent';

const localStorageUser = localStorage.getItem(User.storagename)
let parsedUser: User.FrontendUser | null = null

if (localStorageUser) {
    parsedUser = JSON.parse(localStorageUser)
}

export default function Main() {
    const [user] = useState<User.FrontendUser | null>(parsedUser)

    const isAdmin = user != null ? User.isAdmin(user.role) : false
    const isAuthed = user != null ? User.isAuthed(user.role) : false

    if (!isAuthed) {
        return (
            <div>
                <Switch>
                    <Route exact path={ROUTES.login} component={() => <Login />} />
                    <Route exact path={ROUTES.upload} component={() => <Upload />} />
                    <Route exact path={ROUTES.test} component={() => <Test />} />
                    <Redirect to={ROUTES.upload} />
                </Switch>
            </div>
        );
    } else {
        return (
            <div className="container center-main">
                <div className="row justify-content-center">
                    <div className="mainbox col-12">
                        <Header />
                        <Switch>
                            <Route exact path={ROUTES.test} component={() => <Test />} />
                            {/* <Route exact path={ROUTES.users} component={() => isAdmin ? <Users /> : <Login />} /> */}
    
                            <Route exact path={ROUTES.myFiles} component={() => <MyFiles />} />
                            <Redirect to={ROUTES.myFiles} />
                        </Switch>
                    </div>
                </div>
            </div>
        );
    }
}