
"use client";
import { useChat } from "@/lib/context/chat-context";
import { useNavigation } from "@/lib/context/navigation-context";
import { NavigationItem, type NavigationSection } from "@/lib/types/navigation";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import PromptBar from "./components/PromptBar";

const ChatsLayout = ({ children }: { children: React.ReactNode }) => {
    const { send, loading, error, currentSessionId, chatSessions } = useChat();

    const { addNavigationSection, removeNavigationSection } = useNavigation();
    const router = useRouter();

    useEffect(() => {
        console.log("Current session ID:", currentSessionId);
    }, [currentSessionId, ])


    const chatNavigation: NavigationSection = useMemo(() => {
        return {
            id: "chats",
            label: "Chats",
            items: chatSessions.map(session => ({
                id: session._id,
                label: session.title || "Chat Session",
                href: `/chats/${session._id}`
            }) as NavigationItem)
        };
    }, [chatSessions]);


    useEffect(() => {
        if (chatNavigation) {
            addNavigationSection(chatNavigation);
        }

        return () => {
            if (chatNavigation) {
                removeNavigationSection(chatNavigation.id);
            }
        };
    }, [chatNavigation, addNavigationSection, removeNavigationSection]);

    useEffect(() => {
        if (!currentSessionId) return;
        router.push("/chats/" + currentSessionId);
        
    }, [currentSessionId, router]);


    const handleSubmit = useCallback((prompt: string) => {
        return send(prompt);
    }, [send]);

    return (
        <div className="flex items-center justify-center h-full overflow-hidden h-screen">
            <div className="flex flex-col items-center justify-center w-full h-full gap-10">
                {children}
                <PromptBar
                    onSubmit={handleSubmit}
                    disabled={loading}
                    placeholder={loading ? "Generating..." : "Describe what you want to create..."}
                    className={currentSessionId && "mb-5"}
                />
                {error && (
                    <div className="text-red-500 text-sm max-w-md text-center">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}


export default ChatsLayout;