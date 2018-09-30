import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import bannerImage from '../../../public/images/banner.png'
import Cards from './Cards';
import '../styles/shared.scss';
import '../styles/home.scss';

class Home extends Component {

    componentDidMount = () => {
        M.Parallax.init(document.querySelectorAll('.parallax'));
    }

    render = () => {
        return (
            <div>
                <div id="homePage" className="main parallax-container">
                    <div className="parallax"><img src={bannerImage} /></div>

                    <div id="indexBanner">
                        <div id="indexBannerCard" className="card hoverable">
                            <div className="card-content">
                                <span className="card-title">Welcome to μVote</span>
                                <p>Vote on user polls and see results.</p>
                                <p>Register an account to add your own options and create new polls.</p>
                                { this.props.user ? (
                                    <Link to="/my-polls"><a href="/my-polls" className="btn waves-effect">My Polls</a></Link>
                                ) : (
                                    <Link to="/register"><a href="/register" className="btn waves-effect">Register</a></Link>
                                ) }
                            </div>
                        </div>
                    </div>
                </div>
                
                <Cards user={this.props.user} polls={this.props.polls} updatePoll={this.props.updatePoll} deletePoll={this.props.deletePoll} />
            </div>
        )
    }
}

export default Home;