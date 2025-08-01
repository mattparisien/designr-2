"use client"
import { useChat } from "@/lib/context/chat-context";
import { cn } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

const ChatSessionPage = () => {
    const router = useRouter();
    const { slug } = useParams();
    const { messages, currentSessionId, setCurrentSession } = useChat();

    useEffect(() => {
        if (!currentSessionId) {
            setCurrentSession(slug as string);
        }
    }, [currentSessionId, slug, router, setCurrentSession]);

    return <div className="w-full flex flex-col flex-1 h-full mt-10 space-y-10 max-w-xl">
        {messages.length && messages.map((message) => (
            <div key={message.id} className={cn("flex", {
                "justify-end w-full": message.role === "user"
            })}>
                <div key={message.id} className={cn("", {
                    "bg-neutral-100 px-4 py-2 rounded-4xl": message.role === "user",
                })}>{message.content}</div>
            </div>
        ))}
    </div>
}

export default ChatSessionPage;