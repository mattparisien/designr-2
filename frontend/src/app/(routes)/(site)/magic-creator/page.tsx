
"use client";
import Heading from "@/components/Heading/Heading";
import PromptBar from "./components/PromptBar";
import { useChat } from "@/lib/context/chat-context";
import { useCallback } from "react";

const MagicCreatorPage = () => {
    const { send, loading, error } = useChat();


    const handleSubmit = useCallback((prompt: string) => {
        return send(prompt);
    }, [send]);

    return (
        <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center justify-center w-full gap-10">
                <Heading
                    as={1}
                    styleLevel={3}
                    className="text-center"
                >
                    What do you want to create today?
                </Heading>
                <PromptBar 
                    onSubmit={handleSubmit}
                    disabled={loading}
                    placeholder={loading ? "Generating..." : "Describe what you want to create..."}
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


export default MagicCreatorPage;