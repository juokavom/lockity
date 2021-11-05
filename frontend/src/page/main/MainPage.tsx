import Files from '../FilesPage';
import Upload from '../upload/UploadPage';
import UserSettings from '../UserSettings';
import Users from '../UsersPage';
import { Switch, Route, Redirect } from 'react-router-dom';
import Newsletter from '../NewsletterPage';
import Login from '../login/LoginPage';
import { ROUTES } from '../../model/Routes';
import { useState } from 'react';
import { User } from '../../model/User';
import Test from '../TestPage';
import './Main.scss';

const localStorageUser = localStorage.getItem(User.storagename)
let parsedUser: User.FrontendUser | null = null

if (localStorageUser) {
    parsedUser = JSON.parse(localStorageUser)
}

function Main() {
    const [user] = useState<User.FrontendUser | null>(parsedUser)

    const isAdmin = user != null ? User.isAdmin(user.role) : false
    const isAuthed = user != null ? User.isAuthed(user.role) : false

    return (
        <div>
            <Switch>
                <Route exact path={ROUTES.users} component={() => isAdmin ? <Users /> : <Login />} />
                <Route exact path={ROUTES.newsletter} component={() => isAdmin ? <Newsletter /> : <Login />} />

                <Route exact path={ROUTES.files} component={() => isAuthed ? <Files /> : <Login />} />
                <Route exact path={ROUTES.userSettings} component={() => isAuthed? <UserSettings /> : <Login /> } />

                <Route exact path={ROUTES.login} component={() => <Login />} />
                <Route exact path={ROUTES.upload} component={() => <Upload />} />
                <Route exact path={ROUTES.test} component={() => <Test />} />

                <Redirect to={ROUTES.DEFAULT} />
            </Switch>
        </div>
    );
}
export default Main;