import { Card } from "@/components/ui/card";
import { useSelection } from "@/lib/context/selection-context";
import { useState } from "react";
import { CardMedia } from "./CardMedia";
import { EditableTitle } from "./EditableTitle";
import { SelectionCheckbox } from "./SelectionCheckbox";

interface InteractiveCardProps  {
    id: string;
    title: string;
    subtitleLeft?: string;
    subtitleRight?: string;
    image?: { src: string; alt: string, objectFit: "none" | "cover" | "contain" | "fill" };
    disableClick?: boolean; // if true, clicking does nothing
    objectFit?: "none" | "cover" | "contain" | "fill";
    onClick: () => void;
    onSelect?: (id: string, isSelected: boolean) => void;
    onTitleChange?: (newTitle: string) => void;
    children?: React.ReactNode;
}

export default function InteractiveCard({
    id,
    image,
    title,
    subtitleLeft,
    subtitleRight,
    disableClick = false,
    onClick,
    onSelect,
    onTitleChange,
    children,
}: InteractiveCardProps) {

    const { isSelected, toggleSelection } = useSelection();
    const [isHovered, setIsHovered] = useState(false);
    const selected = isSelected(id);

    const handleCardClick = () => {
        if (disableClick) return;
        onClick?.();
    };

    return (
        <Card
            className="relative cursor-pointer overflow-hidden group transition-all h-full"
            onClick={handleCardClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <CardMedia
                image={image}
                selected={selected}
            >
                {children}
            </CardMedia>

            <div className="py-4 px-1 cursor-pointer">
                <EditableTitle
                    id={id}
                    title={title}
                    onTitleChange={onTitleChange}
                />
                <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-neutral-500">{subtitleLeft}</span>
                    <span className="text-xs text-neutral-500">{subtitleRight}</span>
                </div>
            </div>
            <SelectionCheckbox
                selected={selected}
                visible={selected || isHovered}
                onSelect={(checked) => {
                    toggleSelection(id);
                    onSelect?.(id, checked);
                }}
            />
        </Card>
    );
}
