import { Navigation } from "../types/navigation";

export const APP_NAVIGATION : Navigation = {
    id: "app-navigation",
    sections: [
        {
            id: "main",
            items: [
                {
                    id: "projects",
                    label: "Projects",
                    href: "/projects",
                    icon: "lucide:folder-closed"
                },
                {
                    id: "templates",
                    label: "Templates",
                    href: "/templates",
                    icon: "lucide:panels-top-left"
                },
                {
                    id: "brands",
                    label: "Brands",
                    href: "/brands",
                    icon: "lucide:id-card"
                },
                {
                    id: "assets",
                    label: "Assets",
                    href: "/assets",
                    icon: "lucide:image"
                },
                {
                    id: "chats",
                    label: "Magic Creator",
                    href: "/chats",
                    icon: "lucide:sparkle"
                },
            ],
        }
    ]
}