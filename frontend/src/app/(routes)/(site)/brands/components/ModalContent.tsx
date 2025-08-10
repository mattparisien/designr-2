import Heading from "@/components/Heading/Heading"
import { Input } from "@/components/ui";

const CreateModalContent = () => {
    return <div className="p-4">
        <Heading as={2} styleLevel={3}>
            Create a New Brand
        </Heading>
        <div className="mt-4">
            <Input
                placeholder="Brand Name"
                className="w-full"
                autoFocus
            />

        </div>
    </div>
}

        export default CreateModalContent;