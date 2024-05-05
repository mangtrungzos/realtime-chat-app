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
    screenStream?: MediaStream;
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

if (!!window.Cypress) {
    window.Peer = Peer;
}


export const RoomProvider: React.FC<ChildProps> = ({ children }) => {
    const navigate = useNavigate();
    const { userName, userId } = useContext(UserContext);
    const [me, setMe] = useState<Peer>();
    const [stream, setStream] = useState<MediaStream>();
    const [screenStream, setScreenStream] = useState<MediaStream>();
    const [peers, dispatch] = useReducer(peersReducer, {});
    const [screenSharingId, setScreenSharingId] = useState<string>("");
    const [roomId, setRoomId] = useState<string>("");
    const enterRoom = ({ roomId }: {roomId: "string"}) => {
        // console.log({ roomId });
        navigate(`/room/${roomId}`);
    };
    
    const getUsers = ({
        participants
    }: { 
        participants: Record<string, IPeer>;
    }) => {
        // console.log({participants});
        dispatch(addAllPeersAction(participants));
    };
    const removePeer = (peerId: string) => {
        dispatch(removePeerStreamAction(peerId));
    };

    const switchStream = (stream: MediaStream) => {        
        setScreenSharingId(me?.id || "");

        Object.values(me?.connections || {}).forEach((connection: any) => {
            const videoTrack: any = stream
                ?.getTracks()
                .find((track) => track.kind === "video");
            connection[0].peerConnection
                .getSenders()
                .find((sender: any) => sender.track.kind === "video")
                .replaceTrack(videoTrack) 
                .catch((err: any) => console.error(err));
        });
    };
    
    // const shareScreen = async () => {
    //     try {
    //       if (screenSharingId) {
    //         const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    //         switchStream(stream);
    //       } else {
    //         const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
    //         switchStream(stream);
    //         setScreenStream(stream);
    //       }
    //     } catch (err) {
    //       console.error('Error accessing media devices:', err);
    //     }
    // };

    const shareScreen = () => {
        if (screenSharingId) {
            navigator.mediaDevices            
                .getUserMedia({ video: true, audio: true })
                .then(switchStream); 
        } else {
            navigator.mediaDevices.getDisplayMedia({}).then((stream) => {
                switchStream(stream);
                setScreenStream(stream);
                console.log('Screen sharing ID:', screenSharingId);
            });
        }
    };
    

    const nameChangedHandler = ({ peerId, userName }: {
        peerId: string,
        userName: string
    }) => {
        dispatch(addPeerNameAction(peerId, userName));
    };

    useEffect(() => {
        ws.emit("change-name", { peerId: userId, userName, roomId });
    }, [userName, userId,roomId]);

    useEffect(() => {
        const peer = new Peer(userId, {
            // host: "13.210.68.104",
            host: "localhost",
            port: 9000,
            // port: 80,
            path: "/"
            
        });
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
        if (!me) return;
        if (!stream) return;
        ws.on("user-joined", ({peerId, userName: name}) => {
            const call = me.call(peerId, stream, {
                metadata: {
                    userName,
                },
            });
            
            call.on("stream", (peerStream) => {
                dispatch(addPeerStreamAction(peerId, peerStream));
            });
            dispatch(addPeerNameAction(peerId, name));   
        });

        me.on("call", (call) => {
            const { userName } = call.metadata;
            dispatch(addPeerNameAction(call.peer, userName));
            call.answer(stream);
            call.on("stream", (peerStream) => {
                dispatch(addPeerStreamAction(call.peer, peerStream))
            });
        });

        return () => {
            ws.off("user-joined");
        };

    }, [me, stream, userName]);

    // useEffect(() => {
    //     if (!me || !stream) return;
      
    //     if (ws) {
    //       ws.on("user-joined", ({peerId, userName: name}) => {
    //         dispatch(addPeerNameAction(peerId, name));
    //         const call = me.call(peerId, stream, {
    //           metadata: {
    //             userName,
    //           },
    //         });
      
    //         if (call) {
    //           call.on("stream", (peerStream) => {
    //             dispatch(addPeerStreamAction(peerId, peerStream));
    //           });
    //         }
    //       });
    //     }
      
    //     if (me) {
    //       me.on("call", (call) => {
    //         const { userName } = call.metadata.userName;
    //         dispatch(addPeerNameAction(call.peer, userName));
    //         call.answer(stream);
      
    //         if (call) {
    //           call.on("stream", (peerStream) => {
    //             dispatch(addPeerStreamAction(call.peer, peerStream))
    //           });
    //         }
    //       });
    //     }
    //   }, [me, stream, screenSharingId, userName]);

    // console.log({ peers });

    return (
        <RoomContext.Provider 
            value={{ 
                stream, 
                screenStream,
                peers, 
                shareScreen, 
                roomId,
                setRoomId,
                screenSharingId, 
            }}
        >
            {children}
        </RoomContext.Provider>
    );
};



