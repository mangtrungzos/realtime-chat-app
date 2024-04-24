import { useContext, useState } from "react";
import { Button } from "../common/Button";
import { ChatContext } from "../../context/ChatContext";
import { UserContext } from "../../context/UserContext";
import { RoomContext } from "../../context/RoomContext";

export const ChatInput: React.FC = () => {
    const [ message, setMessage ] = useState("");
    const { sendMessage } = useContext(ChatContext);
    const { userId } = useContext(UserContext);
    const { roomId } = useContext(RoomContext);
    return (
        <div>
            <form onSubmit={(e) => {
                e.preventDefault();
                sendMessage(message, roomId, userId);
                setMessage("");
            }}>
                <div className="flex">
                    <textarea 
                        className="border rounded"
                        onChange={e => setMessage(e.target.value)} 
                        value={message} />
                    <Button testId="send-msg-button" type="submit" className="bg-rose-400 p-2 mx-2 rounded-lg text-xl hover:bg-rose-600 text-white">
                    <svg
                        style={{}}
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        strokeWidth="1.5" 
                        stroke="currentColor" 
                        className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                    </svg>

                    </Button>
                </div>
                
            </form>
        </div>
    );
}