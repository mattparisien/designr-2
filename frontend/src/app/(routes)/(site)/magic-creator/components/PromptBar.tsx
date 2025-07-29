import { Input } from "@/components/ui";

const PromptBar = () => {
    return (
        <div className="w-full max-w-xl">
            <form className="overflow-hidden rounded-[28px] border border-neutral-200 w-full h-30">
                <Input placeholder="Type your prompt here..." className="h-full border-0 focus:ring-0 focus:outline-none" removeFocus />
            </form>
        </div>
    );
}

export default PromptBar;

