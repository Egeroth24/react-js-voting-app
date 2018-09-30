import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import Cards from './Cards';
import '../styles/myPolls.scss';

class MyPolls extends Component {
    render = () => {

        let polls = [];
        if (this.props.polls.length > 0) {
            for (var i = 0, len = this.props.polls.length; i < len; i++) {
                if (this.props.polls[i].author === this.props.user) {
                    polls.push(this.props.polls[i]);
                }
            }
        }

        return (
            <div>
                <div id="myPollsPage" className="main">

                    { polls.length > 0 ? (
                        <Cards user={this.props.user} polls={polls} updatePoll={this.props.updatePoll} deletePoll={this.props.deletePoll} />
                    ) : (
                        <div id="cards">
                            <div className="container">

                                <div className="card hoverable">
                                    <div className="card-content">
                                    
                                        <p className="pollsYouCreate">Polls you create will appear here.</p>
                                        <div className="btnContainer">
                                            <Link to="/new-poll"><a className="btn waves-effect">New Poll</a></Link>
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

export default withRouter(MyPolls);