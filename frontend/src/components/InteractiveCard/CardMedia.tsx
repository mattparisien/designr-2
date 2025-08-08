import { cn } from "@/lib/utils";
import Image from "next/image";
import { ReactNode } from "react";

interface CardMediaProps {
    image?: {
        src: string;
        alt: string;
    };
    objectFit: "cover" | "contain" | "fill" | "none";
    selected: boolean;
    children?: ReactNode;
}

export function CardMedia({ image, selected, children, objectFit = "contain" }: CardMediaProps) {

    const imgClasses = cn("w-full h-full shadow-md", {
        "object-contain": objectFit === "contain",
        "object-cover": objectFit === "cover",
        "object-fill": objectFit === "fill",
        "object-none": objectFit === "none",
        "p-4": objectFit !== "cover"
    })

    return (
        <div className={`relative aspect-video p-4 bg-neutral-100 overflow-hidden rounded-lg group-hover:bg-neutral-200 transition-colors duration-200 border-2 ${selected ? 'border-[var(--border-accent)]' : 'border-transparent'}`}
        >
            {image && (
                    <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        className={imgClasses}
                    />
            )}
            {children}
        </div>
    );
}