import React, { useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { Amplify } from "aws-amplify";
import awsconfig from "./aws-exports";
// import { AmplifySignOut, withAuthenticator } from '@aws-amplify/ui-react';
import { Authenticator, Button } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import Chatbot from './Chatbot'

Amplify.configure(awsconfig);

function App() {

  return (
    <div className="App">
      <header className="App-header">
        <Authenticator>
          {({ signOut, user }) => (
            <main>
              <h1>Hello {user.username} <Chatbot /></h1>
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