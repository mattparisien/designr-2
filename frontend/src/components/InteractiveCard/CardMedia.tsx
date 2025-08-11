import { cn } from "@/lib/utils";
import Image from "next/image";
import { ReactNode } from "react";

interface CardMediaProps {
    image?: {
        src: string;
        alt: string;
        objectFit: string;
    };
    objectFit: "cover" | "contain" | "fill" | "none";
    selected: boolean;
    children?: ReactNode;
}

export function CardMedia({ image, selected, children }: CardMediaProps) {

    const imgClasses = cn("w-full h-full shadow-md", {
        "object-contain": image?.objectFit === "contain",
        "object-cover": image?.objectFit === "cover",
        "object-fill": image?.objectFit === "fill",
        "object-none": image?.objectFit === "none",
        "p-4": image?.objectFit !== "cover"
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