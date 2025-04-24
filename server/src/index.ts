import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { roomHandler } from "./room";

const app = express();
app.use(cors());
const port = process.env.PORT || 8080;

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        // origin: "*",
        origin: [
            "https://realtime-chat-app.fly.dev", 
            "http://localhost:3000",
            "https://webrtc-videochat-bice.vercel.app"
        ],
        methods: ["GET", "POST"],
    }
});

io.on("connection", (socket) => {
    console.log("user is connected");

    roomHandler(socket);

    socket.on("disconnect", () => {
        console.log("user is disconnected");
    });
});

app.get('/health', (_, res) => {
    res.status(200).send('OK');
});

server.listen(port, () => {
    console.log(`Listening to the server on ${port}`);
});