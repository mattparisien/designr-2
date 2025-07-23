import { cn } from "@/lib/utils";

interface ToolbarSectionProps {
    children: React.ReactNode;
    space?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 12 | 16 | 20 | 24 | 32 | 40 | 48 | 56 | 64 | 72 | 80;
}

const ToolbarSection = ({ children, space = 2 }: ToolbarSectionProps) => {

    const classes = cn("flex items-center", {
        "space-x-1": space === 1,
        "space-x-2": space === 2,
        "space-x-3": space === 3,
        "space-x-4": space === 4,
        "space-x-5": space === 5,
        "space-x-6": space === 6,
        "space-x-7": space === 7,
        "space-x-8": space === 8,
        "space-x-9": space === 9,
        "space-x-10": space === 10,
        "space-x-12": space === 12,
        "space-x-16": space === 16,
        "space-x-20": space === 20,
        "space-x-24": space === 24,
        "space-x-32": space === 32,
        "space-x-40": space === 40,
        "space-x-48": space === 48,
        "space-x-56": space === 56,
        "space-x-64": space === 64,
        "space-x-72": space === 72,
        "space-x-80": space === 80,
    });

    return <div className={classes}>{children}</div>
}

export default ToolbarSection;