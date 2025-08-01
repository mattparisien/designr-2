"use client"
import { Button, Textarea } from "@/components/ui";
import { ArrowUp } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useChat } from "@/lib/context/chat-context";

interface PromptBarProps {
    onSubmit: (prompt: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

const PromptBar = ({ onSubmit, placeholder = "Type your prompt here...", disabled = false, className }: PromptBarProps) => {
    const [inputValue, setInputValue] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { loading } = useChat();

    // Keep textarea focused when AI response completes
    useEffect(() => {
        if (!loading && textareaRef.current) {
            // Small delay to ensure DOM updates are complete
            setTimeout(() => {
                textareaRef.current?.focus();
            }, 100);
        }
    }, [loading]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedValue = inputValue.trim();
        if (trimmedValue && !disabled) {
            onSubmit(trimmedValue);
            setInputValue(""); // Clear input after submission
        }
    };

    const handleButtonClick = () => {
        const trimmedValue = inputValue.trim();
        if (trimmedValue && !disabled) {
            onSubmit(trimmedValue);
            setInputValue(""); // Clear input after submission
        }
    };

    return (
        <div className={cn("w-full max-w-[var(--thread-max-width)]", className)}>
            <form onSubmit={handleSubmit} className="overflow-hidden rounded-[28px] border border-neutral-200 w-full min-h-30">
                <div className="w-full h-full flex flex-col items-center justify-start">
                    <Textarea 
                        ref={textareaRef}
                        placeholder={placeholder} 
                        className="h-full border-0 focus:ring-0 focus:outline-none resize-none p-5" 
                        value={inputValue}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInputValue(e.target.value)}
                        focusNone 
                        borderNone
                        disabled={disabled}
                    />
                    <div className="w-full flex pb-4 px-4">
                        <Button 
                            type="button"
                            onClick={handleButtonClick}
                            disabled={disabled || !inputValue.trim()}
                            className={cn(
                            "ml-auto bg-neutral-300 rounded-full p-1 transition-opacity duration-200",
                            !inputValue.trim() ? "opacity-0 pointer-events-none" : "opacity-100"
                        )} variant="ghost">
                            <ArrowUp className="text-neutral-600 w-6 h-6" strokeWidth={2}/>
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default PromptBar;

