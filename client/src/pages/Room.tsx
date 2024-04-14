import { useParams } from "react-router-dom";
import { useContext, useEffect } from "react";
import { RoomContext } from "../context/RoomContext";
import { VideoPlayer } from "../components/VideoPlayer";
import { PeerState } from "../reducers/peerReducer";
import { ShareScreenButton } from "../components/ShareScreenButton";
import { ChatButton } from "../components/ChatButton";
import { Chat } from "../components/chat/Chat";
import { NameInput } from "../common/name";

export const Room = () => {
    const { id } =  useParams();
    const { 
        ws, 
        me, 
        userName,
        stream, 
        peers, 
        shareScreen, 
        screenSharingId, 
        setRoomId, 
        toggleChat, 
        chat, 
    } = useContext(RoomContext);
     

    useEffect(() => {
        if (me && stream) ws.emit("join-room", {roomId: id, peerId: me._id, userName});
    }, [id, me, ws, stream]);

    useEffect(() => {
        setRoomId(id);
    }, [id, setRoomId]);

    console.log({screenSharingId});
    const screenSharingVideo = screenSharingId === me?.id ? stream: peers[screenSharingId]?.stream;
    const {[screenSharingId]: sharing, ...peersToShow} = peers;
            
    return (
        <div className="flex flex-col min-h-screen">
            <div className="bg-red-500 p-4 text-white">Room id {id}</div>
            <div className="flex grow">
                {screenSharingVideo && (
                    <div className="w-4/5 pr-4">
                        <VideoPlayer stream={screenSharingVideo}/>
                    </div>
                )}
                
                <div className={`grid gap-4 
                    ${screenSharingVideo ? "w-1/5 grid-col-1" : "grid-cols-4"
                    }`}
                >
                    {screenSharingId !== me?.id && (
                        <div>
                            <VideoPlayer stream = {stream} />
                            <NameInput />
                        </div>
                        
                    )}

                    {Object.values(peersToShow as PeerState)
                        .filter((peer) => !!peer.stream)
                        .map((peer) => (
                        <div>
                            <VideoPlayer stream = {peer.stream} />
                            <div>{peer.userName}</div>
                        </div>
                    ))}
                </div>
                {chat.isChatOpen && (
                    <div className="border-l-2">
                            <Chat />
                    </div>  
                )}
            </div>
              
            <div className="h-28 bottom-0 p-6 w-full flex items-center justify-center border-t-2 bg-white">
                <ShareScreenButton onClick={shareScreen} />
                <ChatButton onClick={toggleChat} />
            </div>
        </div>
        
    );
};