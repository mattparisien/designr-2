import { type Navigation } from "@/lib/types/navigation";

export const EDITOR_NAVIGATION: Navigation = {
    title: "Editor",
    sections: [
        {
            id: "main",
            items: [
                {
                    id: "design",
                    title: "Design",
                    icon: "lucide:layout-panel-top",
                },
                {
                    id: "brand",
                    title: "Brands",
                    icon: "lucide:palette",
                },
                {
                    id: "shape",
                    title: "Shapes",
                    icon: "lucide:shapes",
                },
                {
                    id: "text",
                    title: "Text",
                    icon: "lucide:type"
                },
                {
                    id: "assets",
                    title: "Assets",
                    icon: "lucide:camera",
                },
                {
                    id: "export",
                    title: "Export",
                    icon: "lucide:download"
                },
            ]
        }
    ],
};
