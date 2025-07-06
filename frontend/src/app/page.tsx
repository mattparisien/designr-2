"use client"
import { Sidebar } from "@/components/ui";
import { Palette, Triangle, Type, Upload } from "lucide-react";
import EditorMain from "@/components/Editor/Main";

const Page = () => {

    //     interface SidebarItem {
    //   id: string
    //   title: string
    //   href?: string
    //   children?: SidebarItem[]
    // }

    // interface SidebarSection {
    //   title: string
    //   items: SidebarItem[]
    // }


    return <div className="flex">
    
    <Sidebar
    className="fixed left-0 top-0"
        sections={
            [
                {
                    title: "section1",
                    items: [
                        {
                            id: "1",
                            title: "Elements",
                            href: "/something",
                            icon: Triangle
                        },
                        {
                            id: "2",
                            title: "Brands",
                            href: "/brands",
                            icon: Palette
                        },
                        {
                            id: "3",
                            title: "Text",
                            href: "/type",
                            icon: Type
                        },
                        {
                            id: "4",
                            title: "Uploads",
                            href: "/uploads",
                            icon: Upload
                        }
                    ]
                }
            ]
        }


    />
    <main className="w-screen h-screen pl-[var(--sidebar-width)]">

    </main>
    </div>
}

export default Page;