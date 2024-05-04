import React from 'react';
import logo from './logo.svg';
import './App.css';
import {Amplify} from 'aws-amplify';
import awsconfig from './aws-exports';
// import { AmplifySignOut, withAuthenticator } from '@aws-amplify/ui-react';
import { Authenticator, Button } from '@aws-amplify/ui-react';

Amplify.configure(awsconfig);

function App() {
  return (
    <div className="App">
      <header className="App-header">
      <Authenticator>
          {({ signOut, user }) => (
            <>
              <h2>Welcome, {user.username}</h2>
              <Button onClick={signOut}>Sign out</Button>
            </>
          )}
        </Authenticator>
      </header>
    </div>
  );
}

export default (App);
