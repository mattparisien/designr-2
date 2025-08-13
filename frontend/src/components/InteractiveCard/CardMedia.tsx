import { cn } from "@/lib/utils";
import Image from "next/image";
import { ReactNode } from "react";

interface CardMediaProps {
    image?: {
        src: string;
        alt: string;
        objectFit: "none" | "cover" | "contain" | "fill";
    };
    selected: boolean;
    children?: ReactNode;
}

export function CardMedia({ selected, children, image }: CardMediaProps) {


    const imgClasses = cn("w-full h-full shadow-md", {
        "object-contain": image?.objectFit === "contain",
        "object-cover": image?.objectFit === "cover",
        "object-fill": image?.objectFit === "fill",
        "object-none": image?.objectFit === "none",
        "p-4": image?.objectFit !== "cover"
    })

    return (
        <div className={`relative aspect-video bg-neutral-100 overflow-hidden group-hover:bg-neutral-200 rounded-lg transition-colors duration-200`}
        >
            <div className={`absolute top-0 left-0 pointer-events-none w-full h-full border-2 z-[99] p-4 rounded-lg ${selected ? 'border-[var(--border-accent)]' : 'border-transparent'}`}></div>
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