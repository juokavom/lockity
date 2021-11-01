import Files from './FilesComponent';
import Upload from './UploadComponent';
import UserSettings from './UserSettingsComponent';
import Users from './UsersComponent';
import { Switch, Route, Redirect, withRouter } from 'react-router-dom';
import { connect, ConnectedProps } from 'react-redux';
import Newsletter from './NewsletterComponent';
import Login from './auth/LoginComponent';
import Logout from './auth/LogoutComponent';
import { LoginAction } from '../redux/ActionCreators';


const mapStateToProps = (state: any) => {
    return {
        auth: state.auth
    };
}

const mapDispatchToProps = (dispatch: any) => ({
    login: (email: string, password: string) => dispatch(LoginAction(email, password))
})

const connector = connect(mapStateToProps, mapDispatchToProps)

export type Props = ConnectedProps<typeof connector>

function Main(props: Props) {
    return (
        <div>
            <Switch>
                <Route exact path="/login" component={() => <Login {...props} />} />
                <Route exact path="/logout" component={() => <Logout />} />
                <Route exact path="/files" component={() => <Files />} />
                <Route exact path="/upload" component={() => <Upload />} />
                <Route exact path="/usersettings" component={() => <UserSettings />} />
                <Route exact path="/users" component={() => <Users />} />
                <Route exact path="/newsletter" component={() => <Newsletter />} />
                <Redirect to="/files" />
            </Switch>
        </div>
    );
}
export default withRouter(connector(Main));