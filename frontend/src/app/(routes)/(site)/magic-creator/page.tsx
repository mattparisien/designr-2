import Heading from "@/components/Heading/Heading";
import PromptBar from "./components/PromptBar";

const MagicCreatorPage = () => {
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
                <PromptBar />
            </div>
        </div>
    );
}


export default MagicCreatorPage;