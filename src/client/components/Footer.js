import React, { Component } from 'react';
import '../styles/footer.scss';

class Footer extends Component {
    render() {
        return (
            <div id="footer">
                <div className="container">

                    <div className="row center">

                        <p>
                            This project was created as part of the <a href="https://learn.freecodecamp.org/coding-interview-prep/take-home-projects/build-a-voting-app" target="_blank">freeCodeCamp</a> curriculum.
                        </p>

                        <p>
                            Alexander Riseley 2018
                        </p>

                        <a href="https://github.com/Egeroth24" target="_blank" title="Github"><i className="fa fa-github"></i></a>
                        <a href="https://www.linkedin.com/in/alexander-riseley-b52120129/" title="LinkedIn" target="_blank"><i className="fa fa-linkedin"></i></a>
                        <a href="https://codepen.io/Egeroth/" title="CodePen" target="_blank"><i className="fa fa-codepen"></i></a>

                    </div>

                </div>
            </div>
        )
    }
}

export default Footer;