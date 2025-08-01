"use client"
import { Sidebar } from "../ui";
import { useNavigation } from "@/lib/context/navigation-context";
import { APP_NAVIGATION } from "@/lib/constants";

const AppNavigation = () => {
    const { navigation } = useNavigation();

    return <Sidebar navigation={navigation || APP_NAVIGATION} className="fixed left-0 top-0" />;
};

export default AppNavigation;