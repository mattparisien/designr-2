import { Navigation } from "../types/navigation";

export const SITE_NAVIGATION : Navigation = {
    title: "Site",
    sections: [
        {
            id: "main",
            items: [
                {
                    id: "projects",
                    title: "Projects",
                    href: "/projects",
                    icon: "lucide:folder-closed"
                },
                {
                    id: "templates",
                    title: "Templates",
                    href: "/templates",
                    icon: "lucide:panels-top-left"
                },
                {
                    id: "brands",
                    title: "Brands",
                    href: "/brands",
                    icon: "lucide:id-card"
                },
                {
                    id: "assets",
                    title: "Assets",
                    href: "/assets",
                    icon: "lucide:image"
                },
                {
                    id: "magic-creator",
                    title: "Magic Creator",
                    href: "/magic-creator",
                    icon: "lucide:sparkle"
                },
            ],
        }
    ]
}