import { IMessage } from "../../types/chat";
import { ChatBubble } from "./ChatBubble";
import { ChatInput } from "./ChatInput";
export const Chat: React.FC = ({}) => {
    const messages: IMessage[] = [
        {
            content: "Message 1",
            author: "",
            timestamp: ""
        },
        {
            content: "Message 2",
            author: "",
            timestamp: ""
        }
    ];
    return (
        <div className="flex flex-col h-full justify-between">
            <div>{messages.map((message) => (
                <ChatBubble message={message} />
            ))}
            </div>
            <ChatInput />
        </div>
    )
}