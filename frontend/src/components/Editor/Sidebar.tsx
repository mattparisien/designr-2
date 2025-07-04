import { Palette, Settings, Type, Layers } from "lucide-react";

interface EditorSidebarProps {
    toggleSidebarSection: (section: string) => void,
    selectedFabricObject: fabric.Object | null,
    activeSidebarSection: string | null,
    setActiveSidebarSection: (section: string | null) => void,
    
}

const EditorSidebar = (props: EditorSidebarProps) => {

    const {
        toggleSidebarSection,
        selectedFabricObject: selectedFabricObject,
        activeSidebarSection,
        setActiveSidebarSection,

    } = props;

    return (
        <>
            {/* Icon Sidebar */}
            <div className="w-20 bg-white border-r border-slate-200/60 flex flex-col items-center py-6 sidebar-icon">
                <div className="flex flex-col gap-4">
                    {/* Brand Icon */}
                    <button
                        onClick={() => toggleSidebarSection('brand')}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${activeSidebarSection === 'brand'
                            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                            }`}
                        title="Brand Identity"
                    >
                        <Palette className="w-6 h-6" />
                    </button>

                    {/* Content Icon */}
                    <button
                        onClick={() => toggleSidebarSection('content')}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${activeSidebarSection === 'content'
                            ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                            }`}
                        title="Content & AI"
                    >
                        <Type className="w-6 h-6" />
                    </button>

                    {/* Canvas Icon */}
                    <button
                        onClick={() => toggleSidebarSection('canvas')}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${activeSidebarSection === 'canvas'
                            ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                            }`}
                        title="Canvas Settings"
                    >
                        <Settings className="w-6 h-6" />
                    </button>

                    {/* Elements Icon */}
                    <button
                        onClick={() => toggleSidebarSection('elements')}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${activeSidebarSection === 'elements'
                            ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                            }`}
                        title="Add Elements"
                    >
                        <Layers className="w-6 h-6" />
                    </button>

                    {/* Element Properties Icon - only show when object is selected */}
                    {selectedFabricObject && (
                        <button
                            onClick={() => toggleSidebarSection('element')}
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${activeSidebarSection === 'element'
                                ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                                }`}
                            title="Element Properties"
                        >
                            <Settings className="w-6 h-6" />
                        </button>
                    )}
                </div>
            </div>

            {/* Expandable Sidebar Content */}
            {sidebarOpen && (
                <div className="w-96 bg-white border-r border-slate-200/60 overflow-y-auto sidebar-content transition-all duration-300 ease-in-out">
                    <div className="p-8 space-y-8">
                        {/* Close Button */}
                        <div className="flex justify-end">
                            <button
                                onClick={() => {
                                    setSidebarOpen(false)
                                    setActiveSidebarSection(null)
                                }}
                                className="p-2 hover:bg-slate-100 rounded-2xl transition-all duration-300 text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {/* Brand Section */}
                        {activeSidebarSection === 'brand' && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                                        <Palette className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Brand Identity</h3>
                                        <p className="text-sm text-slate-500 font-medium tracking-wide">Select & Apply Brand</p>
                                    </div>
                                </div>

                                {/* Current Brand Display */}
                                {brandData && (
                                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/60">
                                        <div className="flex items-center justify-between mb-4">
                                            <label className="block text-sm font-semibold text-slate-700 tracking-wide">Current Brand</label>
                                            <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-xl font-semibold tracking-wide">
                                                {brandData.name}
                                            </span>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="group cursor-pointer">
                                                <div
                                                    className="w-16 h-16 rounded-2xl border-2 border-slate-200 group-hover:border-slate-300 transition-all duration-300 shadow-sm hover:shadow-md"
                                                    style={{ backgroundColor: brandData.primaryColor }}
                                                ></div>
                                                <p className="text-xs text-center mt-2 text-slate-500 font-medium tracking-wide">Primary</p>
                                            </div>
                                            <div className="group cursor-pointer">
                                                <div
                                                    className="w-16 h-16 rounded-2xl border-2 border-slate-200 group-hover:border-slate-300 transition-all duration-300 shadow-sm hover:shadow-md"
                                                    style={{ backgroundColor: brandData.secondaryColor }}
                                                ></div>
                                                <p className="text-xs text-center mt-2 text-slate-500 font-medium tracking-wide">Secondary</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Available Brands */}
                                {brands.length > 0 && (
                                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/60">
                                        <label className="block text-sm font-semibold text-slate-700 mb-4 tracking-wide">
                                            Available Brands ({brands.length})
                                        </label>
                                        <div className="space-y-3 max-h-48 overflow-y-auto">
                                            {brands.map((brand) => (
                                                <div
                                                    key={brand._id}
                                                    className={`p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${selectedBrand?._id === brand._id
                                                        ? "border-indigo-300 bg-indigo-50"
                                                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex gap-2">
                                                                <div
                                                                    className="w-6 h-6 rounded-lg border border-slate-200 shadow-sm"
                                                                    style={{ backgroundColor: brand.primaryColor }}
                                                                ></div>
                                                                <div
                                                                    className="w-6 h-6 rounded-lg border border-slate-200 shadow-sm"
                                                                    style={{ backgroundColor: brand.secondaryColor }}
                                                                ></div>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-sm font-semibold text-slate-900 tracking-tight">{brand.name}</h4>
                                                                <p className="text-xs text-slate-500 font-medium tracking-wide capitalize">{brand.vibe}</p>
                                                            </div>
                                                        </div>
                                                        {selectedBrand?._id === brand._id && (
                                                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg font-semibold tracking-wide">
                                                                Active
                                                            </span>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => applyBrand(brand)}
                                                        className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 ${selectedBrand?._id === brand._id
                                                            ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                                                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                                            }`}
                                                    >
                                                        {selectedBrand?._id === brand._id ? "Applied" : "Apply Brand"}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => router.push("/brands")}
                                            className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-2xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 tracking-wide flex items-center justify-center gap-2"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Create New Brand
                                        </button>
                                    </div>
                                )}

                                {/* No brands message */}
                                {brands.length === 0 && (
                                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/60 text-center">
                                        <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <Palette className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <h4 className="text-sm font-semibold text-slate-700 mb-2 tracking-tight">No Brands Found</h4>
                                        <p className="text-xs text-slate-500 mb-4 font-medium tracking-wide">
                                            Create your first brand to get started
                                        </p>
                                        <button
                                            onClick={() => router.push("/brands")}
                                            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-2xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 tracking-wide flex items-center justify-center gap-2"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Create Your First Brand
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Content Section */}
                        {activeSidebarSection === 'content' && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                                        <Type className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Content</h3>
                                        <p className="text-sm text-slate-500 font-medium tracking-wide">AI Generated Copy</p>
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/60 space-y-4">
                                    <div>
                                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Headline</span>
                                        <p className="text-slate-900 font-semibold text-sm mt-2 leading-relaxed tracking-tight">
                                            {aiContent.headline}
                                        </p>
                                    </div>
                                    <div className="h-px bg-slate-200"></div>
                                    <div>
                                        <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Body Text</span>
                                        <p className="text-slate-600 text-sm mt-2 leading-relaxed font-medium tracking-wide">
                                            {aiContent.bodyText}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowMagicFill(true)}
                                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-2xl font-semibold hover:from-indigo-600 hover:to-purple-700 flex items-center justify-center gap-3 transition-all duration-300 shadow-lg shadow-indigo-500/25 tracking-wide"
                                >
                                    <Wand2 className="w-4 h-4" />
                                    Regenerate Content
                                </button>
                            </div>
                        )}

                        {/* Canvas Section */}
                        {activeSidebarSection === 'canvas' && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                                        <Settings className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Canvas</h3>
                                        <p className="text-sm text-slate-500 font-medium tracking-wide">Background & Style</p>
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/60">
                                    <label className="block text-sm font-semibold text-slate-700 mb-4 tracking-wide">
                                        Background Color
                                    </label>
                                    <div className="grid grid-cols-5 gap-3">
                                        <button
                                            onClick={() => fabricEditorRef.current?.addBackground("#ffffff")}
                                            className="w-12 h-12 rounded-2xl border-2 border-slate-200 bg-white hover:border-slate-300 transition-all duration-300 shadow-sm hover:shadow-md"
                                            title="White"
                                        />
                                        <button
                                            onClick={() => fabricEditorRef.current?.addBackground("#f8fafc")}
                                            className="w-12 h-12 rounded-2xl border-2 border-slate-200 bg-slate-50 hover:border-slate-300 transition-all duration-300 shadow-sm hover:shadow-md"
                                            title="Light Gray"
                                        />
                                        <button
                                            onClick={() => fabricEditorRef.current?.addBackground("#e2e8f0")}
                                            className="w-12 h-12 rounded-2xl border-2 border-slate-200 bg-slate-200 hover:border-slate-300 transition-all duration-300 shadow-sm hover:shadow-md"
                                            title="Gray"
                                        />
                                        <button
                                            onClick={() => fabricEditorRef.current?.addBackground("#000000")}
                                            className="w-12 h-12 rounded-2xl border-2 border-slate-200 bg-black hover:border-slate-300 transition-all duration-300 shadow-sm hover:shadow-md"
                                            title="Black"
                                        />
                                        <button
                                            onClick={() => fabricEditorRef.current?.addBackground(brandData?.primaryColor || "#3B82F6")}
                                            className="w-12 h-12 rounded-2xl border-2 border-slate-200 hover:border-slate-300 transition-all duration-300 shadow-sm hover:shadow-md"
                                            style={{ backgroundColor: brandData?.primaryColor || "#3B82F6" }}
                                            title="Brand Color"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Elements Section */}
                        {activeSidebarSection === 'elements' && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                                        <Layers className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Elements</h3>
                                        <p className="text-sm text-slate-500 font-medium tracking-wide">Add Text, Shapes & More</p>
                                    </div>
                                </div>

                                {/* Text Elements */}
                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/60">
                                    <label className="block text-sm font-semibold text-slate-700 mb-4 tracking-wide">
                                        Text Elements
                                    </label>
                                    <div className="grid grid-cols-1 gap-3">
                                        <button
                                            onClick={() => {
                                                if (fabricEditorRef.current) {
                                                    fabricEditorRef.current.addText('Add your text here', {
                                                        fontSize: 24,
                                                        fill: brandData?.primaryColor || '#000000',
                                                        fontFamily: 'Arial',
                                                    })
                                                }
                                            }}
                                            className="flex items-center gap-3 p-4 bg-white border border-slate-200/60 rounded-2xl hover:bg-slate-50 hover:border-slate-300/60 transition-all duration-300 text-left"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                                <Type className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <span className="text-sm font-semibold text-slate-900 tracking-tight">Add Text</span>
                                                <p className="text-xs text-slate-500 font-medium tracking-wide">Click to add editable text</p>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => {
                                                if (fabricEditorRef.current) {
                                                    fabricEditorRef.current.addText('Heading Text', {
                                                        fontSize: 48,
                                                        fontWeight: 'bold',
                                                        fill: brandData?.primaryColor || '#000000',
                                                        fontFamily: 'Arial',
                                                    })
                                                }
                                            }}
                                            className="flex items-center gap-3 p-4 bg-white border border-slate-200/60 rounded-2xl hover:bg-slate-50 hover:border-slate-300/60 transition-all duration-300 text-left"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                                                <Type className="w-5 h-5 text-indigo-600" />
                                            </div>
                                            <div>
                                                <span className="text-sm font-semibold text-slate-900 tracking-tight">Add Heading</span>
                                                <p className="text-xs text-slate-500 font-medium tracking-wide">Large heading text</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* Shape Elements */}
                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/60">
                                    <label className="block text-sm font-semibold text-slate-700 mb-4 tracking-wide">
                                        Shapes
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => {
                                                if (fabricEditorRef.current?.canvas) {
                                                    const rect = new fabric.Rect({
                                                        left: 100,
                                                        top: 100,
                                                        width: 200,
                                                        height: 100,
                                                        fill: brandData?.primaryColor || '#3B82F6',
                                                        cornerColor: '#3B82F6',
                                                        cornerStyle: 'rect',
                                                        transparentCorners: false,
                                                    })
                                                    fabricEditorRef.current.canvas.add(rect)
                                                    fabricEditorRef.current.canvas.setActiveObject(rect)
                                                    fabricEditorRef.current.canvas.renderAll()
                                                }
                                            }}
                                            className="flex flex-col items-center gap-3 p-4 bg-white border border-slate-200/60 rounded-2xl hover:bg-slate-50 hover:border-slate-300/60 transition-all duration-300"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                                                <Square className="w-5 h-5 text-green-600" />
                                            </div>
                                            <span className="text-xs font-semibold text-slate-900 tracking-tight">Rectangle</span>
                                        </button>

                                        <button
                                            onClick={() => {
                                                if (fabricEditorRef.current?.canvas) {
                                                    const circle = new fabric.Circle({
                                                        left: 100,
                                                        top: 100,
                                                        radius: 50,
                                                        fill: brandData?.secondaryColor || '#6B7280',
                                                        cornerColor: '#6B7280',
                                                        cornerStyle: 'rect',
                                                        transparentCorners: false,
                                                    })
                                                    fabricEditorRef.current.canvas.add(circle)
                                                    fabricEditorRef.current.canvas.setActiveObject(circle)
                                                    fabricEditorRef.current.canvas.renderAll()
                                                }
                                            }}
                                            className="flex flex-col items-center gap-3 p-4 bg-white border border-slate-200/60 rounded-2xl hover:bg-slate-50 hover:border-slate-300/60 transition-all duration-300"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                                                <Circle className="w-5 h-5 text-yellow-600" />
                                            </div>
                                            <span className="text-xs font-semibold text-slate-900 tracking-tight">Circle</span>
                                        </button>

                                        <button
                                            onClick={() => {
                                                if (fabricEditorRef.current?.canvas) {
                                                    const triangle = new fabric.Triangle({
                                                        left: 100,
                                                        top: 100,
                                                        width: 100,
                                                        height: 100,
                                                        fill: brandData?.primaryColor || '#3B82F6',
                                                        cornerColor: '#3B82F6',
                                                        cornerStyle: 'rect',
                                                        transparentCorners: false,
                                                    })
                                                    fabricEditorRef.current.canvas.add(triangle)
                                                    fabricEditorRef.current.canvas.setActiveObject(triangle)
                                                    fabricEditorRef.current.canvas.renderAll()
                                                }
                                            }}
                                            className="flex flex-col items-center gap-3 p-4 bg-white border border-slate-200/60 rounded-2xl hover:bg-slate-50 hover:border-slate-300/60 transition-all duration-300"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                                                <Triangle className="w-5 h-5 text-red-600" />
                                            </div>
                                            <span className="text-xs font-semibold text-slate-900 tracking-tight">Triangle</span>
                                        </button>

                                        <button
                                            onClick={() => {
                                                if (fabricEditorRef.current?.canvas) {
                                                    const line = new fabric.Line([0, 0, 200, 0], {
                                                        left: 100,
                                                        top: 100,
                                                        stroke: brandData?.primaryColor || '#3B82F6',
                                                        strokeWidth: 3,
                                                        cornerColor: '#3B82F6',
                                                        cornerStyle: 'rect',
                                                        transparentCorners: false,
                                                    })
                                                    fabricEditorRef.current.canvas.add(line)
                                                    fabricEditorRef.current.canvas.setActiveObject(line)
                                                    fabricEditorRef.current.canvas.renderAll()
                                                }
                                            }}
                                            className="flex flex-col items-center gap-3 p-4 bg-white border border-slate-200/60 rounded-2xl hover:bg-slate-50 hover:border-slate-300/60 transition-all duration-300"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                                <div className="w-5 h-0.5 bg-purple-600 rounded"></div>
                                            </div>
                                            <span className="text-xs font-semibold text-slate-900 tracking-tight">Line</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Image Upload */}
                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/60">
                                    <label className="block text-sm font-semibold text-slate-700 mb-4 tracking-wide">
                                        Images
                                    </label>
                                    <div className="space-y-3">
                                        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-slate-400 transition-all duration-300 bg-white">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0]
                                                    if (file && fabricEditorRef.current?.canvas) {
                                                        const reader = new FileReader()
                                                        reader.onload = async (event) => {
                                                            const imgSrc = event.target?.result as string
                                                            if (imgSrc) {
                                                                try {
                                                                    const img = await fabric.Image.fromURL(imgSrc)
                                                                    img.set({
                                                                        left: 100,
                                                                        top: 100,
                                                                        scaleX: 0.5,
                                                                        scaleY: 0.5,
                                                                    })
                                                                    fabricEditorRef.current?.canvas?.add(img)
                                                                    fabricEditorRef.current?.canvas?.setActiveObject(img)
                                                                    fabricEditorRef.current?.canvas?.renderAll()
                                                                } catch (error) {
                                                                    console.error('Error adding image:', error)
                                                                }
                                                            }
                                                        }
                                                        reader.readAsDataURL(file)
                                                    }
                                                }}
                                                className="hidden"
                                                id="image-upload"
                                            />
                                            <label
                                                htmlFor="image-upload"
                                                className="cursor-pointer transition-colors duration-300 text-slate-600 hover:text-slate-800"
                                            >
                                                <div className="space-y-3">
                                                    <div className="w-12 h-12 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center">
                                                        <ImagePlus className="w-6 h-6 text-slate-400" />
                                                    </div>
                                                    <div className="text-sm font-semibold tracking-wide">Upload Image</div>
                                                    <div className="text-xs text-slate-500 font-medium tracking-wide">
                                                        Click to add image to canvas
                                                    </div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/60">
                                    <label className="block text-sm font-semibold text-slate-700 mb-4 tracking-wide">
                                        Quick Actions
                                    </label>
                                    <div className="space-y-2">
                                        <button
                                            onClick={async () => {
                                                if (fabricEditorRef.current?.canvas) {
                                                    const activeObject = fabricEditorRef.current.canvas.getActiveObject()
                                                    if (activeObject) {
                                                        const cloned = await activeObject.clone()
                                                        cloned.set({
                                                            left: (activeObject.left || 0) + 10,
                                                            top: (activeObject.top || 0) + 10,
                                                        })
                                                        fabricEditorRef.current.canvas.add(cloned)
                                                        fabricEditorRef.current.canvas.setActiveObject(cloned)
                                                        fabricEditorRef.current.canvas.renderAll()
                                                    }
                                                }
                                            }}
                                            className="w-full flex items-center gap-3 p-3 bg-white border border-slate-200/60 rounded-xl hover:bg-slate-50 hover:border-slate-300/60 transition-all duration-300 text-left"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                                <Plus className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <span className="text-sm font-semibold text-slate-900 tracking-tight">Duplicate Selected</span>
                                        </button>

                                        <button
                                            onClick={() => {
                                                if (fabricEditorRef.current) {
                                                    fabricEditorRef.current.deleteSelected()
                                                }
                                            }}
                                            className="w-full flex items-center gap-3 p-3 bg-white border border-slate-200/60 rounded-xl hover:bg-slate-50 hover:border-slate-300/60 transition-all duration-300 text-left"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                                                <X className="w-4 h-4 text-red-600" />
                                            </div>
                                            <span className="text-sm font-semibold text-slate-900 tracking-tight">Delete Selected</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Element Properties Section */}
                        {activeSidebarSection === 'element' && selectedFabricObject && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
                                        <Settings className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Element Properties</h3>
                                        <p className="text-sm text-slate-500 font-medium tracking-wide capitalize">
                                            {selectedFabricObject.type === "textbox" ? "Text Element" : "Selected Element"}
                                        </p>
                                    </div>
                                </div>

                                {selectedFabricObject.type === "textbox" && (
                                    <div className="space-y-6">
                                        {/* Content Input */}
                                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/60">
                                            <label className="block text-sm font-semibold text-slate-700 mb-3 tracking-wide">
                                                Text Content
                                            </label>
                                            <textarea
                                                value={(selectedFabricObject as fabric.Textbox).text || ""}
                                                onChange={(e) => {
                                                    if (fabricEditorRef.current) {
                                                        fabricEditorRef.current.updateSelectedObject({ text: e.target.value })
                                                    }
                                                }}
                                                className="w-full px-4 py-4 bg-white border border-slate-200/60 rounded-2xl text-slate-900 text-sm resize-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/60 transition-all duration-300 font-medium tracking-wide"
                                                rows={3}
                                                placeholder="Enter your text here..."
                                            />
                                        </div>

                                        {/* Typography Controls */}
                                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/60 space-y-4">
                                            <label className="block text-sm font-semibold text-slate-700 tracking-wide">Typography</label>

                                            <div>
                                                <label className="block text-xs font-semibold text-slate-600 mb-2 tracking-wide">
                                                    Font Size
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        step="1"
                                                        value={Math.round((selectedFabricObject as fabric.Textbox).fontSize || 16)}
                                                        onChange={(e) => {
                                                            const newFontSize = Number.parseInt(e.target.value) || 16
                                                            if (fabricEditorRef.current) {
                                                                fabricEditorRef.current.updateSelectedObject({ fontSize: newFontSize })
                                                                const activeObj = fabricEditorRef.current.canvas?.getActiveObject()
                                                                if (activeObj) {
                                                                    setSelectedFabricObject(null)
                                                                    setTimeout(() => setSelectedFabricObject(activeObj), 0)
                                                                }
                                                            }
                                                        }}
                                                        className="w-full px-4 py-3 pr-12 bg-white border border-slate-200/60 rounded-2xl text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/60 transition-all duration-300 font-medium tracking-wide"
                                                        min="8"
                                                        max="200"
                                                    />
                                                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-slate-500 font-medium">
                                                        px
                                                    </span>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-slate-600 mb-2 tracking-wide">
                                                    Font Family
                                                </label>
                                                <div className="space-y-3">
                                                    <select
                                                        value={(selectedFabricObject as fabric.Textbox).fontFamily || "Arial"}
                                                        onChange={async (e) => {
                                                            const selectedFont = e.target.value

                                                            if (fabricEditorRef.current) {
                                                                // Check if this is a custom font from backend
                                                                const customFont = backendFonts.find(font => font.fontFamily === selectedFont)

                                                                if (customFont) {
                                                                    // Load the custom font first
                                                                    const fontUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}${customFont.fileUrl}`
                                                                    try {
                                                                        await fabricEditorRef.current.loadFont(customFont.fontFamily, fontUrl)
                                                                        console.log(`Loaded custom font: ${customFont.fontFamily}`)
                                                                    } catch (error) {
                                                                        console.error(`Failed to load custom font ${customFont.fontFamily}:`, error)
                                                                    }
                                                                }

                                                                // Apply the font to the selected object
                                                                fabricEditorRef.current.updateSelectedObject({ fontFamily: selectedFont })

                                                                // Update the selected object to trigger re-render
                                                                const activeObj = fabricEditorRef.current.canvas?.getActiveObject()
                                                                if (activeObj) {
                                                                    setSelectedFabricObject(null)
                                                                    setTimeout(() => setSelectedFabricObject(activeObj), 0)
                                                                }
                                                            }
                                                        }}
                                                        className="w-full px-4 py-3 bg-white border border-slate-200/60 rounded-2xl text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/60 transition-all duration-300 font-medium tracking-wide"
                                                    >
                                                        {uploadedFonts.map((font) => (
                                                            <option key={font} value={font} style={{ fontFamily: font }}>
                                                                {font}
                                                            </option>
                                                        ))}
                                                    </select>

                                                    {/* Quick Upload Font Button */}
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="file"
                                                            accept=".woff,.woff2,.ttf,.otf"
                                                            onChange={handleFontUpload}
                                                            className="hidden"
                                                            id="quick-font-upload"
                                                            disabled={isUploadingFont}
                                                        />
                                                        <label
                                                            htmlFor="quick-font-upload"
                                                            className={`flex-1 px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-300 cursor-pointer text-center ${isUploadingFont
                                                                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                                                : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200"
                                                                }`}
                                                        >
                                                            {isUploadingFont ? (
                                                                <span className="flex items-center justify-center gap-2">
                                                                    <RotateCcw className="w-3 h-3 animate-spin" />
                                                                    Uploading...
                                                                </span>
                                                            ) : (
                                                                <span className="flex items-center justify-center gap-2">
                                                                    <Upload className="w-3 h-3" />
                                                                    Upload Font
                                                                </span>
                                                            )}
                                                        </label>
                                                        <button
                                                            onClick={() => setShowFontPanel(true)}
                                                            className="px-3 py-2 text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl transition-all duration-300"
                                                        >
                                                            Manage
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Color Controls */}
                                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/60">
                                            <label className="block text-sm font-semibold text-slate-700 mb-4 tracking-wide">
                                                Text Color
                                            </label>
                                            <div className="flex gap-4 items-center">
                                                <div className="relative">
                                                    <input
                                                        type="color"
                                                        value={((selectedFabricObject as fabric.Textbox).fill as string) || "#000000"}
                                                        onChange={(e) => {
                                                            if (fabricEditorRef.current) {
                                                                fabricEditorRef.current.updateSelectedObject({ fill: e.target.value })
                                                                const activeObj = fabricEditorRef.current.canvas?.getActiveObject()
                                                                if (activeObj) {
                                                                    setSelectedFabricObject(null)
                                                                    setTimeout(() => setSelectedFabricObject(activeObj), 0)
                                                                }
                                                            }
                                                        }}
                                                        className="w-16 h-16 rounded-2xl border-2 border-slate-200 cursor-pointer hover:border-slate-300 transition-all duration-300"
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            if (fabricEditorRef.current) {
                                                                fabricEditorRef.current.updateSelectedObject({ fill: "#000000" })
                                                                const activeObj = fabricEditorRef.current.canvas?.getActiveObject()
                                                                if (activeObj) {
                                                                    setSelectedFabricObject(null)
                                                                    setTimeout(() => setSelectedFabricObject(activeObj), 0)
                                                                }
                                                            }
                                                        }}
                                                        className="w-10 h-10 rounded-2xl border-2 border-slate-200 bg-black hover:border-slate-300 transition-all duration-300 shadow-sm"
                                                        title="Black"
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            if (fabricEditorRef.current) {
                                                                fabricEditorRef.current.updateSelectedObject({ fill: "#ffffff" })
                                                                const activeObj = fabricEditorRef.current.canvas?.getActiveObject()
                                                                if (activeObj) {
                                                                    setSelectedFabricObject(null)
                                                                    setTimeout(() => setSelectedFabricObject(activeObj), 0)
                                                                }
                                                            }
                                                        }}
                                                        className="w-10 h-10 rounded-2xl border-2 border-slate-200 bg-white hover:border-slate-300 transition-all duration-300 shadow-sm"
                                                        title="White"
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            if (fabricEditorRef.current && brandData?.primaryColor) {
                                                                fabricEditorRef.current.updateSelectedObject({ fill: brandData.primaryColor })
                                                                const activeObj = fabricEditorRef.current.canvas?.getActiveObject()
                                                                if (activeObj) {
                                                                    setSelectedFabricObject(null)
                                                                    setTimeout(() => setSelectedFabricObject(activeObj), 0)
                                                                }
                                                            }
                                                        }}
                                                        className="w-10 h-10 rounded-2xl border-2 border-slate-200 hover:border-slate-300 transition-all duration-300 shadow-sm"
                                                        style={{ backgroundColor: brandData?.primaryColor || "#3B82F6" }}
                                                        title="Brand Primary"
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            if (fabricEditorRef.current && brandData?.secondaryColor) {
                                                                fabricEditorRef.current.updateSelectedObject({ fill: brandData.secondaryColor })
                                                                const activeObj = fabricEditorRef.current.canvas?.getActiveObject()
                                                                if (activeObj) {
                                                                    setSelectedFabricObject(null)
                                                                    setTimeout(() => setSelectedFabricObject(activeObj), 0)
                                                                }
                                                            }
                                                        }}
                                                        className="w-10 h-10 rounded-2xl border-2 border-slate-200 hover:border-slate-300 transition-all duration-300 shadow-sm"
                                                        style={{ backgroundColor: brandData?.secondaryColor || "#6B7280" }}
                                                        title="Brand Secondary"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}

export default EditorSidebar;