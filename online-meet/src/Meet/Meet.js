import React from 'react';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { useEffect } from 'react';
import "./Meet.css";
import io from "socket.io-client";
import { getRequest, postRequest } from "../apiRequests";
import Peer from "simple-peer";

let peer = null;
const socket = io.connect("http://localhost:8000");

function Meet() {
    let { meet_code } = useParams();
    const [micOn, setMicOn] = useState(false);
    const [videoOn, setVideoOn] = useState(false);
    const isAdmin = true;
    const url = `${window.location.origin}${window.location.pathname}`;
    let id = meet_code;
    const [streamObj, setStreamObj] = useState();

    useEffect(() => {
        initWebRTC();
        socket.on("code", (data) => {
            if (data.url === url) {
                peer.signal(data.code);
            }
        });
    }, []);

    const getRecieverCode = async () => {
        const response = await getRequest(`http://localhost:8000/api/get-call-id/${id}`);
        if (response.code) {
            peer.signal(response.code);
        }
    };

    const initWebRTC = () => {
        navigator.mediaDevices
            .getUserMedia({
                video: true,
                audio: true,
            })
            .then((stream) => {
                setStreamObj(stream);

                peer = new Peer({
                    initiator: isAdmin,
                    trickle: false,
                    stream: stream,
                });

                if (!isAdmin) {
                    getRecieverCode();
                }

                peer.on("signal", async (data) => {
                    if (isAdmin) {
                        let payload = {
                            id,
                            signalData: data,
                        };
                        await postRequest("http://localhost:8000/api/save-call-id", payload);
                        console.log("data is posted");
                    } else {
                        socket.emit("code", { code: data, url }, (cbData) => {
                            console.log("code sent");
                        });
                    }
                });
                peer.on("connect", () => {
                    // wait for 'connect' event before using the data channel
                    console.log("hello from connect");
                });

                peer.on("data", (data) => {
                    console.log("hello from data");
                    // clearTimeout(alertTimeout);
                    // messageListReducer({
                    //     type: "addMessage",
                    //     payload: {
                    //         user: "other",
                    //         msg: data.toString(),
                    //         time: Date.now(),
                    //     },
                    // });

                    // setMessageAlert({
                    //     alert: true,
                    //     isPopup: true,
                    //     payload: {
                    //         user: "other",
                    //         msg: data.toString(),
                    //     },
                    // });

                    // alertTimeout = setTimeout(() => {
                    //     setMessageAlert({
                    //         ...messageAlert,
                    //         isPopup: false,
                    //         payload: {},
                    //     });
                    // }, 10000);
                });

                peer.on("stream", (stream) => {
                    console.log("hello from stream");
                    // got remote video stream, now let's show it in a video tag
                    let video = document.querySelector("video");

                    if ("srcObject" in video) {
                        video.srcObject = stream;
                    } else {
                        video.src = window.URL.createObjectURL(stream); // for older browsers
                    }

                    video.play();
                });

            })
            .catch((err) => { console.log(err) });
    };

    const turnOnMic = () => {
        setMicOn(true);
    }

    const turnOffMic = () => {
        setMicOn(false);
    }

    const turnOnVideo = () => {
        setVideoOn(true);
    }

    const turnOffVideo = () => {
        setVideoOn(false);
    }

    return (
        <>
            <video src="" controls></video>
            {micOn ?
                <button className='icon' onClick={turnOffMic}><span class="material-icons">
                    mic
                </span></button>
                :
                <button className='icon' onClick={turnOnMic}><span class="material-icons">
                    mic_off
                </span></button>
            }
            {videoOn ?
                <button className='icon' onClick={turnOffVideo}><span class="material-icons">
                    videocam
                </span></button>
                :
                <button className='icon' onClick={turnOnVideo}><span class="material-icons">
                    videocam_off
                </span></button>
            }
        </>
    );
}

export default Meet;