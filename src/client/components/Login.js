import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import '../styles/shared.scss';
import '../styles/mainForm.scss';
import SubmitContainer from './SubmitContainer';
import { showErrors, hideErrors, preloader } from '../modules/helpers.js';

class Login extends Component {

    componentDidMount = () => {
        document.querySelectorAll('input').forEach((input) => {
            input.addEventListener('keyup', (e) => {
                if (e.keyCode === 13) {
                    document.getElementById('submitLogin').click();
                }
            });
        });
    }

    handleClick = (e) => {
        if (e.target.id === 'submitLogin') {
            this.submitLogin();
        }
    }

    submitLogin = () => {
        let formUser = document.getElementById('formUser');
        let formPassword = document.getElementById('formPassword');

        // Username Validation
        if (formUser.value.length < 4) {
            showErrors(formUser, formUserError);
            formUser.addEventListener('input', function listener() {
                if (formUser.value.length >= 4) {
                    hideErrors(formUser, formUserError);
                    formUser.removeEventListener('input', listener);
                }
            });
        }

        //Password Validation
        if (formPassword.value.length < 8) {
            showErrors(formPassword, formPasswordError);
            formPassword.addEventListener('input', function listener() {
                if (formPassword.value.length >= 8) {
                    hideErrors(formPassword, formPasswordError);
                    formPassword.removeEventListener('input', listener);
                }
            });
        }

        if (!(formUser.classList.contains('invalid') || formPassword.classList.contains('invalid'))) {
            let data = {username: formUser.value, password: formPassword.value};
            preloader('start', 'Login');
            fetch('/login', {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(res => {
                if (res.ok) {
                    return res.json();
                } else {
                    return Promise.reject({ status: res.status });
                }
            })
            .then(() => {
                preloader('success', 'Login');
                setTimeout(() => {
                    this.props.setAuthenticated(formUser.value);
                    this.props.history.push('/');
                }, 450);
            })
            .catch(err => {
                if (err.status === 401) { // Incorrect username or password.
                    preloader('fail', 'Login');
                    document.getElementById('errorLogin').classList.add('visible');
                } else {
                    console.log('Unexpected internal error: ' + err);
                }
            });
        }
    }

    render = () => {
        return (
            <div>
                <div id="loginPage" className="main mainForm">
                    <div className="formContainer">
                            
                        <h1 className="loginHeader">Login</h1>

                        <div className="input-field">
                            <input id="formUser" type="text" name="user" />
                            <label htmlFor="formUser">Username</label>
                            <span id="formUserError" className="inputError">Username must be at least 4 characters long.</span>
                        </div>
                        <div className="input-field">
                            <input id="formPassword" type="password" />
                            <label htmlFor="formPassword">Password</label>
                            <span id="formPasswordError" className="inputError">Password must be at least 8 characters long.</span>
                        </div>
                        
                        <SubmitContainer handleClick={this.handleClick} action="Login" id="" btnClass="submit" btnText="Submit" errorText="Incorrect username or password. Please Try again." />

                    </div>
                </div>
            </div>
        )
    }

}

export default withRouter(Login);