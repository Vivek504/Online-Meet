import React from 'react';
import './Home.css';
import home from '../Images/Home.png';
import { Link } from 'react-router-dom';
import GoogleLogin from 'react-google-login';
import { GoogleLogout } from 'react-google-login';
import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Home() {
    const [showLogin, setShowLogin] = useState(true);
    const [loggedin, setLoggedin] = useState(false);
    const [loggedout, setLoggedout] = useState(false);
    let navigate = useNavigate();
    const [host_email, setHost_email] = useState("");
    const [host_fname, setHost_fname] = useState("");
    const [host_lname, setHost_lname] = useState("");

    const login = (response) => {
        if (response.error !== 'popup_closed_by_user') {
            setShowLogin(false);
            setLoggedin(true);
            setHost_email(response.profileObj.email);
            setHost_fname(response.profileObj.givenName);
            setHost_lname(response.profileObj.familyName);
        }
    }

    const logout = (response) => {
        setShowLogin(true);
        setLoggedout(true);
    }

    const signup = (e) => {
        e.preventDefault();
        window.location.href = "https://accounts.google.com/signup/v2/webcreateaccount?hl=en&flowName=GlifWebSignIn&flowEntry=SignUp";
    }

    const closeLoginModal = () => {
        setLoggedin(false);
    }

    const closeLogoutModal = () => {
        setLoggedout(false);
    }

    const startMeet = () => {
        var meet_code;
        axios.get('http://localhost:8000/meet-details')
        .then((results) => {    
            do{
                var codeExist = false;
                meet_code = Math.floor(Math.random()*(99999999 - 10000000)) + 10000000;
                for(var i=0; i<results.data.length; i++)
                {
                    if(results.data[i].meet_code===meet_code)
                    {
                        codeExist=true;
                        break;
                    }
                }
            }while(codeExist)
        });
        const meet = {
            meet_code: meet_code,
            host_email: host_email,
            host_fname: host_fname,
            host_lname: host_lname
        }
        axios.post('http://localhost:8000/create-meet',meet)
        .then(result => {
            const url = "/meet/" + meet_code; 
            navigate(url);
        })
        .catch(err => {
            console.log(err);
        })        
    }

    return (
        <>
            <nav class="navbar navbar-expand-lg navbar-light bg-light">
                <div class="container-fluid">
                    <Link to="/" className="navbar-brand">Online Meet</Link>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                            <li class="nav-item">
                                {showLogin ? <GoogleLogin
                                    clientId='186601439826-4ehd9k5b21qkpfli7os6mcfjpdmush0o.apps.googleusercontent.com'
                                    buttonText='Login'
                                    onSuccess={login}
                                    onFailure={login}
                                    cookiePolicy={'single_host_origin'}
                                /> :
                                    <GoogleLogout
                                        clientId="186601439826-4ehd9k5b21qkpfli7os6mcfjpdmush0o.apps.googleusercontent.com"
                                        buttonText="Logout"
                                        onLogoutSuccess={logout}
                                    />}
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
            <Modal show={loggedin}>
                <Modal.Header><h5 className='modal-title'>Online Meet</h5></Modal.Header>
                <Modal.Body className='modal-body'>You are logged in successfully</Modal.Body>
                <Modal.Footer className='modal-footer'><button onClick={closeLoginModal} className='btn btn-secondary'>Close</button></Modal.Footer>
            </Modal>
            <Modal show={loggedout}>
                <Modal.Header><h5 className='modal-title'>Online Meet</h5></Modal.Header>
                <Modal.Body className='modal-body'>You are logged out successfully</Modal.Body>
                <Modal.Footer className='modal-footer'><button onClick={closeLogoutModal} className='btn btn-secondary'>Close</button></Modal.Footer>
            </Modal>
            <div className='title'>
                <h1>Secure video conferencing </h1>
                <h1>for everyone</h1>
                <p>Connect, collaborate and celebrate from anywhere with Online Meet</p>
                <br></br>
                {!showLogin ?
                    <div>
                        <button className='btn btn-primary' onClick={startMeet}>Start a meeting</button> &nbsp; or
                        <br></br>
                        <br></br>
                        <input className='form-control' style={{ width: "200px" }} placeholder='Enter a Code' />
                        <button className='btn btn-secondary'>Join</button>
                        <br></br><br></br>
                    </div>
                    :
                    <div>
                        Don't have an account? <Link onClick={signup} to="https://accounts.google.com/signup/v2/webcreateaccount?hl=en&flowName=GlifWebSignIn&flowEntry=SignUp" style={{ color: "blue", textDecoration: "none" }}>Create an account</Link>
                    </div>
                }
            </div>
            <div className='image'>
                <img src={home} alt='Meet'></img>
            </div>
        </>
    );

}

export default Home;