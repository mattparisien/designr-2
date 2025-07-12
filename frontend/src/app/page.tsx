"use client"
import { Sidebar } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Plus, Palette, Triangle, Type, Upload } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClient } from "@/lib/api";

const Page = () => {
    const [isCreating, setIsCreating] = useState(false);
    const router = useRouter();
    const api = new ApiClient();

    const handleCreateTemplate = async () => {
        setIsCreating(true);
        try {
            const response = await api.createTemplate({
                name: 'New Template',
                category: 'social-post',
                vibe: 'minimal'
            });
            
            if (response.template && response.template._id) {
                router.push(`/editor/${response.template._id}`);
            }
        } catch (error) {
            console.error('Error creating template:', error);
            alert('Failed to create template. Please try again.');
        } finally {
            setIsCreating(false);
        }
    };

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
    <main className="w-screen h-screen pl-[var(--sidebar-width)] flex items-center justify-center">
        <div className="text-center">
            <h1 className="text-3xl font-bold mb-8">Welcome to Template Creator</h1>
            <Button 
                onClick={handleCreateTemplate}
                disabled={isCreating}
                size="lg"
                className="flex items-center gap-2"
            >
                <Plus className="h-5 w-5" />
                {isCreating ? 'Creating...' : 'Create New Template'}
            </Button>
        </div>
    </main>
    </div>
}

export default Page;