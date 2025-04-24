import socketIOClient from "socket.io-client";

const WS =  process.env.REACT_APP_WS_URL || "http://localhost:8080"; 
// export const WS = "http://13.210.68.104";
export const ws = socketIOClient(WS);
