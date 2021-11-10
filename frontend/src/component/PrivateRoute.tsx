import { Redirect, Route } from 'react-router-dom'
import { ROUTES } from '../model/Routes'
import { User } from '../model/User'

interface IPrivateRouteProps {
    component: JSX.Element,
    user: User.FrontendUser | null
}

const RedirectToLoginIfNotAuthorized = (component: JSX.Element, hasPermission: boolean, { ...props }) => {
    return (
        <Route
            {...props}
            render={props =>
                hasPermission ? (
                    component
                ) : (
                    <Redirect to={{ pathname: ROUTES.login, state: { from: props.location } }} />
                )
            }
        />
    )
}

export const AdminRoute = ({ component, user, ...props }: IPrivateRouteProps) =>
    RedirectToLoginIfNotAuthorized(component, user != null ? User.isAdmin(user.role) : false, props)

export const AuthorizedRoute = ({ component, user, ...props }: IPrivateRouteProps) =>
    RedirectToLoginIfNotAuthorized(component, user != null ? User.isAuthed(user.role) : false, props)
