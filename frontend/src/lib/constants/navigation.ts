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
            ],
        }
    ]
}