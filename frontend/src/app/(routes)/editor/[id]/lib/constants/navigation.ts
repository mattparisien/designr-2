import { type Navigation } from "@/lib/types/navigation";

export const EDITOR_NAVIGATION: Navigation = {
    id: "editor-navigation",
    title: "Editor",
    sections: [
        {
            id: "main",
            items: [
                {
                    id: "design",
                    label: "Design",
                    href: "#design",
                    icon: "lucide:layout-panel-top",
                },
                {
                    id: "brand",
                    label: "Brands",
                    href: "#brand",
                    icon: "lucide:palette",
                },
                {
                    id: "shape",
                    label: "Shapes",
                    href: "#shape",
                    icon: "lucide:shapes",
                },
                {
                    id: "text",
                    label: "Text",
                    href: "#text",
                    icon: "lucide:type"
                },
                {
                    id: "assets",
                    label: "Assets",
                    href: "#assets",
                    icon: "lucide:camera",
                },
                {
                    id: "export",
                    label: "Export",
                    href: "#export",
                    icon: "lucide:download"
                },
            ]
        }
    ],
};
