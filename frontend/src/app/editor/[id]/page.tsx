"use client"

import type React from "react"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  ArrowLeft,
  Wand2,
  RotateCcw,
  Download,
  Maximize,
  Sparkles,
  Type,
  Palette,
  Settings,
  Eye,
  ZoomIn,
  ZoomOut,
  MoreHorizontal,
  Upload,
  X,
  Search,
} from "lucide-react"
import { ApiClient } from "../../../lib/api"
import FabricEditor, { type FabricEditorRef } from "../../../components/FabricEditor"
import type * as fabric from "fabric"

interface BrandData {
  name: string
  primaryColor: string
  secondaryColor: string
  vibe: string
  voice?: string
  personality?: string
  targetAudience?: string
  toneGuidelines?: string
  keyValues?: string
  communicationStyle?: string
}

interface ElementStyle {
  fontSize?: string
  fontWeight?: string
  fontFamily?: string
  color?: string
  backgroundColor?: string
}

interface TemplateData {
  id: number
  name: string
  width: number
  height: number
  elements: {
    type: "text" | "image" | "shape"
    content: string
    x: number
    y: number
    width: number
    height: number
    style?: ElementStyle
  }[]
}

export default function EditorPage() {
  const router = useRouter()
  const params = useParams()
  const templateId = params.id as string
  const apiClient = useMemo(() => new ApiClient(), [])
  const [brandData, setBrandData] = useState<BrandData | null>(null)
  const [templateData, setTemplateData] = useState<TemplateData | null>(null)
  const [aiContent, setAiContent] = useState({
    headline: "Your Amazing Headline",
    bodyText: "Compelling copy that converts your audience",
  })
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("")
  const [showMagicFill, setShowMagicFill] = useState(false)
  const [selectedFabricObject, setSelectedFabricObject] = useState<fabric.Object | null>(null)
  const [uploadedFonts, setUploadedFonts] = useState<string[]>([
    "Arial",
    "Helvetica",
    "Times New Roman",
    "Georgia",
    "Verdana",
  ])
  const [showFontPanel, setShowFontPanel] = useState(false)
  const [resizeSearchTerm, setResizeSearchTerm] = useState("")

  const fabricEditorRef = useRef<FabricEditorRef>(null)

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("authToken")
    if (!token) {
      router.push("/auth/login")
      return
    }

    // Set token in API client
    apiClient.setToken(token)

    // Load brand data
    const storedBrandData = localStorage.getItem("brandData")
    let loadedBrandData = null
    if (storedBrandData) {
      loadedBrandData = JSON.parse(storedBrandData)
      setBrandData(loadedBrandData)
    }

    // Mock template data - in a real app, this would come from your API
    setTemplateData({
      id: Number.parseInt(templateId),
      name: `Template ${templateId}`,
      width: 1080,
      height: 1080,
      elements: [
        {
          type: "text",
          content: "Your Amazing Headline",
          x: 40,
          y: 200,
          width: 1000,
          height: 100,
          style: {
            fontSize: "48px",
            fontWeight: "bold",
            color: loadedBrandData?.primaryColor || "#000000",
          },
        },
        {
          type: "text",
          content: "Compelling copy that converts your audience",
          x: 40,
          y: 320,
          width: 1000,
          height: 80,
          style: {
            fontSize: "24px",
            color: loadedBrandData?.secondaryColor || "#666666",
          },
        },
        {
          type: "text",
          content: "Get Started",
          x: 440,
          y: 850,
          width: 200,
          height: 60,
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#ffffff",
            backgroundColor: loadedBrandData?.primaryColor || "#3B82F6",
          },
        },
      ],
    })
  }, [templateId, router, apiClient])

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return

    setIsGeneratingAI(true)
    try {
      // Get current template content to provide context
      const currentContent = templateData ? fabricEditorRef.current?.exportTemplate() || templateData.elements : []

      // Call the enhanced AI API with current content context and comprehensive brand information
      const response = await apiClient.magicFill({
        prompt: aiPrompt,
        vibe: brandData?.vibe || "professional",
        brandContext: {
          name: brandData?.name || "Generic brand",
          voice: brandData?.voice || "Professional and engaging",
          personality: brandData?.personality || "Friendly and approachable",
          targetAudience: brandData?.targetAudience || "General audience",
          toneGuidelines: brandData?.toneGuidelines || "Use clear, concise language that resonates with the audience",
          keyValues: brandData?.keyValues || "Quality, innovation, customer satisfaction",
          communicationStyle: brandData?.communicationStyle || "Direct and informative",
        },
        currentContent: currentContent,
      })

      if (response.success && response.content) {
        setAiContent(response.content)

        // Update template with AI content and enhanced brand styling
        if (templateData && fabricEditorRef.current) {
          const updatedElements = templateData.elements.map((element, index) => {
            if (element.type === "text") {
              let newElement = { ...element }
              if (index === 0) {
                newElement = {
                  ...element,
                  content: response.content.headline,
                  style: {
                    ...element.style,
                    color: brandData?.primaryColor || element.style?.color,
                    fontWeight: "bold",
                  },
                }
              } else if (index === 1) {
                newElement = {
                  ...element,
                  content: response.content.bodyText,
                  style: {
                    ...element.style,
                    color: brandData?.secondaryColor || element.style?.color,
                  },
                }
              }
              return newElement
            }
            return element
          })

          setTemplateData({ ...templateData, elements: updatedElements })
          fabricEditorRef.current.loadTemplate(updatedElements)
        }
      } else {
        // Fallback to mock response if API fails
        const mockResponse = {
          headline: "Revolutionary Solution Awaits",
          bodyText: "Transform your business with our innovative approach",
        }
        setAiContent(mockResponse)
      }

      setShowMagicFill(false)
    } catch (error) {
      console.error("AI generation error:", error)
      setShowMagicFill(false)
    } finally {
      setIsGeneratingAI(false)
    }
  }

  // Font management functions
  const handleFontUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const validTypes = [".woff", ".woff2", ".ttf", ".otf"]
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()

    if (!validTypes.includes(fileExtension)) {
      alert("Please upload a valid font file (.woff, .woff2, .ttf, .otf)")
      return
    }

    try {
      const fontUrl = URL.createObjectURL(file)
      const fontName = file.name.split(".")[0]

      if (fabricEditorRef.current) {
        const success = await fabricEditorRef.current.loadFont(fontName, fontUrl)
        if (success) {
          setUploadedFonts((prev) => [...prev, fontName])
          alert(`Font "${fontName}" uploaded successfully!`)
        } else {
          alert("Failed to load font. Please try again.")
        }
      }
    } catch (error) {
      console.error("Font upload error:", error)
      alert("Failed to upload font. Please try again.")
    }
  }

  // Fabric.js event handlers
  const handleFabricObjectSelected = useCallback((obj: fabric.Object | null) => {
    setSelectedFabricObject(obj)
  }, [])

  const handleFabricObjectModified = useCallback(() => {
    if (!templateData || !fabricEditorRef.current) return

    const updatedElements = fabricEditorRef.current.exportTemplate()
    setTemplateData({ ...templateData, elements: updatedElements })
  }, [templateData])

  // Enhanced social media format presets organized by categories
  const socialMediaFormats = {
    // Instagram
    "instagram-square": { width: 1080, height: 1080, name: "Instagram Square Post", category: "Instagram" },
    "instagram-portrait": { width: 1080, height: 1350, name: "Instagram Portrait Post", category: "Instagram" },
    "instagram-landscape": { width: 1080, height: 566, name: "Instagram Landscape Post", category: "Instagram" },
    "instagram-story": { width: 1080, height: 1920, name: "Instagram Story", category: "Instagram" },
    "instagram-reel": { width: 1080, height: 1920, name: "Instagram Reel", category: "Instagram" },
    "instagram-igtv-cover": { width: 420, height: 654, name: "Instagram IGTV Cover", category: "Instagram" },
    "instagram-highlight-cover": { width: 161, height: 161, name: "Instagram Highlight Cover", category: "Instagram" },

    // TikTok
    "tiktok-video": { width: 1080, height: 1920, name: "TikTok Video", category: "TikTok" },
    "tiktok-profile": { width: 200, height: 200, name: "TikTok Profile Picture", category: "TikTok" },

    // YouTube
    "youtube-thumbnail": { width: 1280, height: 720, name: "YouTube Thumbnail", category: "YouTube" },
    "youtube-shorts": { width: 1080, height: 1920, name: "YouTube Shorts", category: "YouTube" },
    "youtube-channel-art": { width: 2560, height: 1440, name: "YouTube Channel Art", category: "YouTube" },
    "youtube-profile": { width: 800, height: 800, name: "YouTube Profile Picture", category: "YouTube" },
    "youtube-end-screen": { width: 1280, height: 720, name: "YouTube End Screen", category: "YouTube" },

    // Facebook
    "facebook-post": { width: 1200, height: 630, name: "Facebook Post", category: "Facebook" },
    "facebook-story": { width: 1080, height: 1920, name: "Facebook Story", category: "Facebook" },
    "facebook-cover": { width: 1200, height: 315, name: "Facebook Cover Photo", category: "Facebook" },
    "facebook-profile": { width: 170, height: 170, name: "Facebook Profile Picture", category: "Facebook" },
    "facebook-event-cover": { width: 1920, height: 1080, name: "Facebook Event Cover", category: "Facebook" },
    "facebook-ad": { width: 1200, height: 628, name: "Facebook Ad", category: "Facebook" },

    // Twitter / X
    "twitter-post": { width: 1200, height: 675, name: "Twitter/X Post", category: "Twitter" },
    "twitter-header": { width: 1500, height: 500, name: "Twitter/X Header", category: "Twitter" },
    "twitter-profile": { width: 400, height: 400, name: "Twitter/X Profile Picture", category: "Twitter" },
    "twitter-card": { width: 1200, height: 628, name: "Twitter/X Card", category: "Twitter" },

    // LinkedIn
    "linkedin-post": { width: 1200, height: 627, name: "LinkedIn Post", category: "LinkedIn" },
    "linkedin-story": { width: 1080, height: 1920, name: "LinkedIn Story", category: "LinkedIn" },
    "linkedin-cover": { width: 1584, height: 396, name: "LinkedIn Cover Photo", category: "LinkedIn" },
    "linkedin-profile": { width: 400, height: 400, name: "LinkedIn Profile Picture", category: "LinkedIn" },
    "linkedin-company-logo": { width: 300, height: 300, name: "LinkedIn Company Logo", category: "LinkedIn" },
    "linkedin-ad": { width: 1200, height: 627, name: "LinkedIn Ad", category: "LinkedIn" },

    // Pinterest
    "pinterest-pin": { width: 1000, height: 1500, name: "Pinterest Pin (2:3)", category: "Pinterest" },
    "pinterest-square": { width: 1000, height: 1000, name: "Pinterest Square Pin", category: "Pinterest" },
    "pinterest-long": { width: 1000, height: 2100, name: "Pinterest Long Pin", category: "Pinterest" },
    "pinterest-board-cover": { width: 222, height: 150, name: "Pinterest Board Cover", category: "Pinterest" },

    // Standard
    "square-1-1": { width: 1080, height: 1080, name: "Square (1:1)", category: "Standard" },
    "landscape-16-9": { width: 1920, height: 1080, name: "Landscape (16:9)", category: "Standard" },
    "portrait-9-16": { width: 1080, height: 1920, name: "Portrait (9:16)", category: "Standard" },
    "wide-21-9": { width: 2560, height: 1080, name: "Ultra Wide (21:9)", category: "Standard" },

    // Print Materials
    "a4-portrait": { width: 2480, height: 3508, name: "A4 Portrait", category: "Print" },
    "a4-landscape": { width: 3508, height: 2480, name: "A4 Landscape", category: "Print" },
    "business-card": { width: 1050, height: 600, name: "Business Card", category: "Print" },
    postcard: { width: 1875, height: 1275, name: 'Postcard (6x4")', category: "Print" },
  }

  const [showResizePanel, setShowResizePanel] = useState(false)

  const handleResize = (formatKey?: string) => {
    if (!templateData || !fabricEditorRef.current) return

    let newWidth, newHeight, formatName

    if (formatKey && socialMediaFormats[formatKey as keyof typeof socialMediaFormats]) {
      const format = socialMediaFormats[formatKey as keyof typeof socialMediaFormats]
      newWidth = format.width
      newHeight = format.height
      formatName = format.name
    } else {
      // Default to 16:9 if no format specified
      newWidth = 1920
      newHeight = 1080
      formatName = "16:9 Landscape"
    }

    const scaleX = newWidth / templateData.width
    const scaleY = newHeight / templateData.height

    const resizedElements = templateData.elements.map((element) => ({
      ...element,
      x: element.x * scaleX,
      y: element.y * scaleY,
      width: element.width * scaleX,
      height: element.height * scaleY,
    }))

    const updatedTemplate = {
      ...templateData,
      width: newWidth,
      height: newHeight,
      elements: resizedElements,
    }

    setTemplateData(updatedTemplate)

    // Calculate new canvas display dimensions
    const maxWidth = 500
    const maxHeight = 500
    const aspectRatio = newWidth / newHeight

    let canvasWidth = maxWidth
    let canvasHeight = maxWidth / aspectRatio

    if (canvasHeight > maxHeight) {
      canvasHeight = maxHeight
      canvasWidth = maxHeight * aspectRatio
    }

    // Use the enhanced resizeCanvas method
    fabricEditorRef.current.resizeCanvas(Math.round(canvasWidth), Math.round(canvasHeight), newWidth, newHeight)

    setShowResizePanel(false)

    // Show success message
    console.log(`Resized to ${formatName}: ${newWidth}×${newHeight}px`)
  }

  const handleCustomResize = (width: number, height: number) => {
    if (!templateData || !fabricEditorRef.current) return

    const scaleX = width / templateData.width
    const scaleY = height / templateData.height

    const resizedElements = templateData.elements.map((element) => ({
      ...element,
      x: element.x * scaleX,
      y: element.y * scaleY,
      width: element.width * scaleX,
      height: element.height * scaleY,
    }))

    const updatedTemplate = {
      ...templateData,
      width: width,
      height: height,
      elements: resizedElements,
    }

    setTemplateData(updatedTemplate)

    // Calculate new canvas display dimensions
    const maxWidth = 500
    const maxHeight = 500
    const aspectRatio = width / height

    let canvasWidth = maxWidth
    let canvasHeight = maxWidth / aspectRatio

    if (canvasHeight > maxHeight) {
      canvasHeight = maxHeight
      canvasWidth = maxHeight * aspectRatio
    }

    // Use the enhanced resizeCanvas method
    fabricEditorRef.current.resizeCanvas(Math.round(canvasWidth), Math.round(canvasHeight), width, height)

    setShowResizePanel(false)

    // Show success message
    console.log(`Resized to custom size: ${width}×${height}px`)
  }

  const handleExport = () => {
    if (fabricEditorRef.current && fabricEditorRef.current.canvas) {
      const dataURL = fabricEditorRef.current.canvas.toDataURL({
        format: "png",
        quality: 1,
        multiplier: 2,
      })

      const link = document.createElement("a")
      link.download = `${templateData?.name || "design"}.png`
      link.href = dataURL
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const getCanvasDimensions = () => {
    if (!templateData) return { width: 400, height: 400 }

    const maxWidth = 500
    const maxHeight = 500
    const aspectRatio = templateData.width / templateData.height

    let canvasWidth = maxWidth
    let canvasHeight = maxWidth / aspectRatio

    if (canvasHeight > maxHeight) {
      canvasHeight = maxHeight
      canvasWidth = maxHeight * aspectRatio
    }

    return {
      width: Math.round(canvasWidth),
      height: Math.round(canvasHeight),
    }
  }

  useEffect(() => {
    if (templateData && fabricEditorRef.current && templateData.elements) {
      fabricEditorRef.current.loadTemplate(templateData.elements)
    }
  }, [templateData])

  // Close resize panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showResizePanel) {
        const target = event.target as Element
        if (!target.closest(".resize-dropdown")) {
          setShowResizePanel(false)
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showResizePanel])

  if (!brandData || !templateData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-xl opacity-20 animate-pulse"></div>
          </div>
          <div className="text-sm font-medium text-slate-500 tracking-wide">Loading your design workspace...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-[1800px] mx-auto px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left Section */}
            <div className="flex items-center gap-8">
              <button
                onClick={() => router.push("/dashboard")}
                className="group flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
                <span className="text-sm font-medium tracking-wide">Back to Dashboard</span>
              </button>

              <div className="w-px h-8 bg-slate-200"></div>

              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">{templateData.name}</h1>
                <p className="text-sm text-slate-500 font-medium tracking-wide">
                  {templateData.width}×{templateData.height}px
                </p>
              </div>
            </div>

            {/* Center Actions */}
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={() => setShowMagicFill(true)}
                className="group relative bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-indigo-600 hover:to-purple-700 flex items-center gap-3 shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 tracking-wide"
              >
                <Wand2 className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                <span>AI Magic Fill</span>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 blur-xl opacity-20"></div>
              </button>

              <button
                onClick={() => setShowFontPanel(true)}
                className="bg-white border border-slate-200/60 text-slate-700 px-5 py-3 rounded-2xl font-semibold hover:bg-slate-50 hover:border-slate-300/60 flex items-center gap-3 transition-all duration-300 shadow-sm hover:shadow-md tracking-wide"
              >
                <Type className="w-4 h-4" />
                <span>Fonts</span>
              </button>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex items-center gap-3">
                <div className="relative resize-dropdown">
                  <button
                    onClick={() => setShowResizePanel(!showResizePanel)}
                    className="bg-blue-50 text-blue-600 px-4 py-3 rounded-2xl hover:bg-blue-100 flex items-center gap-3 transition-all duration-300 border border-blue-200/60 font-semibold tracking-wide"
                  >
                    <Maximize className="w-4 h-4" />
                    <span>Resize</span>
                  </button>

                  {/* Enhanced Resize Dropdown */}
                  {showResizePanel && (
                    <div className="absolute top-16 right-0 bg-white border border-slate-200/60 rounded-3xl shadow-2xl shadow-slate-900/10 w-96 z-50">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Resize Canvas</h3>
                          <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl font-medium tracking-wide">
                            {templateData ? `${templateData.width}×${templateData.height}` : ""}
                          </span>
                        </div>

                        {/* Search Input */}
                        <div className="mb-6">
                          <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                              type="text"
                              placeholder="Search formats... (try: story, post, thumbnail)"
                              value={resizeSearchTerm}
                              onChange={(e) => setResizeSearchTerm(e.target.value)}
                              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200/60 rounded-2xl text-slate-900 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/60 transition-all duration-300 font-medium tracking-wide"
                            />
                          </div>

                          {resizeSearchTerm === "" && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {["story", "post", "thumbnail", "reel", "pin"].map((suggestion) => (
                                <button
                                  key={suggestion}
                                  onClick={() => setResizeSearchTerm(suggestion)}
                                  className="px-3 py-1.5 text-xs bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 hover:text-slate-800 transition-all duration-200 font-medium tracking-wide"
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="space-y-6 max-h-96 overflow-y-auto">
                          {/* Group formats by category and filter by search term */}
                          {Object.entries(
                            Object.entries(socialMediaFormats)
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
                            <div key={category} className="space-y-3">
                              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                                {category} ({formats.length})
                              </h4>
                              <div className="space-y-2">
                                {formats.map(([key, format]) => {
                                  const isCurrentSize =
                                    templateData &&
                                    templateData.width === format.width &&
                                    templateData.height === format.height

                                  return (
                                    <button
                                      key={key}
                                      onClick={() => handleResize(key)}
                                      className={`w-full text-left p-4 rounded-2xl transition-all duration-300 group ${
                                        isCurrentSize
                                          ? "bg-indigo-50 border-2 border-indigo-200"
                                          : "hover:bg-slate-50 border-2 border-transparent hover:border-slate-200"
                                      }`}
                                    >
                                      <div className="flex justify-between items-start">
                                        <div className="flex-1 min-w-0">
                                          <span
                                            className={`text-sm font-semibold block truncate tracking-tight ${
                                              isCurrentSize
                                                ? "text-indigo-700"
                                                : "text-slate-900 group-hover:text-indigo-600"
                                            }`}
                                          >
                                            {format.name}
                                          </span>
                                          <span className="text-xs text-slate-500 block mt-1 font-medium tracking-wide">
                                            {format.width}×{format.height}px •{" "}
                                            {(format.width / format.height).toFixed(2)} ratio
                                          </span>
                                        </div>
                                        {isCurrentSize && (
                                          <span className="text-xs text-indigo-600 bg-indigo-100 px-3 py-1.5 rounded-xl ml-3 flex-shrink-0 font-semibold tracking-wide">
                                            Current
                                          </span>
                                        )}
                                      </div>
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          ))}

                          {/* Custom Size Option */}
                          <div className="border-t border-slate-200 pt-6 mt-6">
                            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Custom</h4>
                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-semibold text-slate-600 mb-2 tracking-wide">
                                    Width
                                  </label>
                                  <input
                                    type="number"
                                    placeholder="1920"
                                    className="w-full px-3 py-2.5 bg-white border border-slate-200/60 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/60 transition-all duration-300 font-medium tracking-wide"
                                    id="custom-width"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-slate-600 mb-2 tracking-wide">
                                    Height
                                  </label>
                                  <input
                                    type="number"
                                    placeholder="1080"
                                    className="w-full px-3 py-2.5 bg-white border border-slate-200/60 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/60 transition-all duration-300 font-medium tracking-wide"
                                    id="custom-height"
                                  />
                                </div>
                              </div>
                              <button
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

                <button
                  onClick={handleExport}
                  className="bg-emerald-50 text-emerald-600 px-4 py-3 rounded-2xl hover:bg-emerald-100 flex items-center gap-3 transition-all duration-300 border border-emerald-200/60 font-semibold tracking-wide"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>

              <button className="lg:hidden bg-slate-100 p-3 rounded-2xl hover:bg-slate-200 transition-all duration-300">
                <MoreHorizontal className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className="w-96 bg-white border-r border-slate-200/60 overflow-y-auto">
          <div className="p-8 space-y-8">
            {/* Brand Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">Brand Identity</h3>
                  <p className="text-sm text-slate-500 font-medium tracking-wide">Colors & Style</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/60">
                <label className="block text-sm font-semibold text-slate-700 mb-4 tracking-wide">Brand Colors</label>
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
            </div>

            {/* Content Preview */}
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

            {/* Canvas Controls */}
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

            {/* Element Properties */}
            {selectedFabricObject && (
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
                        <select
                          value={(selectedFabricObject as fabric.Textbox).fontFamily || "Arial"}
                          onChange={(e) => {
                            if (fabricEditorRef.current) {
                              fabricEditorRef.current.updateSelectedObject({ fontFamily: e.target.value })
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

        {/* Canvas Area */}
        <div className="flex-1 flex items-center justify-center p-12 bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="relative bg-white rounded-3xl border border-slate-200/60 shadow-2xl shadow-slate-900/10 p-8">
              {(() => {
                const dimensions = getCanvasDimensions()
                return (
                  <FabricEditor
                    width={dimensions.width}
                    height={dimensions.height}
                    originalWidth={templateData.width}
                    originalHeight={templateData.height}
                    onObjectSelected={handleFabricObjectSelected}
                    onObjectModified={handleFabricObjectModified}
                    ref={fabricEditorRef}
                  />
                )
              })()}

              {/* Canvas Overlay Controls */}
              <div className="absolute top-6 right-6 flex gap-2">
                <button className="bg-slate-900/80 backdrop-blur-sm text-white p-3 rounded-2xl hover:bg-slate-900 transition-all duration-300 shadow-lg">
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button className="bg-slate-900/80 backdrop-blur-sm text-white p-3 rounded-2xl hover:bg-slate-900 transition-all duration-300 shadow-lg">
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button className="bg-slate-900/80 backdrop-blur-sm text-white p-3 rounded-2xl hover:bg-slate-900 transition-all duration-300 shadow-lg">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Magic Fill Modal */}
      {showMagicFill && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200/60 p-8 w-full max-w-lg shadow-2xl shadow-slate-900/20">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/25">
                <Wand2 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">AI Magic Fill</h3>
              <p className="text-slate-500 text-base font-medium tracking-wide">
                Describe your content and let AI create amazing copy
              </p>
            </div>

            <div className="space-y-8">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-4 tracking-wide">
                  What do you want to promote?
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-200/60 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/60 text-slate-900 resize-none placeholder:text-slate-400 transition-all duration-300 font-medium tracking-wide"
                  rows={4}
                  placeholder="e.g., A new product launch for eco-friendly water bottles that helps reduce plastic waste..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowMagicFill(false)}
                  className="flex-1 px-6 py-4 border border-slate-200/60 rounded-2xl font-semibold hover:bg-slate-50 transition-all duration-300 text-slate-700 tracking-wide"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAIGenerate}
                  disabled={isGeneratingAI || !aiPrompt.trim()}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-4 rounded-2xl font-semibold hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all duration-300 shadow-lg shadow-indigo-500/25 tracking-wide"
                >
                  {isGeneratingAI ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Font Management Modal */}
      {showFontPanel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200/60 p-8 w-full max-w-lg shadow-2xl shadow-slate-900/20">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Type className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Font Management</h3>
                  <p className="text-slate-500 text-sm font-medium tracking-wide">
                    Upload and manage your custom fonts
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFontPanel(false)}
                className="p-3 hover:bg-slate-100 rounded-2xl transition-all duration-300 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-8">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-4 tracking-wide">
                  Upload Custom Font
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-slate-400 transition-all duration-300 bg-slate-50">
                  <input
                    type="file"
                    accept=".woff,.woff2,.ttf,.otf"
                    onChange={handleFontUpload}
                    className="hidden"
                    id="font-upload"
                  />
                  <label
                    htmlFor="font-upload"
                    className="cursor-pointer text-slate-600 hover:text-slate-800 transition-colors duration-300"
                  >
                    <div className="space-y-4">
                      <Upload className="w-10 h-10 mx-auto text-slate-400" />
                      <div className="text-sm font-semibold tracking-wide">Click to upload font file</div>
                      <div className="text-xs text-slate-500 font-medium tracking-wide">
                        Supports .woff, .woff2, .ttf, .otf
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-4 tracking-wide">
                  Available Fonts ({uploadedFonts.length})
                </label>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {uploadedFonts.map((font) => (
                    <div
                      key={font}
                      className="p-4 bg-slate-50 rounded-2xl text-sm border border-slate-200/60 hover:bg-slate-100 transition-all duration-300 font-medium tracking-wide"
                      style={{ fontFamily: font }}
                    >
                      {font}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
