import { cn } from "@/lib/utils";

interface ColorSwatchProps {
    color: string;
    onClick: (color: string) => void;
    className?: string;
}

const ColorSwatch = (props: ColorSwatchProps) => {

    const { color, onClick, className } = props;

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        onClick?.(color);
    };

    return <div
        {...props}
        className={cn("w-10 h-10 rounded-full border-[0.5px] border-gray-400 cursor-pointer hover:border-gray-400 transition-colors", className)}
        style={{ backgroundColor: props.color }}
        onClick={handleClick}
    />
}

export default ColorSwatch;