import React, { Component } from "react";
import "./Chatbox.css";

class ChatBox extends Component {
  constructor(props) {
    super(props);
    this.state = { inputMsg: "" };
  }
  generateChats = () => {
    return this.props.chatLog.map((item) => (
      <div className="chat" key={`chat-${item.name}-${item.timestamp}`}>
        {" "}
        <b className="name" style={{ color: item.alert ? "#888" : "#333" }}>
          {item.name}
        </b>{" "}
        <span className="msg">{item.message}</span>{" "}
      </div>
    ));
  };
  handleSend = (chatMsg) => {
    this.props.onSend(chatMsg);
  };
  handleKeyUp = (evt) => {
    if (evt.keyCode === 13) {
      this.handleSend(this.state.inputMsg);
      this.setState({ inputMsg: "" });
    }
  };

  handleInputChange = (evt) => this.setState({ inputMsg: evt.target.value });
  render() {
    const { chatLog } = this.props;
    return (
      <div className="container">
        {" "}
        <div className="chatHeader">
          {" "}
          <h1 className="title">P2P Chat Example</h1> <hr />{" "}
        </div>{" "}
        <div className="chatBox" ref={(div) => (this.chatBox = div)}>
          {" "}
          {chatLog.length ? (
            this.generateChats()
          ) : (
            <div className="info">
              {" "}
              <p>
                To test this component out, open this page in a new tab or send
                it to a friend.
              </p>{" "}
            </div>
          )}{" "}
        </div>{" "}
        <hr />{" "}
        <div className="bottomBar">
          {" "}
          <input
            className="chatInput"
            type="text"
            placeholder="Type a message..."
            onKeyUp={this.handleKeyUp}
            onChange={this.handleInputChange}
            value={this.state.inputMsg}
          />{" "}
        </div>{" "}
      </div>
    );
  }
}
export default ChatBox;
