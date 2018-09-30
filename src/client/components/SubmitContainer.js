import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import '../styles/submitContainer.scss';

class SubmitContainer extends Component {

    render = () => {

        return (
            <div className="submitContainer">
                <a onClick={this.props.handleClick} id={'submit' + this.props.action} className={'btn waves-effect ' + this.props.btnClass}>{this.props.btnText}</a>
                <div id={'preloader' + this.props.action} className="preloader-wrapper small">
                    <div className="spinner-layer spinner-red-only">
                        <div className="circle-clipper left">
                            <div className="circle"></div>
                        </div>
                        <div className="gap-patch">
                            <div className="circle"></div>
                        </div>
                        <div className="circle-clipper right">
                            <div className="circle"></div>
                        </div>
                    </div>
                    <svg id={'xMarkContainer' + this.props.action} className="xMarkContainer"> {/* Originally from https://stackoverflow.com/questions/36011117/how-to-draw-x-sign-with-svgcss/#36011513 */}
                        <path id={'xMark1' + this.props.action} className="xMark1" fill="none" d="M16 16 36 36" />
                        <path id={'xMark2' + this.props.action} className="xMark2" fill="none" d="M36 16 16 36" />
                    </svg>
                    <div id={'checkmark' + this.props.action} className="checkmark"></div> {/* Originally from https://codepen.io/scottloway/pen/zqoLyQ */}
                </div>
                <span id={'error' + this.props.action} className="error inputError">{this.props.errorText}</span>
            </div>
        )
    }
}

export default withRouter(SubmitContainer);