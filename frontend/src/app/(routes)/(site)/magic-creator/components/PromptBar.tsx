"use client"
import { Button, Textarea } from "@/components/ui";
import { ArrowUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const PromptBar = () => {
    const [inputValue, setInputValue] = useState("");

    return (
        <div className="w-full max-w-xl">
            <form className="overflow-hidden rounded-[28px] border border-neutral-200 w-full min-h-30">
                <div className="w-full h-full flex flex-col items-center justify-start">
                    <Textarea 
                        placeholder="Type your prompt here..." 
                        className="h-full border-0 focus:ring-0 focus:outline-none resize-none p-5" 
                        value={inputValue}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInputValue(e.target.value)}
                        focusNone 
                        borderNone
                    />
                    <div className="w-full flex pb-4 px-4">
                        <Button className={cn(
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

