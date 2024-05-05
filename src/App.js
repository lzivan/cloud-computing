import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { Amplify } from "aws-amplify";
import awsconfig from "./aws-exports";
// import { AmplifySignOut, withAuthenticator } from '@aws-amplify/ui-react';
import { Authenticator, Button } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import axios from "axios";

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

  // useEffect to check showChatbot, console.log it
  useEffect(() => {
    console.log("showChatbot is:", showChatbot);
  }, [showChatbot]);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [reportUrl, setReportUrl] = useState("");

  const sendMessage = async () => {
    const userMessage = {
      text: inputMessage,
      sender: "user",
    };

    // extract the person name and linkedin url from the input
    const personMatch = inputMessage.match(/\[PERSON: (.*?)\]/);
    const linkedinUrlMatch = inputMessage.match(/\[LINKEDINURL: (.*?)\]/);

    const personName = personMatch ? personMatch[1] : null;
    const linkedinUrl = linkedinUrlMatch ? linkedinUrlMatch[1] : null;

    let aiMessage;

    aiMessage = {
      text: "I am thinking...",
      sender: "ai",
    };

    // show the messages on the screen for both user and ai
    setMessages((prevMessages) => [...prevMessages, userMessage, aiMessage]);

    setInputMessage("");
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
