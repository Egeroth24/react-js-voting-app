import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import '../styles/shared.scss';
import '../styles/mainForm.scss';
import '../styles/newPoll.scss';
import SubmitContainer from './SubmitContainer';
import { showErrors, hideErrors, preloader } from '../modules/helpers.js';

class NewPoll extends Component {

    componentDidMount = () => {

        // Usually we submit forms with the enter key, but since chips are also added with enter,
        // we can add a flag to prevent form submission when adding a chip and still allow it when not adding a chip.
        // That is, when the chip input element is empty.
        // Bug: Form submits if the chip is a duplicate, as Materialize clears the input but doesn't add the chip.
        // Bug: Form submits if the enter key is pressed quickly enough after adding a chip.
        this.chipRecentlyAdded = false;
        
        let options = {
            onChipAdd: () => {
                let formOptionsInput = document.getElementById('chipsContainer').getElementsByTagName('input')[0];
                let formOptionsError = document.getElementById('formOptionsError');
                let chipsInstance = M.Chips.getInstance(chipsContainer);
                let chipsData = chipsInstance.chipsData;
                if (formOptionsInput.classList.contains('invalid') && chipsData.length >= 2) {
                    hideErrors(formOptionsInput, formOptionsError);
                    chipsContainer.style.borderBottom = "1px solid #9e9e9e"; // The Materialize chips div doesn't have the invalid bottom border styling like other inputs.
                    chipsContainer.style.boxShadow = "none"; // So we have to add our own.
                }
                this.chipRecentlyAdded = true;
            },
            placeholder: 'Press enter to add options'
        }
        M.Chips.init(document.getElementById('chipsContainer'), options);

        let formTitleInput = document.getElementById('formTitle');
        formTitleInput.addEventListener('keyup', (e) => {
            if (e.keyCode === 13) {
                document.getElementById('submitNewPoll').click();
            }
        });

        let formOptionsInput = document.getElementById('chipsContainer').getElementsByTagName('input')[0];
        formOptionsInput.addEventListener('keyup', (e) => {
            if (this.chipRecentlyAdded === true) {
                this.chipRecentlyAdded = false;
            } else if (e.keyCode === 13 && e.target.value === '') {
                document.getElementById('submitNewPoll').click();
            }
        });

    }

    handleClick = (e) => {
        if (e.target.id === 'submitNewPoll') {
            this.submitNewPoll();
        }
    }

    submitNewPoll = () => {

        if (document.getElementById('preloaderNewPoll').classList.contains('active') || document.getElementById('checkmarkNewPoll').classList.contains('draw')) {
            // Submission in progress, usually caused by double click.
            return;
        }
        
        // Title Validation
        let formTitle = document.getElementById('formTitle');
        let formTitleError = document.getElementById('formTitleError');
        if (formTitle.value.length < 4) {
            showErrors(formTitle, formTitleError);
            formTitle.addEventListener('input', function listener() {
                if (formTitle.value.length >= 4) {
                    hideErrors(formTitle, formTitleError);
                    formTitle.removeEventListener('input', listener);
                }
            });
        }

        // Options Validation
        let chipsContainer = document.getElementById('chipsContainer');
        let chipsInstance = M.Chips.getInstance(chipsContainer);
        let chipsData = chipsInstance.chipsData;
        let formOptions = chipsData.map(a => a.tag);
        let formOptionsInput = document.getElementById('chipsContainer').getElementsByTagName('input')[0];
        let formOptionsError = document.getElementById('formOptionsError');
        if (formOptions.length < 2) {
            showErrors(formOptionsInput, formOptionsError);
            chipsContainer.style.borderBottom = "1px solid #F44336"; // The Materialize chips div doesn't have the invalid bottom border styling like other inputs.
            chipsContainer.style.boxShadow = "0 1px 0 0 #F44336"; // So we have to add our own.
        }

        if (!(formTitle.classList.contains('invalid') || formOptionsInput.classList.contains('invalid'))) {
            let data = {
                title: formTitle.value,
                options: formOptions
            }
            preloader('start', 'NewPoll');
            fetch('/new-poll', {
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
            .then((res) => {
                preloader('success', 'NewPoll');
                this.props.addPoll(res);
                setTimeout(() => {
                    this.props.history.push('/polls/' + res.id);
                }, 450);
            })
            .catch(err => {
                if (err.status === 401) { // Unauthorised.
                    this.props.history.push('/login');
                } else if (err.status === 409) { // Conflict.
                    preloader('fail', 'NewPoll');
                    document.getElementById('errorNewPoll').classList.add('visible');
                } else if (err.status === 403) { // Duplicate submission.
                    // Do nothing.
                } else {
                    console.log('Unexpected internal error: ' + err);
                }
            });
        }
    }

    render = () => {
        return (
            <div>
                <div id="newPollPage" className="main mainForm">
                    <div className="formContainer">
                            
                        <h1 className="newPollHeader">New Poll</h1>

                        <div className="input-field">
                            <input id="formTitle" type="text" name="user" />
                            <label htmlFor="formTitle">Title</label>
                            <span id="formTitleError" className="inputError">Title must be at least 4 characters long.</span>
                        </div>

                        <h5 id="optionsLabel">Options</h5>

                        <div>
                            <div id="chipsContainer" class="chips chips-placeholder"></div>
                            <span id="formOptionsError" class="inputError">Please add at least 2 options.</span>
                        </div>

                        <SubmitContainer handleClick={this.handleClick} action="NewPoll" id="" btnClass="submit" btnText="Submit" errorText="Poll title unavailable. Please try again." />

                    </div>
                </div>
            </div>
        )
    }
}

export default withRouter(NewPoll);