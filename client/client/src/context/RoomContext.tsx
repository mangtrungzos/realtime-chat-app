import React, { createContext, useEffect, useState, useReducer, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Peer from "peerjs";
import { ws } from "../ws"
import { PeerState, peersReducer } from "../reducers/peerReducer";
import { addPeerStreamAction, addPeerNameAction, removePeerStreamAction, addAllPeersAction } from "../reducers/peerActions";
import { UserContext } from "./UserContext";
import { IPeer } from "../types/peer"

interface RoomValue {
    stream?: MediaStream;
    peers: PeerState;
    shareScreen: () => void;
    roomId: string;
    setRoomId: (id: string) => void;
    screenSharingId: string;
}


export const RoomContext = createContext<RoomValue>({
    peers: {},
    shareScreen: () => {},
    setRoomId: (id) => {},
    screenSharingId: "",
    roomId: "",
});

interface ChildProps {
    children: React.ReactNode;
}   

export const RoomProvider: React.FC<ChildProps> = ({ children }) => {
    const navigate = useNavigate();
    const { userName, userId } = useContext(UserContext);
    const [me, setMe] = useState<Peer>();
    const [stream, setStream] = useState<MediaStream>();
    const [peers, dispatch] = useReducer(peersReducer, {});
    const [screenSharingId, setScreenSharingId] = useState<string>("");
    const [roomId, setRoomId] = useState<string>("");
    const enterRoom = ({ roomId }: {roomId: "string"}) => {
        console.log({ roomId });
        navigate(`/room/${roomId}`);
    };
    
    const getUsers = ({
        participants
    }: { 
        participants: Record<string, IPeer>;
    }) => {
        console.log({participants});
        dispatch(addAllPeersAction(participants));
    };
    const removePeer = (peerId: string) => {
        dispatch(removePeerStreamAction(peerId));
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

    const nameChangedHandler = ({ peerId, userName }: {
        peerId: string,
        userName: string
    }) => {
        dispatch(addPeerNameAction(peerId, userName));
    };

    useEffect(() => {
        ws.emit("change-name", { peerId: userId, userName, roomId})
    }, [userName, userId,roomId]);

    useEffect(() => {
        

        const peer = new Peer(userId, {
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
        ws.on("name-changed", nameChangedHandler);

        return () => {
            ws.off("room-created");
            ws.off("get-users");
            ws.off("user-disconnected");
            ws.off("user-started-sharing");
            ws.off("user-stopped-sharing");
            ws.off("user-joined");
            ws.off("name-changed");
            me?.disconnect();

        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
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

        ws.on("user-joined", ({peerId, userName: name}) => {
            dispatch(addPeerNameAction(peerId, name));   
            const call = me.call(peerId, stream, {
                metadata: {
                    userName,
                },
            });
            
            call.on("stream", (peerStream) => {
                dispatch(addPeerStreamAction(peerId, peerStream));
            });
        });

        me.on("call", (call) => {
            const { userName } = call.metadata.userName;
            dispatch(addPeerNameAction(call.peer, userName));
            call.answer(stream);
            call.on("stream", (peerStream) => {
                dispatch(addPeerStreamAction(call.peer, peerStream))
            });
        });
    }, [me, stream, screenSharingId, userName]);

    console.log({ peers });

    return (
        <RoomContext.Provider 
            value={{ 
                stream, 
                peers, 
                shareScreen, 
                roomId: roomId || "",
                setRoomId,
                screenSharingId, 
            }}>
            {children}
        </RoomContext.Provider>
    );
};



