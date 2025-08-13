import Heading from "@/components/Heading/Heading";
import { useBrandQuery } from "@/lib/hooks/useBrands";
import { Shuffle } from "lucide-react";
import { Palette } from "@shared/types/core/brand";
import useEditorStore from "../../lib/stores/useEditorStore";

export const BrandsPanelContent = () => {

    const { brands } = useBrandQuery();
    const recolorArtwork = useEditorStore(state => state.recolorArtwork);

    const handlePaletteClick = (palette: Palette) => {
        recolorArtwork(palette.colors.map(color => ({ hex: color.hex })));
    }

    return (
        <div>
            <Heading as={3} className="mb-10">Brands</Heading>
            <div className="flex flex-col space-y-4">
                {brands.map(brand => (
                    <div key={brand.id} className="w-60">
                        {brand.palettes.map((palette, index) => (
                            <div key={index} className="flex w-full rounded-md overflow-hidden cursor-pointer relative group" onClick={() => handlePaletteClick(palette)}>
                                {palette.colors.map((color, colorIndex) => (
                                    <div
                                        key={colorIndex}
                                        className="w-10 h-10 flex-1"
                                        style={{ backgroundColor: color.hex }}
                                    ></div>
                                ))}
                                <div className="absolute w-full h-full top-0 left-0 pointer-events-none flex items-center justify-center after:bg-black after:absolute after:left-0 after:top-0 after:w-full after:h-full after:opacity-0 group-hover:after:opacity-40 after:transition-opacity after:duration-300">
                                    <div className="text-white z-5 transition-opacity duration-200 opacity-0 group-hover:opacity-100">
                                        <span><Shuffle className="inline-block mr-1 w-4 h-4" /></span>
                                        <span className="text-sm">Shuffle</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}

            </div>
        </div>
    );
}
