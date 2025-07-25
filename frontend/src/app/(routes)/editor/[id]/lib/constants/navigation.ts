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
                    href: "/editor/brand",
                    icon: "lucide:layout-panel-top",
                },
                {
                    id: "brand",
                    title: "Brands",
                    href: "/editor/brand",
                    icon: "lucide:palette",
                },
                {
                    id: "shape",
                    title: "Shapes",
                    href: "/editor/brand",
                    icon: "lucide:shapes",
                },
                {
                    id: "text",
                    title: "Text",
                    href: "/editor/brand",
                    icon: "lucide:type"
                },
                {
                    id: "assets",
                    title: "Assets",
                    href: "/editor/assets",
                    icon: "lucide:camera"
                },
                {
                    id: "export",
                    title: "Export",
                    href: "/editor/export",
                    icon: "lucide:download"
                },
            ]
        }
    ],
};
