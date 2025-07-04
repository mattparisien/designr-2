
import FabricEditor from "../FabricEditor";

const EditorMain = () => {
    return <main className="flex h-[calc(100vh-80px)]">
        <FabricEditor width={1080} height={1080} />
    </main>
}

export default EditorMain;