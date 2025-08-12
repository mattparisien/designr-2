"use client"

import { useParams } from "next/navigation";
import { useBrandQuery } from "@/lib/hooks/useBrands";
import { useEffect } from "react";

const BrandPage = () => {
    const { slug } = useParams();
    const { brand } = useBrandQuery(slug as string);


    useEffect(() => {
        console.log("Brand data:", brand);
    }, [brand]);
}

export default BrandPage;