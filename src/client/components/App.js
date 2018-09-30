import React, { Component } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Nav from './Nav';
import Home from './Home';
import Register from './Register';
import Login from './Login';
import NewPoll from './NewPoll';
import Poll from './Poll';
import MyPolls from './MyPolls';
import Footer from './Footer';

class App extends Component {
    constructor(){
        super();
        this.state = {
            user: null,
            polls: [],
        };
    }

    setAuthenticated = (user) => {
        this.setState({
            user: user
        });
    }

    getInitialAuthentication = () => {
        // https://stackoverflow.com/questions/33131542/ - how to prevent unauthenticated nav flash if necessary.
        fetch('/isAuthenticated', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify()
        })
        .then(res => {
            if (res.ok) {
                return res.json();
            } else {
                return Promise.reject({ status: res.status });
            }
        })
        .then((user) => {
            this.setState({
                user: user
            });
        })
        .catch(err => {
            console.log('Unexpected internal error: ' + err);
        });
    }

    getPolls = () => {
        fetch('/polls', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(res => {
            if (res.ok) {
                return res.json();
            } else {
                return Promise.reject({ status: res.status });
            }
        })
        .then((res) => {
            res.reverse();
            this.setState({
                polls: res
            });
        })
        .catch((err) => {
            console.log('Unexpected internal error: ' + err);
        });
    }

    updatePoll = (newPoll) => {
        let polls = JSON.parse(JSON.stringify(this.state.polls));
        for (let i = 0; i < polls.length; i++) {
            if (polls[i].id === newPoll.id) {
                polls[i] = newPoll;
                break;
            }
        }
        this.setState({
            polls: polls
        });
    }

    addPoll = (newPoll) => {
        let polls = JSON.parse(JSON.stringify(this.state.polls));
        polls.unshift(newPoll);
        this.setState({
            polls: polls
        });
    }

    deletePoll = (pollToDelete) => {
        let polls = JSON.parse(JSON.stringify(this.state.polls));
        for (let i = 0; i < polls.length; i++) {
            if (polls[i].id === pollToDelete.id) {
                polls.splice(i, 1);
                break;
            }
        }
        this.setState({
            polls: polls
        });
    }

    componentDidMount = () => {
        this.getInitialAuthentication();
        this.getPolls();
    }

    render = () => {
        return (
            <div>
                <BrowserRouter>
                    <div>
                    <Nav user={this.state.user} setAuthenticated={this.setAuthenticated} />
                        <Switch>
                            <Route exact path="/" render={() => <Home user={this.state.user} polls={this.state.polls} updatePoll={this.updatePoll} deletePoll={this.deletePoll} />} />
                            <Route path="/register" render={() => <Register user={this.state.user} setAuthenticated={this.setAuthenticated} />} />
                            <Route path="/login" render={() => <Login user={this.state.user} setAuthenticated={this.setAuthenticated} />} />
                            <Route path="/new-poll" render={() => <NewPoll user={this.state.user} addPoll={this.addPoll} />} />
                            <Route path="/polls/:id" render={() => <Poll user={this.state.user} polls={this.state.polls} updatePoll={this.updatePoll} deletePoll={this.deletePoll} />} />
                            <Route path="/my-polls" render={() => <MyPolls user={this.state.user} polls={this.state.polls} updatePoll={this.updatePoll} deletePoll={this.deletePoll} />} />
                        </Switch>
                    <Footer />
                    </div>
                </BrowserRouter>
            </div>
        )
    }
}

export default App;