"use client"

import PageSkeleton from "@/components/PageSkeleton";
import { Section } from "@/components/ui/section";
import { useBrandQuery } from "@/lib/hooks/useBrands";
import { useParams } from "next/navigation";

const BrandPage = () => {
    const { slug } = useParams();
    const { brand } = useBrandQuery(slug as string);

    return (
        <PageSkeleton
            heading={brand?.name}
        >
            <Section isCollapsible defaultOpen>
                Hey
            </Section>
            {/* Brand details go here */}
        </PageSkeleton>
    );
}



export default BrandPage;