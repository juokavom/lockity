import { Route, Redirect } from 'react-router-dom';

export const PrivateRoute = ({ component }: () => {}) => {
    return (
        <Route {...rest} render={props => {
            if (!auth) {
                // not logged in so redirect to login page with the return url
                return <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
            }
            return <Component {...props} />
        }} />
    );
}