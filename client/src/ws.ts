import socketIOClient from "socket.io-client";

export const WS = "http://localhost:8080";
// export const WS = "http://13.210.68.104";
export const ws = socketIOClient(WS);
