import { Socket } from "socket.io"
import { v4 as uuidv4 } from "uuid";


const rooms: Record<string,string[]> = {};
const chats: Record<string,IMessage[]> = {};

interface IRoomParams {
    roomId: string;
    peerId: string;
};

interface IMessage {
    content: string;
    author?: string;
    timestamp: number;
}

export const roomHandler = (socket: Socket) => {
    const createRoom = () => {
        const roomId = uuidv4();
        rooms[roomId] = [];
        // Room is created and we'll join it
        socket.emit("room-created", { roomId });
        console.log("User created the room");
    };
    const joinRoom = ({ roomId, peerId }: IRoomParams) => {
        if (!rooms[roomId]) rooms[roomId] = [];
        socket.emit("get-messages", chats[roomId]);
        console.log("User joined the room", roomId, peerId);
        rooms[roomId].push(peerId);
        socket.join(roomId);
        socket.to(roomId).emit("user-joined", { peerId });
        socket.emit("get-users", {
            roomId,
            participants: rooms[roomId],
        });


        socket.on("disconnect", () => {
            console.log("User left the room", peerId);
            leaveRoom({ roomId, peerId });
        });
    };

    const leaveRoom = ({peerId, roomId}: IRoomParams) => {
        if (rooms[roomId]) {
            rooms[roomId] = rooms[roomId].filter(id => id !== peerId);
        } else {
            // Handle the case where rooms[roomId] doesn't exist or is undefined
            console.error("Room with ID", roomId, "doesn't exist or is undefined.");
        }
        socket.to(roomId).emit("user-disconnected", peerId);
    };

    const startSharing = ({peerId, roomId}: IRoomParams) => {
        socket.to(roomId).emit("user-started-sharing", peerId);
    };

    const stopSharing = (roomId: string) => {
        socket.to(roomId).emit("user-stopped-sharing");
    };

    const addMessage = (roomId: string, message: IMessage) => {
        console.log({ message });
        if (chats[roomId]) {
            chats[roomId].push(message);
        } else {
            chats[roomId] = [ message ];
        }
        socket.to(roomId).emit("add-message", message);
    };
    socket.on("create-room", createRoom);
    // New event listener
    socket.on("join-room", joinRoom);
    socket.on("start-sharing", startSharing);
    socket.on("stop-sharing", stopSharing);
    socket.on("send-message", addMessage);
};