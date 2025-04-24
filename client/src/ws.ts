import socketIOClient from "socket.io-client";

export const WS = "https://realtime-chat-app.fly.dev"; 
// export const WS =  process.env.REACT_APP_WS_URL || "https://realtime-chat-app.fly.dev"; 
export const ws = socketIOClient(WS);
