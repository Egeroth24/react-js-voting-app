import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import '../styles/shared.scss';
import '../styles/nav.scss';


class Nav extends Component {

    componentDidMount = () => {
        M.Sidenav.init(document.querySelectorAll('.sidenav'));
    }

    handleClick = (e) => {
        if (e.target.id === 'logout') {
            this.logout();
        }
    }

    logout = () => {
        fetch('/logout', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(res => {
            if (res.ok) {
                return res.json();
            } else {
                return Promise.reject({ status: res.status });
            }
        })
        .then(() => {
            this.props.setAuthenticated(null);
            this.props.history.push('/');
        })
        .catch(() => {
            console.log('Unexpected server error.');
        });
    }

    unauthenticatedNav = (
        <div>
            <nav id="nav" role="navigation">
                <div className="nav-wrapper container">
                    <Link to="/" className="brand-logo">μVote</Link>
                    <a href="#" data-target="mobileNav" className="sidenav-trigger"><i className="material-icons">menu</i></a>
                    <ul className="right hide-on-med-and-down">
                        <li><Link to="/login">Login</Link></li>
                        <li><Link to="/register">Register</Link></li>
                    </ul>
                </div>
            </nav>
            <ul className="sidenav" id="mobileNav">
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register">Register</Link></li>
            </ul>
        </div>
    )

    authenticatedNav = (
        <div>
            <nav id="nav" role="navigation">
                <div className="nav-wrapper container">
                    <a href="#!" className="brand-logo">μVote</a>
                    <a href="#!" data-target="mobileNav" className="sidenav-trigger"><i className="material-icons">menu</i></a>
                    <ul className="right hide-on-med-and-down">
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/new-poll">New Poll</Link></li>
                        <li><Link to="/my-polls">My Polls</Link></li>
                        <li><a id="logout" onClick={this.handleClick} href="#">Logout</a></li>
                        <li>
                            <Link to="/my-polls">
                                <i class="material-icons">account_circle</i>
                                <span>{this.props.user}</span>
                            </Link>
                        </li>
                    </ul>
                </div>
            </nav>
            <ul className="sidenav" id="mobileNav">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/new-poll">New Poll</Link></li>
                <li><Link to="/my-polls">My Polls</Link></li>
                <li><a id="logout" onClick={this.handleClick} href="#">Logout</a></li>
                <li><Link to="/my-polls">User</Link></li>
            </ul>
        </div>
    )

    render = () => {


        return (

            <div>
                
                <nav id="nav" role="navigation">
                    <div className="nav-wrapper container">
                        <Link to="/" className="brand-logo">μVote</Link>
                        <a href="#!" data-target="mobileNav" className="sidenav-trigger"><i className="material-icons">menu</i></a>

                            { this.props.user ? (
                                <ul className="right hide-on-med-and-down">
                                    <li><Link to="/">Home</Link></li>
                                    <li><Link to="/new-poll">New Poll</Link></li>
                                    <li><a id="logout" onClick={this.handleClick} href="#">Logout</a></li>
                                    <li>
                                        <Link to="/my-polls">
                                            <div id="user">
                                                <i class="material-icons">account_circle</i>
                                                <span>{this.props.user}</span>
                                            </div>
                                        </Link>
                                    </li>
                                </ul>
                            ) : (
                                <ul className="right hide-on-med-and-down">
                                    <li><Link to="/login">Login</Link></li>
                                    <li><Link to="/register">Register</Link></li>
                                </ul>
                            ) }

                    </div>
                </nav>

                <ul className="sidenav" id="mobileNav">
                    { this.props.user ? (
                        <div>
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/new-poll">New Poll</Link></li>
                            <li><a id="logout" onClick={this.handleClick} href="#">Logout</a></li>
                            <li>
                                <Link to="/my-polls">
                                    <div id="mobileUser">
                                        <i class="material-icons">account_circle</i>
                                        <span>{this.props.user}</span>
                                    </div>
                                </Link>
                            </li>
                        </div>
                    ) : (
                        <div>
                            <li><Link to="/login">Login</Link></li>
                            <li><Link to="/register">Register</Link></li>
                        </div>
                    ) }
                </ul>

            </div>

        )

    }

}

export default withRouter(Nav);
