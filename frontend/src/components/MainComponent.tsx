import React, { Component } from 'react';
import Files from './FilesComponent';
import Upload from './UploadComponent';
import UserSettings from './UserSettingsComponent';
import Users from './UsersComponent';
import { Switch, Route, Redirect } from 'react-router-dom';
import Newsletter from './NewsletterComponent';
import Login from './Auth/LoginComponent';
import Cookies from 'universal-cookie';

function Main() {

    // const HomePage = () => {
    //     return (
    //         <Home dish={this.props.dishes.dishes.filter((dish) => dish.featured)[0]}
    //             dishesLoading={this.props.dishes.isLoading}
    //             dishesErrMess={this.props.dishes.errMess}
    //             promotion={this.props.promotions.promotions.filter((promo) => promo.featured)[0]}
    //             promoLoading={this.props.promotions.isLoading}
    //             promoErrMess={this.props.promotions.errMess}
    //             leader={this.props.leaders.leaders.filter((leader) => leader.featured)[0]}
    //             leaderLoading={this.props.leaders.isLoading}
    //             leaderErrMess={this.props.leaders.errMess}
    //         />
    //     );
    // }

    // const [jwtCookie, setCookie, removeCookie] = useCookies(['jwt']);

    // setCookie("jwt", "assasasas")
    // console.log('jwt cookie = ', jwtCookie.jwt)

    // const cookies = new Cookies();
    // console.log(cookies.get('jwt', { path: '/auth' }))

    return (
        <div>
            <Switch>
                <Route exact path="/login" component={() => <Login />} />
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
export default Main;
