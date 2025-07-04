"use client"
import { ArrowLeft, Maximize, RotateCcw, Search, Type, Upload, Wand2, Download, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { TemplateData } from "./index";
import { SOCIAL_MEDIA_FORMATS } from "@/lib/constants";

interface EditorHeaderProps {
    templateData: TemplateData;
    showResizePanel: boolean;
    isUploadingFont: boolean;
    resizeSearchTerm: string;
    handleResize: (key: string) => void;
    handleCustomResize: (width: number, height: number) => void;
    setResizeSearchTerm: (term: string) => void;
    setShowMagicFill: (show: boolean) => void;
    setShowFontPanel: (show: boolean) => void;
    setShowResizePanel: (show: boolean) => void;
    handleExport: () => void;
    handleFontUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const EditorHeader = (props: EditorHeaderProps) => {

    const { templateData, showResizePanel, isUploadingFont, resizeSearchTerm, handleResize, handleCustomResize, setResizeSearchTerm, setShowFontPanel, setShowMagicFill, setShowResizePanel, handleExport, handleFontUpload } = props;
    const router = useRouter()

    return < header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60" >
        <div className="max-w-[1800px] mx-auto px-8" >
            <div className="flex items-center justify-between h-20" >
                {/* Left Section */}
                < div className="flex items-center gap-8" >
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="group flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 transition-all duration-300"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
                        <span className="text-sm font-medium tracking-wide" > Back to Dashboard </span>
                    </button>

                    < div className="w-px h-8 bg-slate-200" > </div>

                    < div >
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight" > {templateData.name} </h1>
                        < p className="text-sm text-slate-500 font-medium tracking-wide" >
                            {templateData.width}×{templateData.height} px
                        </p>
                    </div>
                </div>

                {/* Center Actions */}
                <div className="hidden md:flex items-center gap-4" >
                    <button
                        onClick={() => setShowMagicFill(true)}
                        className="group relative bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-indigo-600 hover:to-purple-700 flex items-center gap-3 shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 tracking-wide"
                    >
                        <Wand2 className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                        <span>AI Magic Fill </span>
                        < div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 blur-xl opacity-20" > </div>
                    </button>

                    < button
                        onClick={() => setShowFontPanel(true)}
                        className="bg-white border border-slate-200/60 text-slate-700 px-5 py-3 rounded-2xl font-semibold hover:bg-slate-50 hover:border-slate-300/60 flex items-center gap-3 transition-all duration-300 shadow-sm hover:shadow-md tracking-wide"
                    >
                        <Type className="w-4 h-4" />
                        <span>Fonts </span>
                    </button>

                    {/* Quick Font Upload */}
                    <div className="relative" >
                        <input
                            type="file"
                            accept=".woff,.woff2,.ttf,.otf"
                            onChange={handleFontUpload}
                            className="hidden"
                            id="header-font-upload"
                            disabled={isUploadingFont}
                        />
                        <label
                            htmlFor="header-font-upload"
                            className={`inline-flex items-center gap-2 px-4 py-3 rounded-2xl font-semibold transition-all duration-300 cursor-pointer tracking-wide ${isUploadingFont
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                                : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200/60 shadow-sm hover:shadow-md"
                                }`}
                        >
                            {
                                isUploadingFont ? (
                                    <>
                                        <RotateCcw className="w-4 h-4 animate-spin" />
                                        <span className="hidden lg:inline" > Uploading...</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4" />
                                        <span className="hidden lg:inline" > Upload Font </span>
                                    </>
                                )}
                        </label>
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3" >
                    <div className="hidden lg:flex items-center gap-3" >
                        <div className="relative resize-dropdown" >
                            <button
                                onClick={() => setShowResizePanel(!showResizePanel)}
                                className="bg-blue-50 text-blue-600 px-4 py-3 rounded-2xl hover:bg-blue-100 flex items-center gap-3 transition-all duration-300 border border-blue-200/60 font-semibold tracking-wide"
                            >
                                <Maximize className="w-4 h-4" />
                                <span>Resize </span>
                            </button>

                            {/* Enhanced Resize Dropdown */}
                            {
                                showResizePanel && (
                                    <div className="absolute top-16 right-0 bg-white border border-slate-200/60 rounded-3xl shadow-2xl shadow-slate-900/10 w-96 z-50" >
                                        <div className="p-6" >
                                            <div className="flex items-center justify-between mb-6" >
                                                <h3 className="text-lg font-bold text-slate-900 tracking-tight" > Resize Canvas </h3>
                                                < span className="text-sm text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl font-medium tracking-wide" >
                                                    {templateData ? `${templateData.width}×${templateData.height}` : ""
                                                    }
                                                </span>
                                            </div>

                                            {/* Search Input */}
                                            <div className="mb-6" >
                                                <div className="relative" >
                                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                                    <input
                                                        type="text"
                                                        placeholder="Search formats... (try: story, post, thumbnail)"
                                                        value={resizeSearchTerm}
                                                        onChange={(e) => setResizeSearchTerm(e.target.value)}
                                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200/60 rounded-2xl text-slate-900 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/60 transition-all duration-300 font-medium tracking-wide"
                                                    />
                                                </div>

                                                {
                                                    resizeSearchTerm === "" && (
                                                        <div className="flex flex-wrap gap-2 mt-3" >
                                                            {
                                                                ["story", "post", "thumbnail", "reel", "pin"].map((suggestion) => (
                                                                    <button
                                                                        key={suggestion}
                                                                        onClick={() => setResizeSearchTerm(suggestion)}
                                                                        className="px-3 py-1.5 text-xs bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 hover:text-slate-800 transition-all duration-200 font-medium tracking-wide"
                                                                    >
                                                                        {suggestion}
                                                                    </button>
                                                                ))
                                                            }
                                                        </div>
                                                    )}
                                            </div>

                                            < div className="space-y-6 max-h-96 overflow-y-auto" >
                                                {/* Group formats by category and filter by search term */}
                                                {
                                                    Object.entries(
                                                        Object.entries(SOCIAL_MEDIA_FORMATS)
                                                            .filter(
                                                                ([key, format]) =>
                                                                    resizeSearchTerm === "" ||
                                                                    format.name.toLowerCase().includes(resizeSearchTerm.toLowerCase()) ||
                                                                    format.category.toLowerCase().includes(resizeSearchTerm.toLowerCase()) ||
                                                                    key.toLowerCase().includes(resizeSearchTerm.toLowerCase()),
                                                            )
                                                            .reduce(
                                                                (
                                                                    groups: Record<
                                                                        string,
                                                                        Array<[string, { width: number; height: number; name: string; category: string }]>
                                                                    >,
                                                                    [key, format],
                                                                ) => {
                                                                    const category = format.category
                                                                    if (!groups[category]) groups[category] = []
                                                                    groups[category].push([key, format])
                                                                    return groups
                                                                },
                                                                {},
                                                            ),
                                                    ).map(([category, formats]) => (
                                                        <div key={category} className="space-y-3" >
                                                            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider" >
                                                                {category}({formats.length})
                                                            </h4>
                                                            < div className="space-y-2" >
                                                                {
                                                                    formats.map(([key, format]) => {
                                                                        const isCurrentSize =
                                                                            templateData &&
                                                                            templateData.width === format.width &&
                                                                            templateData.height === format.height

                                                                        return (
                                                                            <button
                                                                                key={key}
                                                                                onClick={() => handleResize(key)
                                                                                }
                                                                                className={`w-full text-left p-4 rounded-2xl transition-all duration-300 group ${isCurrentSize
                                                                                    ? "bg-indigo-50 border-2 border-indigo-200"
                                                                                    : "hover:bg-slate-50 border-2 border-transparent hover:border-slate-200"
                                                                                    }`}
                                                                            >
                                                                                <div className="flex justify-between items-start" >
                                                                                    <div className="flex-1 min-w-0" >
                                                                                        <span
                                                                                            className={`text-sm font-semibold block truncate tracking-tight ${isCurrentSize
                                                                                                ? "text-indigo-700"
                                                                                                : "text-slate-900 group-hover:text-indigo-600"
                                                                                                }`}
                                                                                        >
                                                                                            {format.name}
                                                                                        </span>
                                                                                        < span className="text-xs text-slate-500 block mt-1 font-medium tracking-wide" >
                                                                                            {format.width}×{format.height} px •{" "}
                                                                                            {(format.width / format.height).toFixed(2)} ratio
                                                                                        </span>
                                                                                    </div>
                                                                                    {
                                                                                        isCurrentSize && (
                                                                                            <span className="text-xs text-indigo-600 bg-indigo-100 px-3 py-1.5 rounded-xl ml-3 flex-shrink-0 font-semibold tracking-wide" >
                                                                                                Current
                                                                                            </span>
                                                                                        )
                                                                                    }
                                                                                </div>
                                                                            </button>
                                                                        )
                                                                    })}
                                                            </div>
                                                        </div>
                                                    ))}

                                                {/* Custom Size Option */}
                                                <div className="border-t border-slate-200 pt-6 mt-6" >
                                                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4" > Custom </h4>
                                                    < div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60" >
                                                        <div className="grid grid-cols-2 gap-4" >
                                                            <div>
                                                                <label className="block text-xs font-semibold text-slate-600 mb-2 tracking-wide" >
                                                                    Width
                                                                </label>
                                                                < input
                                                                    type="number"
                                                                    placeholder="1920"
                                                                    className="w-full px-3 py-2.5 bg-white border border-slate-200/60 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/60 transition-all duration-300 font-medium tracking-wide"
                                                                    id="custom-width"
                                                                />
                                                            </div>
                                                            < div >
                                                                <label className="block text-xs font-semibold text-slate-600 mb-2 tracking-wide" >
                                                                    Height
                                                                </label>
                                                                < input
                                                                    type="number"
                                                                    placeholder="1080"
                                                                    className="w-full px-3 py-2.5 bg-white border border-slate-200/60 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/60 transition-all duration-300 font-medium tracking-wide"
                                                                    id="custom-height"
                                                                />
                                                            </div>
                                                        </div>
                                                        < button
                                                            onClick={() => {
                                                                const width = Number.parseInt(
                                                                    (document.getElementById("custom-width") as HTMLInputElement)?.value || "1920",
                                                                )
                                                                const height = Number.parseInt(
                                                                    (document.getElementById("custom-height") as HTMLInputElement)?.value || "1080",
                                                                )
                                                                if (width > 0 && height > 0) {
                                                                    handleCustomResize(width, height)
                                                                }
                                                            }}
                                                            className="w-full mt-4 bg-indigo-500 text-white py-3 rounded-2xl hover:bg-indigo-600 transition-all duration-300 text-sm font-semibold tracking-wide shadow-lg shadow-indigo-500/25"
                                                        >
                                                            Apply Custom Size
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                        </div>

                        < button
                            onClick={handleExport}
                            className="bg-emerald-50 text-emerald-600 px-4 py-3 rounded-2xl hover:bg-emerald-100 flex items-center gap-3 transition-all duration-300 border border-emerald-200/60 font-semibold tracking-wide"
                        >
                            <Download className="w-4 h-4" />
                            <span>Export </span>
                        </button>
                    </div>

                    < button className="lg:hidden bg-slate-100 p-3 rounded-2xl hover:bg-slate-200 transition-all duration-300" >
                        <MoreHorizontal className="w-5 h-5 text-slate-600" />
                    </button>
                </div>
            </div>
        </div>
    </header >
}

export default EditorHeader;