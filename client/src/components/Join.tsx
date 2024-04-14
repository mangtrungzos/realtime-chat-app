import { useContext } from "react";
import { RoomContext } from "../context/RoomContext";
import { NameInput } from "../common/name";

export const Join: React.FC = () => {
    // Join button
    const { ws } = useContext(RoomContext);
    // Join Room
    const createRoom = () => {
        ws.emit("create-room");
    }
    return (
        <div className="flex flex-col">
            <NameInput/>
            <button 
                onClick={createRoom} 
                className="bg-rose-400 py-2 px-8 rounded-lg text-lx hover:bg-rose-600 text-white">
                Start new meeting
            </button>
        </div>
    );
};