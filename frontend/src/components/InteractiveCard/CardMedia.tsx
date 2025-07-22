import Image from "next/image";
import { ReactNode } from "react";

interface CardMediaProps {
    image?: {
        src: string;
        alt: string;
    };
    selected: boolean;
    children?: ReactNode;
}

export function CardMedia({ image, selected, children }: CardMediaProps) {
    return (
        <div className={`relative aspect-video p-4 bg-neutral-100 overflow-hidden rounded-lg group-hover:bg-neutral-200 transition-colors duration-200 border-2 ${selected ? 'border-[var(--border-accent)]' : 'border-transparent'}`}
        >
            {image && (
                    <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        className="w-full h-full object-contain shadow-md p-4"
                    />
            )}
            {children}
        </div>
    );
}