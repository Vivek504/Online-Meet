import React from 'react';
import './Home.css';
import home from '../Images/Home.png';
import { Link } from 'react-router-dom';
import GoogleLogin from 'react-google-login';
import { GoogleLogout } from 'react-google-login';
import { Modal } from 'react-bootstrap';
import axios from 'axios';
import { Navigate } from "react-router-dom";

class Home extends React.Component {
    constructor() {
        super();
        this.state = {
            loggedin: false,
            loggedout: false,
            host_email: "",
            host_fname: "",
            host_lname: "",
            user_meet_code: "",
            meet_exist: true,
            isLoggedin: sessionStorage.getItem("isLoggedin"),
            redirect: null
        };
    }

    login = (response) => {
        if (response.error !== 'popup_closed_by_user') {
            sessionStorage.setItem("isLoggedin", true);
            sessionStorage.setItem("email",response.profileObj.email);
            this.setState({ loggedin: true, host_email: response.profileObj.email, host_fname: response.profileObj.givenName, host_lname: response.profileObj.familyName, isLoggedin: true});
        }
    }

    logout = (response) => {
        sessionStorage.setItem("isLoggedin", false);
        this.setState({ loggedout: true, isLoggedin: false});
    }

    signup = (e) => {
        e.preventDefault();
        window.location.href = "https://accounts.google.com/signup/v2/webcreateaccount?hl=en&flowName=GlifWebSignIn&flowEntry=SignUp";
    }

    closeLoginModal = () => {
        this.setState({ loggedin: false });
    }

    closeLogoutModal = () => {
        this.setState({ loggedout: false });
    }

    startMeet = async (event) => {
        event.preventDefault();
        var meet_code;
        await axios.get('http://localhost:8000/meet-details')
            .then((results) => {
                do {
                    var codeExist = false;
                    meet_code = Math.random().toString(36).slice(2);
                    for (var i = 0; i < results.data.length; i++) {
                        if (results.data[i].meet_code === meet_code) {
                            codeExist = true;
                            break;
                        }
                    }
                } while (codeExist)
            });
        const meet = {
            meet_code: meet_code,
            host_email: this.state.host_email,
            host_fname: this.state.host_fname,
            host_lname: this.state.host_lname
        }
        await axios.post('http://localhost:8000/create-meet', meet)
            .then(result => {
                const url = "/meet/" + meet_code;
                this.setState({ redirect: url });
            })
            .catch(err => {
                console.log(err);
            })
    }

    joinMeet = (event) => {
        event.preventDefault();
        axios.get('http://localhost:8000/meet-details')
            .then(results => {
                let isExist = false;
                for (let i = 0; i < results.data.length; i++) {
                    if (results.data[i].meet_code === this.state.user_meet_code) {
                        isExist = true;
                        break;
                    }
                }
                if (isExist === true) {
                    this.setState({ meet_exist: true });
                    const url = "/meet/" + this.state.user_meet_code;
                    this.setState({ redirect: url });
                }
                else {
                    this.setState({ meet_exist: false });
                }
            })
            .catch(err => {
                console.log(err);
            })
    }
    render() {
        if (this.state.redirect) {
            return <Navigate to={this.state.redirect} />
        }
        return (
            <>
                <nav className="navbar navbar-expand-lg navbar-light bg-light">
                    <div className="container-fluid">
                        <Link to="/" className="navbar-brand">Online Meet</Link>
                        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                            <span className="navbar-toggler-icon"></span>
                        </button>
                        <div className="collapse navbar-collapse" id="navbarSupportedContent">
                            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                                <li className="nav-item">
                                {!this.state.isLoggedin ? <GoogleLogin
                                        clientId='186601439826-4ehd9k5b21qkpfli7os6mcfjpdmush0o.apps.googleusercontent.com'
                                        buttonText='Login'
                                        onSuccess={this.login}
                                        onFailure={this.login}
                                        cookiePolicy={'single_host_origin'}
                                    /> :
                                        <GoogleLogout
                                            clientId="186601439826-4ehd9k5b21qkpfli7os6mcfjpdmush0o.apps.googleusercontent.com"
                                            buttonText="Logout"
                                            onLogoutSuccess={this.logout}
                                        />}
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
                <Modal show={this.state.loggedin}>
                    <Modal.Header><h5 className='modal-title'>Online Meet</h5></Modal.Header>
                    <Modal.Body className='modal-body'>You are logged in successfully</Modal.Body>
                    <Modal.Footer className='modal-footer'><button onClick={this.closeLoginModal} className='btn btn-secondary'>Close</button></Modal.Footer>
                </Modal>
                <Modal show={this.state.loggedout}>
                    <Modal.Header><h5 className='modal-title'>Online Meet</h5></Modal.Header>
                    <Modal.Body className='modal-body'>You are logged out successfully</Modal.Body>
                    <Modal.Footer className='modal-footer'><button onClick={this.closeLogoutModal} className='btn btn-secondary'>Close</button></Modal.Footer>
                </Modal>
                <div className='title'>
                    <h1>Secure video conferencing </h1>
                    <h1>for everyone</h1>
                    <p>Connect, collaborate and celebrate from anywhere with Online Meet</p>
                    <br></br>
                    {this.state.isLoggedin ?
                        <div>
                            <button className='btn btn-primary' onClick={this.startMeet}>Start a meeting</button> &nbsp; or
                            <br></br>
                            <br></br>
                            <form onSubmit={this.joinMeet}>
                                <input type="text" value={this.state.user_meet_code} onChange={(e) => this.setState({ user_meet_code: e.target.value })} className='form-control' style={{ width: "200px" }} placeholder='Enter a Code' />
                                <button className='btn btn-secondary' type="submit">Join</button>
                            </form>
                            {!this.state.meet_exist ?
                                <label className="text-danger">Please enter a valid meet code.</label>
                                : null
                            }
                            <br></br><br></br>
                        </div>
                        :
                        <div>
                            Don't have an account? <Link onClick={this.signup} to="https://accounts.google.com/signup/v2/webcreateaccount?hl=en&flowName=GlifWebSignIn&flowEntry=SignUp" style={{ color: "blue", textDecoration: "none" }}>Create an account</Link>
                        </div>
                    }
                </div>
                <div className='image'>
                    <img src={home} alt='Meet'></img>
                </div>
            </>
        );
    }

}

export default Home;