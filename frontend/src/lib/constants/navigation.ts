import { Navigation } from "../types/navigation";

export const SITE_NAVIGATION : Navigation = {
    id: "site-navigation",
    title: "Site",
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
                    id: "magic-creator",
                    label: "Magic Creator",
                    href: "/magic-creator",
                    icon: "lucide:sparkle"
                },
            ],
        }
    ]
}