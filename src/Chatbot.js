import React, { useEffect } from "react";

const Chatbot = () => {
  useEffect(() => {
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
  }, []);

  return <div id="webchat" />;
};

export default Chatbot;
