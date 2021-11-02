import Files from './FilesComponent';
import Upload from './UploadComponent';
import UserSettings from './UserSettingsComponent';
import Users from './UsersComponent';
import { Switch, Route, Redirect, withRouter } from 'react-router-dom';
import Newsletter from './NewsletterComponent';
import Login from './auth/LoginComponent';
import { ROUTES } from '../models/Routes';
import { useEffect, useState } from 'react';
import { User } from '../models/User';
import Test from './TestComponent';

function Main() {
    const [user, setUser] = useState(null)

    useEffect(() => {
        const localStorageUser = localStorage.getItem(User.storagename)
        if (localStorageUser) setUser(JSON.parse(localStorageUser))
    }, [])

    return (
        <div>
            <Switch>
                <Route exact path={ROUTES.login} component={() => <Login />} />
                <Route exact path={ROUTES.files} component={() => <Files />} />
                <Route exact path={ROUTES.test} component={() => <Test />} />
                <Route exact path={ROUTES.upload} component={() => <Upload />} />
                <Route exact path={ROUTES.userSettings} component={() => <UserSettings />} />
                <Route exact path={ROUTES.users} component={() => <Users />} />
                <Route exact path={ROUTES.newsletter} component={() => <Newsletter />} />
                <Redirect to={ROUTES.DEFAULT} />
            </Switch>
        </div>
    );
}
export default Main;