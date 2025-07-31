"use client"
import { useNavigationContext } from "@/lib/context/navigation-context";
import { Sidebar } from "../ui";

const SidebarNavigation = () => {
    
    const { navigations } = useNavigation();

    return <Sidebar/>;
}