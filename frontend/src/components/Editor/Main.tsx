
import FabricEditor from "./FabricEditor/index";

const EditorMain = () => {
    return <main className="flex w-full h-screen pl-20 pt-20 overflow-hidden">
        <FabricEditor width={1080} height={1080} />
    </main>
}

export default EditorMain;