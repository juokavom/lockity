import Files from './FilesComponent';
import Upload from './UploadComponent';
import UserSettings from './UserSettingsComponent';
import Users from './UsersComponent';
import { Switch, Route, Redirect } from 'react-router-dom';
import Newsletter from './NewsletterComponent';
import Login from './login/LoginComponent';
import { ROUTES } from '../models/Routes';
import { useState } from 'react';
import { User } from '../models/User';
import Test from './TestComponent';

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
                {isAdmin ? <Route exact path={ROUTES.users} component={() => <Users />} /> : null}
                {isAdmin ? <Route exact path={ROUTES.newsletter} component={() => <Newsletter />} /> : null}

                {isAuthed ? <Route exact path={ROUTES.files} component={() => <Files />} /> : null}
                {isAuthed ? <Route exact path={ROUTES.userSettings} component={() => <UserSettings />} /> : null}

                <Route exact path={ROUTES.login} component={() => <Login />} />
                <Route exact path={ROUTES.upload} component={() => <Upload />} />
                <Route exact path={ROUTES.test} component={() => <Test />} />

                <Redirect to={ROUTES.DEFAULT} />
            </Switch>
        </div>
    );
}
export default Main;