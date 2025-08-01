"use client"
import { useChat } from "@/lib/context/chat-context";
import { useNavigation } from "@/lib/context/navigation-context";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";

const ChatSessionPage = () => {
    const { slug } = useParams();
    const { messages, loadSessionMessages, setCurrentSession } = useChat();
    const { setActiveItem } = useNavigation();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (slug && typeof slug === 'string') {
            setActiveItem(slug);
            loadSessionMessages(slug);
        }

        return () => {
            setActiveItem(null);
            setCurrentSession(null);
        }
    }, [slug, loadSessionMessages, setActiveItem, setCurrentSession]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    }, [messages]);




    return (
        <div ref={scrollContainerRef} className="w-full h-full overflow-y-scroll">
            <div className="w-full flex flex-col flex-1 mt-10 space-y-10 max-w-[var(--thread-max-width)] mx-auto">
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
        </div>
    )
}

export default ChatSessionPage;