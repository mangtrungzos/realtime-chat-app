import React, { createContext, useEffect, useState, useReducer } from "react";
import socketIOClient from "socket.io-client";
import { useNavigate } from "react-router-dom";
import Peer from "peerjs";
import { v4 as uuidV4 } from "uuid"
import { peersReducer } from "../reducers/peerReducer";
import { addPeerAction, removePeerAction } from "../reducers/peerActions";
import { IMessage } from "../types/chat";
import { chatReducer } from "../reducers/chatReducer";
import { addHistoryAction, addMessageAction, toggleChatAction } from "../reducers/chatActions";

const WS = "http://localhost:8080";

export const RoomContext = createContext<null | any>(null);

interface ChildProps {
    children: React.ReactNode;
}   
const ws = socketIOClient(WS);

export const RoomProvider: React.FC<ChildProps> = ({ children }) => {
    const navigate = useNavigate();
    const [me, setMe] = useState<Peer>();
    const [stream, setStream] = useState<MediaStream>();
    const [peers, dispatch] = useReducer(peersReducer, {});
    const [chat, chatDispatch] = useReducer(chatReducer, {
        messages: [],
        isChatOpen: false,
    });
    const [screenSharingId, setScreenSharingId] = useState<string>("");
const [roomId, setRoomId] = useState<string>();
    const enterRoom = ({ roomId }: {roomId: "string"}) => {
        console.log({ roomId });
        navigate(`/room/${roomId}`);
    };
    const getUsers = ({participants}: { participants: string[] }) => {
        console.log({participants});
    };
    const removePeer = (peerId: string) => {
        dispatch(removePeerAction(peerId));
    };

    const switchStream = (stream: MediaStream) => {
        
        setStream(stream);
        setScreenSharingId(me?.id || "");
    
        Object.values(me?.connections || {}).forEach((connection: any) => {
            const videoTrack = stream?.getVideoTracks()[0];
            connection[0].peerConnection
                .getSenders()[1]
                .replaceTrack(videoTrack) 
                .catch((err: any) => console.error(err));
        });
    };
    
    const shareScreen = async () => {
        try {
            if (screenSharingId) {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                switchStream(stream);
            } else {
                const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
                switchStream(stream);
            }
        } catch (err) {
            console.error('Error accessing media devices:', err);
        }
    };

    const sendMessage = (message: string) => {
        const messageData: IMessage = {
            content: message,
            timestamp: new Date().getTime(),
            author: me?.id,
        };
        chatDispatch(addMessageAction(messageData));


        ws.emit("send-message",roomId, messageData);
    };

    const addMessage = (message: IMessage) => {
        console.log("new message", message);
        chatDispatch(addMessageAction(message));
    };

    const addHistory = (messages: IMessage[]) => {
        chatDispatch(addHistoryAction(messages));
    };

    const toggleChat = () => {
        chatDispatch(toggleChatAction(!chat.isChatOpen));
    };

    useEffect(() => {
        // Create a new Id for the peer
        const meId = uuidV4();
        const peer = new Peer(meId, {
            host: "localhost",
            port: 9000,
            path: "/myapp"
        });
        // const peer = new Peer(meId)
        // Set State
        setMe(peer);

        try {
            navigator.mediaDevices
            .getUserMedia({video: true, audio: true})
            .then((stream) => {
                setStream(stream);
            })
        } catch (error) {
            console.error(error);
        }
        ws.on("room-created", enterRoom);
        ws.on("get-users", getUsers);
        ws.on("user-disconnected", removePeer);
        ws.on("user-started-sharing",(peerId) => setScreenSharingId(peerId));
        ws.on("user-stopped-sharing",() => setScreenSharingId(""));
        ws.on("add-message", addMessage);
        ws.on("get-messages", addHistory);

        return () => {
            ws.off("room-created", enterRoom);
            ws.off("get-users",getUsers);
            ws.off("user-disconnected", removePeer);
            ws.off("user-started-sharing");
            ws.off("user-stopped-sharing");
            ws.off("user-joined");
            ws.off("add-message");

        }

    }, []);

    useEffect(() => {
        if (screenSharingId) {
            ws.emit("stat-sharing", {peerId: screenSharingId, roomId});
        } else {
            ws.emit("stop-sharing");
        }
    }, [screenSharingId, roomId]);

    useEffect(() => {
        if (!me || !stream) return;

        ws.on("user-joined", ({peerId}) => {
            const call = me.call(peerId, stream);
            
            call.on("stream", (peerStream) => {
                dispatch(addPeerAction(peerId, peerStream));
            });
        });

        me.on("call", (call) => {
            call.answer(stream);
            call.on("stream", (peerStream) => {
                dispatch(addPeerAction(call.peer, peerStream))
            });
        });
    }, [me, stream, screenSharingId]);

    console.log({ peers });

    return (
        <RoomContext.Provider 
            value={{ 
                ws, 
                me, 
                stream, 
                peers, 
                shareScreen, 
                screenSharingId, 
                setRoomId,
                sendMessage,
                chat,
                toggleChat,
            }}>
            {children}
        </RoomContext.Provider>
    );
};



