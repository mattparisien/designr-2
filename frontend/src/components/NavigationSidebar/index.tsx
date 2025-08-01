"use client"
import { Sidebar } from "../ui";
import { useNavigation } from "@/lib/context/navigation-context";
import { APP_NAVIGATION } from "@/lib/constants";
import { Navigation } from "../ui/navigation";

const NavigationSidebar = () => {
    const { navigation } = useNavigation();

    return (
        <Sidebar className="fixed left-0 top-0" >
            <Navigation navigation={navigation || APP_NAVIGATION}/>
        </Sidebar>

    );
};

export default NavigationSidebar;