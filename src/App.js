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
      "sv=2022-11-02&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2024-05-15T08:16:18Z&st=2024-05-15T00:16:18Z&spr=https&sig=swXvrHwOgOBEoc3IwREo6HrFmAsJwiTZGZfhbzxrzhk%3D";
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
    const newChat = {
      name,
      message: `${message}`,
      timestamp: `${Date.now()}`,
      alert,
    };
    const updatedChatLog = state.chatLog.concat(newChat);
    console.log(updatedChatLog);
    uploadChatLog(updatedChatLog);
    setState({ chatLog: updatedChatLog });
  };

  const [fileName, setFileName] = useState([]);

  async function uploadChatLog(chatLog) {
    const accountName = "zjservice";
    const sas =
      "sv=2022-11-02&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2024-05-15T08:16:18Z&st=2024-05-15T00:16:18Z&spr=https&sig=swXvrHwOgOBEoc3IwREo6HrFmAsJwiTZGZfhbzxrzhk%3D";
    const blobServiceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net?${sas}`
    );
    const containerClient = blobServiceClient.getContainerClient("chatlogs");
    await containerClient.createIfNotExists({
      access: "container",
    });

    const blobName = `chatlog-${new Date().toISOString()}.json`; // 创建一个基于时间的唯一文件名
    setFileName((fileName) => [...fileName, blobName]);
    // console.log(fileName.length);
    const blobClient = containerClient.getBlockBlobClient(blobName);
    const options = {
      blobHTTPHeaders: { blobContentType: "application/json" },
    };

    const chatLogData = JSON.stringify(chatLog);
    console.log("ChatLogData: ", chatLogData);
    await blobClient.uploadData(chatLogData, options);
  }

  async function downloadChatLog() {
    console.log("FileName Array", fileName);

    if (fileName.length === 0) {
      return;
    }
    const accountName = "zjservice";
    const sas =
      "sv=2022-11-02&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2024-05-15T08:16:18Z&st=2024-05-15T00:16:18Z&spr=https&sig=swXvrHwOgOBEoc3IwREo6HrFmAsJwiTZGZfhbzxrzhk%3D";

    const blobServiceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net?${sas}`
    );
    const containerClient = blobServiceClient.getContainerClient("chatlogs");

    // 假设你知道文件名或者通过某种方式获取最新的文件名

    const blobName = fileName[fileName.length - 1];
    // const blobName = "chatlog-2024-05-15T00:44:53.543Z.json"
    const blobClient = containerClient.getBlobClient(blobName);

    const downloadBlockBlobResponse = await blobClient.download(0);
    const downloaded = await blobToString(
      await downloadBlockBlobResponse.blobBody
    );
    console.log("Downloaded Data: ", JSON.parse(downloaded));
    return JSON.parse(downloaded);
  }

  async function blobToString(blob) {
    const fileReader = new FileReader();
    if (!fileReader) {
      return;
    }

    return new Promise((resolve, reject) => {
      fileReader.onerror = () => {
        fileReader.abort();
        reject(new DOMException("Problem parsing input file."));
      };
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.readAsText(blob);
    });
  }

  async function processChatLogs() {
    try {
      const chatLogs = await downloadChatLog(); // 假设这返回一个聊天记录的数组
      chatLogs.forEach((chat) => {
        addChat(chat.name, chat.message, chat.timestamp, chat.alert);
      });
    } catch (error) {
      console.error("Error processing chat logs:", error);
    }
  }

  useEffect(() => {
    processChatLogs();
  }, []);

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
              <div>
                <ChatBox
                  chatLog={state.chatLog}
                  onSend={(msg) => msg && addChat("Me", msg)}
                />
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
