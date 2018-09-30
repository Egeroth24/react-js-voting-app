import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import Moment from 'moment';
import SubmitContainer from './SubmitContainer';
import { showErrors, hideErrors, preloader } from '../modules/helpers.js';
import Chart from './Chart.js';
import '../styles/cards.scss';

class Cards extends Component {

    handleClick = (e) => {
        let id = e.target.id;
        let action = id.slice(0, id.length - 8);
        let pollId = id.slice(-8);

        switch(action) {
            case 'submitVote':
                this.submitVote(pollId);
                break;
            case 'submitAddOption':
                let option = document.getElementById('formAddOption' + pollId).value;
                this.submitAddOption(pollId, option);
                break;
            case 'submitDelete':
                this.submitDelete(pollId);
                break;
        }

    }

    submitVote = (pollId) => {
        let selectInstance = M.FormSelect.getInstance(document.getElementById('formVoteSelect' + pollId));
        // selectInstance.getSelectedValues() Open Issue: https://github.com/Dogfalo/materialize/issues/6123
        let optionIndex = selectInstance.el.selectedIndex; // Workaround for above issue.
        // .selectedIndex includes the disabled 'Select an option' element.
        // Decrement index to match the poll votes array, which does not include it.
        optionIndex--; 
        if (optionIndex === -1) { // "Select an option" placeholder selected.
            let formVoteSelect = document.getElementById('formVoteSelect' + pollId);
            let formVoteError = document.getElementById('formVoteError' + pollId);
            let selectEl = document.getElementById('formVoteSelect' + pollId).parentElement.getElementsByTagName('input')[0];
            formVoteError.classList.add('visible');
            selectEl.style.borderBottom = '1px solid #EF5350';
            formVoteSelect.addEventListener('change', function listener() {
                console.log('test');
                formVoteError.classList.remove('visible');
                selectEl.style.borderBottom = '1px solid #9e9e9e';
                formVoteSelect.removeEventListener('change', listener);
            });
            return;
        }
        let poll = this.props.polls.find(poll => poll.id === pollId);
        if (poll.voters.hasOwnProperty(this.props.user) && poll.voters[this.props.user] === optionIndex) {
            preloader('fail', 'Vote' + pollId);
            document.getElementById('errorVote' + pollId).classList.add('visible');
        } else {
            preloader('start', 'Vote' + pollId);
            let data = {pollId, optionIndex}
            fetch('/vote', {
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
            .then((poll) => {
                preloader('success', 'Vote' + pollId);
                this.props.updatePoll(poll);
            })
            .catch(err => {
                if (err.status === 409) { // Conflict.
                    preloader('fail', 'Vote' + pollId);
                    document.getElementById('errorVote' + pollId).classList.add('visible');
                } else {
                    console.log('Unexpected internal error: ' + err);
                }
            });
        }
    }

    submitAddOption = (pollId, option) => {
        
        if (option.length < 1) {
            let inputEl = document.getElementById('formAddOption' + pollId);
            let errorEl = document.getElementById('formAddOptionError' + pollId);
            showErrors(inputEl, errorEl);
            inputEl.addEventListener('input', function listener() {
                if (inputEl.value.length >= 1) {
                    hideErrors(inputEl, errorEl);
                    inputEl.removeEventListener('input', listener);
                }
            });
            return;
        }

        for (let i = 0; i < this.props.polls.length; i++) {
            if (this.props.polls[i].options.includes(option)) {
                preloader('fail', 'AddOption' + pollId);
                document.getElementById('errorAddOption' + pollId).classList.add('visible');
                return;
            }
        }

        preloader('start', 'AddOption' + pollId);
        let data = {pollId, option}
        fetch('/addOption', {
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
        .then((poll) => {
            preloader('success', 'AddOption' + pollId);
            this.props.updatePoll(poll);
        })
        .catch(err => {
            if (err.status === 409) { // Conflict.
                preloader('fail', 'AddOption' + pollId);
                document.getElementById('errorAddOption' + pollId).classList.add('visible');
            } else {
                console.log('Unexpected internal error: ' + err);
            }
        });

    }
    
    submitDelete = (pollId) => {
        let data = {pollId}
        fetch('/delete-poll', {
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
        .then((poll) => {
            this.props.deletePoll(poll);
        })
        .catch((err) => {
            console.log('Unexpected internal error: ' + err);
        });
    }

    // We double up on update and mount here because the first mount does not have cards'
    // elements rendered, but leaving and returning to home only triggers update.
    // Elements are removed before update is called, so we don't have to worry about duplicating listeners. 

    componentDidUpdate = () => {
        M.FormSelect.init(document.querySelectorAll('select'));

        document.querySelectorAll('input').forEach((input) => {
            if (input.id.length > 0) {
                let pollId = input.id.substr(-8);
                input.addEventListener('keyup', (e) => {
                    if (e.keyCode === 13) {
                        document.getElementById('submitAddOption' + pollId).click();
                    }
                });
                // document.getElementById('formVoteSelect' + pollId).removeEventListener('keydown')
            }
            
        });
    }

    componentDidMount = () => {
        M.FormSelect.init(document.querySelectorAll('select'));

        document.querySelectorAll('input').forEach((input) => {
            if (input.id.length > 0) {
                let pollId = input.id.substr(-8);
                input.addEventListener('keyup', (e) => {
                    if (e.keyCode === 13) {
                        console.log('test');
                        document.getElementById('submitAddOption' + pollId).click();
                    }
                });
            }
            
        });
    }

    render = () => {
        let polls = this.props.polls;
        return (
            <div id="cards">
                <div className="container">

                    { polls.length > 0 ? (
                        polls.map((poll) => {
                            let timeFromNow = Moment(poll.timestamp).fromNow();
                            let totalVotes = poll.votes.reduce(function(a, b) { return a + b}, 0);
                            return (
                                <div className="card hoverable" key={ poll.id }>
                                    <div className="card-content">

                                        { poll.author === this.props.user ? (
                                            <div class="cardTitleWithDeleteIconGrid">
                                                <Link to={'/polls/' + poll.id}>
                                                    <span className="card-title">{ poll.title }</span>
                                                </Link>
                                                <a id={'submitDelete' + poll.id} onClick={this.handleClick} class="btn waves-effect deletePollBtn deleteUser"><i class="fa fa-trash"></i></a>
                                            </div>
                                        ) : (
                                            <Link to={'/polls/' + poll.id}>
                                                <span className="card-title">{ poll.title }</span>
                                            </Link>
                                        ) }

                                        <div className="pollInfo">
                                            <div className="authorInfo" title={ poll.author }>
                                                <i class="material-icons">account_circle</i>
                                                <span>{ poll.author }</span>
                                            </div>
                                            <div className="timeInfo" title={ timeFromNow }>
                                                <i class="material-icons">access_time</i>
                                                <span> { timeFromNow } </span>
                                            </div>
                                            <div className="votesInfo" title={ totalVotes + ' votes' }>
                                                <i class="material-icons">bookmark</i>
                                                <span>{totalVotes} votes</span>
                                            </div>
                                        </div>

                                        <div className="cardGrid">

                                            <div className="cardVote">
                                                <div id="voteSelectWrapper" class="input-field">
                                                    <select id={'formVoteSelect' + poll.id}>
                                                        <option value="" disabled selected>Select an option</option>
                                                        { poll.options.map((option) => {
                                                            return <option value={option}>{option}</option>
                                                        }) }
                                                    </select>
                                                    <span id={'formVoteError' + poll.id} class="inputError">Please select an option.</span>
                                                </div>

                                                <SubmitContainer handleClick={this.handleClick} action={'Vote' + poll.id} id="" btnClass="submit" btnText="Vote" errorText="You have already voted for this option." />

                                            </div>

                                            <div className="cardAddOption">
                                                <p className="addOptionOr">Or</p>
                                                { this.props.user ? (
                                                    <div className="input-field">
                                                        <input id={'formAddOption' + poll.id} type="text" name="option"></input>
                                                        <label for={'formAddOption' + poll.id}>Add your own</label>
                                                        <span id={'formAddOptionError' + poll.id} className="inputError">Please add an option.</span>

                                                        <SubmitContainer handleClick={this.handleClick} action={'AddOption' + poll.id} id="" btnClass="submit" btnText="Add" errorText="Option already exists." />

                                                    </div>
                                                ) : (
                                                    <p className="loginOrRegister"><Link to="/login">Log in</Link> or <Link to="/register">register</Link> to add your own options.</p>
                                                ) }
                                            </div>

                                            
                                            <div className="cardChart">
                                                <Chart poll={poll} />
                                            </div>

                                        </div>

                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <div className="card hoverable">
                            <div className="card-content">

                                <div className="preloaderContainer">
                                    <div className="preloader-wrapper active">
                                        <div className="spinner-layer spinner-red-only">
                                            <div className="circle-clipper left">
                                                <div className="circle"></div>
                                            </div><div className="gap-patch">
                                                <div className="circle"></div>
                                            </div><div className="circle-clipper right">
                                                <div className="circle"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    ) }

                </div>
            </div>
        )

    }
}

export default withRouter(Cards);