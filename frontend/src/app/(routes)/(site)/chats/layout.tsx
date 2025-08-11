
"use client";
import { useChat } from "@/lib/context/chat-context";
import { useNavigation } from "@/lib/context/navigation-context";
import { NavigationItem, type NavigationSection } from "@/lib/types/navigation";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import PromptBar from "./components/PromptBar";

const ChatsLayout = ({ children }: { children: React.ReactNode }) => {
    const { send, loading, error, currentSessionId, chatSessions, deleteSession } = useChat();

    const { addNavigationSection, removeNavigationSection } = useNavigation();
    const router = useRouter();



    const handleDeleteSession = useCallback(async (sessionId: string) => {
        try {
            await deleteSession(sessionId);
            // If we deleted the current session, redirect to chats home
            if (currentSessionId === sessionId) {
                router.push('/chats');
            }
        } catch (error) {
            console.error('Failed to delete session:', error);
        }
    }, [deleteSession, currentSessionId, router]);

    const chatNavigation: NavigationSection | null = useMemo(() => {
        return chatSessions.length > 0 ? {
            id: "chats",
            label: "Chats",
            items: chatSessions.map(session => ({
                id: session._id,
                label: session.title || "Chat Session",
                href: `/chats/${session._id}`,
                onDelete: (item: NavigationItem) => {
                    handleDeleteSession(item.id);
                }
            }) as NavigationItem)
        } : null;
    }, [chatSessions, handleDeleteSession]);


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
        <div className="w-full h-full @container">
            <div className="flex items-center justify-center h-full overflow-hidden h-screen [--thread-max-width:32rem] @lg:[--thread-max-width:40rem] @5xl:[--thread-max-width:48rem]">
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
        </div>
    );
}


export default ChatsLayout;