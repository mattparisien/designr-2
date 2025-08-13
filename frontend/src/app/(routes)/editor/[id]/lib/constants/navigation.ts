import { type Navigation } from "@/lib/types/navigation";

export const EDITOR_NAVIGATION: Navigation = {
    id: "editor-navigation",
    sections: [
        {
            id: "main",
            items: [
                {
                    id: "design",
                    label: "Design",
                    icon: "lucide:layout-panel-top",
                },
                {
                    id: "brands",
                    label: "Brands",
                    icon: "lucide:palette",
                },
                {
                    id: "shape",
                    label: "Shapes",
                    icon: "lucide:shapes",
                },
                {
                    id: "text",
                    label: "Text",
                    icon: "lucide:type"
                },
                {
                    id: "assets",
                    label: "Assets",
                    icon: "lucide:camera",
                },
                {
                    id: "export",
                    label: "Export",
                    icon: "lucide:download"
                },
            ]
        }
    ],
};
