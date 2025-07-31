"use client"
import { Sidebar } from "../ui";
import { useNavigation } from "@/lib/context/navigation-context";
import { SITE_NAVIGATION } from "@/lib/constants";

const AppNavigation = () => {
    const { navigation } = useNavigation();

    return <Sidebar navigation={navigation || SITE_NAVIGATION} className="fixed left-0 top-0" />;
};

export default AppNavigation;