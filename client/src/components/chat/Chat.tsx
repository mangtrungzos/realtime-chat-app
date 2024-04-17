import { useContext } from "react";
import { IMessage } from "../../types/chat";
import { ChatBubble } from "./ChatBubble";
import { ChatInput } from "./ChatInput";
import { ChatContext } from "../../context/ChatContext";
export const Chat: React.FC = () => {
    const { chat } = useContext(ChatContext);

    return (
        <div className="flex flex-col h-full justify-between">
            <div>
                {chat.messages.map((message: IMessage) => (
                <ChatBubble 
                    message={message} 
                    key={message.timestamp + (message?.author || "anonymous")} 
                />
            ))}
            </div>
            <ChatInput />
        </div>
    )
}