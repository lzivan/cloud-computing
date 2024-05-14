import React, { useEffect, useState, useRef, Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import { Amplify } from "aws-amplify";
import awsconfig from "./aws-exports";
// import { AmplifySignOut, withAuthenticator } from '@aws-amplify/ui-react';
import { Authenticator, Button } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import axios from "axios";
import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";
import ChatBox from "./Chatbox";

Amplify.configure(awsconfig);

function App() {
  const Chatbot = ({ showChatbot }) => {
    useEffect(() => {
      if (!showChatbot) {
        return;
      }

      const script = document.createElement("script");
      script.src = "https://cdn.botpress.cloud/webchat/v1/inject.js";
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        window.botpressWebChat.init({
          botId: "cda40821-3a4d-4e01-a8ae-7d5ae88ca7a2",
          hostUrl: "https://cdn.botpress.cloud/webchat/v1",
          messagingUrl: "https://messaging.botpress.cloud",
          clientId: "cda40821-3a4d-4e01-a8ae-7d5ae88ca7a2",
        });
      };

      // 清理函数
      return () => {
        if (window.botpressWebChat) {
          // Hide the chat
          window.botpressWebChat.sendEvent({ type: "hide" });
        }
        document.body.removeChild(script);
      };
    }, [showChatbot]); // 依赖 showChatbot 状态变化

    if (!showChatbot) {
      return null;
    }

    return <div id="webchat" />;
  };

  const [showChatbot, setShowChatbot] = useState(false);
  const [state, setState] = useState({ chatLog: [] });

  // useEffect to check showChatbot, console.log it
  useEffect(() => {
    console.log("showChatbot is:", showChatbot);
  }, [showChatbot]);

  const [file, setFile] = useState(null);

  async function uploadToBlobStorage() {
    let accountName = "zjservice";
    let sas =
      "sv=2022-11-02&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2024-05-15T00:15:06Z&st=2024-05-14T16:15:06Z&spr=https&sig=1MIYOz2a4zJpoG%2BZIOd2AzfCVU81Zv%2B16ukVZemcQhs%3D";
    const blobServiceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net?${sas}`
    );
    const containerClient = blobServiceClient.getContainerClient("files");
    await containerClient.createIfNotExists({
      access: "container",
    });

    const blobClient = containerClient.getBlockBlobClient(file.name);
    const options = { blobHTTPHeaders: { blobContentType: file.type } };

    await blobClient.uploadBrowserData(file, options);
  }

  function handleFileChange(event) {
    setFile(event.target.files[0]);
  }

  const addChat = (name, message, alert = false) => {
    setState({
      chatLog: state.chatLog.concat({
        name,
        message: `${message}`,
        timestamp: `${Date.now()}`,
        alert,
      }),
    });
  };

  const [localSdp, setLocalSdp] = useState("");
  const [remoteSdp, setRemoteSdp] = useState("");
  const [message, setMessage] = useState("");
  const [receivedMessages, setReceivedMessages] = useState([]);
  const peerConnection = useRef(null);
  const dataChannel = useRef(null);

  useEffect(() => {
    peerConnection.current = new RTCPeerConnection();

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("New ICE candidate: ", event.candidate);
      }
    };

    peerConnection.current.ondatachannel = (event) => {
      dataChannel.current = event.channel;
      dataChannel.current.onopen = () => {
        console.log("Data channel opened at answer side");
      };
      dataChannel.current.onmessage = (event) => {
        setReceivedMessages((oldMsgs) => [...oldMsgs, event.data]);
      };
    };

    peerConnection.current.onconnectionstatechange = () => {
      console.log(
        "Connection State Change: ",
        peerConnection.current.connectionState
      );
    };

    return () => {
      peerConnection.current.close();
    };
  }, []);

  const createOffer = async () => {
    // 在offer方创建数据通道并设置必要的事件监听
    dataChannel.current = peerConnection.current.createDataChannel("chat");
    dataChannel.current.onopen = () => {
      console.log("Data channel is open");
    };
    dataChannel.current.onmessage = (event) => {
      setReceivedMessages((oldMsgs) => [...oldMsgs, event.data]);
    };

    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);
    setLocalSdp(offer.sdp);
  };

  const createAnswer = async () => {
    await peerConnection.current.setRemoteDescription({
      type: "offer",
      sdp: remoteSdp,
    });
    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);
    setLocalSdp(answer.sdp);
  };

  const handleSetRemoteDescription = async () => {
    const desc = {
      type: localSdp.includes("offer") ? "answer" : "offer",
      sdp: remoteSdp,
    };
    await peerConnection.current.setRemoteDescription(desc);
  };

  const handleSendMessage = () => {
    if (dataChannel.current.readyState === "open") {
      dataChannel.current.send(message);
      setMessage("");
    } else {
      console.log(
        "Data channel not open. Current state: ",
        dataChannel.current.readyState
      );
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <Authenticator>
          {({ signOut, user }) => (
            <main>
              <h1>Hello {user.username} </h1>
              {/* if user is not null, setshowChatbot to true */}
              <button onClick={() => setShowChatbot(!showChatbot)}>
                {showChatbot ? "Hide Chatbot" : "Show Chatbot"}
              </button>

              {showChatbot && <Chatbot showChatbot={showChatbot} />}

              <input onChange={handleFileChange} type="file" />
              <button onClick={uploadToBlobStorage}>Upload</button>
              {/* <ChatBox
                chatLog={state.chatLog}
                onSend={(msg) => msg && addChat("Me", msg)}
              /> */}

              <div>
                <button onClick={createOffer}>Create Offer</button>
                <button onClick={createAnswer}>Create Answer</button>
                <textarea value={localSdp} readOnly />
                <textarea
                  value={remoteSdp}
                  onChange={(e) => setRemoteSdp(e.target.value)}
                />
                <button onClick={handleSetRemoteDescription}>
                  Set Remote Description
                </button>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <button onClick={handleSendMessage}>Send Message</button>
                <div>
                  <h2>Received Messages:</h2>
                  {receivedMessages.map((msg, index) => (
                    <p key={index}>{msg}</p>
                  ))}
                </div>
              </div>

              {/* onClick signout and then setShowChatbot to false */}
              <button
                onClick={() => {
                  setShowChatbot(false);
                  signOut();
                }}
                className="Button"
              >
                Sign out
              </button>
            </main>
          )}
        </Authenticator>
      </header>
    </div>
  );
}

export default App;
