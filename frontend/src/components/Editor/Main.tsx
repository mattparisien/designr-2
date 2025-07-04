
import FabricEditor from "./FabricEditor/index";

const EditorMain = () => {
    return <main className="flex w-full h-screen pl-20 pt-20 overflow-hidden relative items-center justify-center">
        <FabricEditor width={1080} height={1080} />
    </main>
}

export default EditorMain;