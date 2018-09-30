import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import '../styles/poll.scss';
import Cards from './Cards';

class Poll extends Component {
    constructor(){
        super();
    }

    pollId = window.location.href.substr(window.location.href.lastIndexOf('/') + 1);

    render = () => {

        this.poll = [];
        if (this.props.polls.length > 0) {
            this.poll = this.props.polls.find(poll => poll.id === this.pollId);
            if (typeof this.poll === 'undefined') { // Poll does not exist.
                this.poll = []; // Render will fail before redirecting if this.poll === undefined.
                this.props.history.push('/');
            } else {
                this.poll = [this.poll]; // Cards expects an array, even of a single poll object.
            }
        }

        return (
            <div>
                <div id="pollPage" className="main">

                    <Cards polls={this.poll} user={this.props.user} updatePoll={this.props.updatePoll} deletePoll={this.props.deletePoll} />
                    
                </div>
            </div>
        )
        
    }
}

export default withRouter(Poll);