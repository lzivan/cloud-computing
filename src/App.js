import React, { useState } from "react";
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
              <h1>Hello {user.username}</h1>
              <div className="chat-interface">
                <div className="messages-list">
                  {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender}`}>
                      {msg.text}
                    </div>
                  ))}
                  
                </div>
                <div className="input-area">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  />
                  <button onClick={sendMessage}>Send</button>
                </div>
              </div>
              <button onClick={signOut} className="Button">
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
