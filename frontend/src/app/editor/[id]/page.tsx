"use client"

import type React from "react"

import EditorHeader from "@/components/Editor/Header"
import * as fabric from "fabric"
import {
  ArrowLeft,
  Circle,
  Download,
  Eye,
  ImagePlus,
  Layers,
  Maximize,
  MoreHorizontal,
  Palette,
  Plus,
  RotateCcw,
  Search,
  Settings,
  Sparkles,
  Square,
  Triangle,
  Type,
  Upload,
  Wand2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import FabricEditor, { FabricEditorRef } from "../../../components/FabricEditor"
import { ApiClient } from "../../../lib/api"

interface Brand {
  _id: string
  name: string
  logoUrl?: string
  primaryColor: string
  secondaryColor: string
  accentColor?: string
  vibe: "playful" | "elegant" | "bold" | "minimal" | "professional"
  voice: string
  personality: string
  targetAudience: string
  toneGuidelines: string
  keyValues: string
  communicationStyle: string
  industry?: string
  tagline?: string
  doNotUse?: string
  preferredWords: string[]
  avoidedWords: string[]
  createdAt: string
  updatedAt: string
}

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
  shapeType?: 'rectangle' | 'circle' | 'triangle' | 'line'
  radius?: number
  strokeWidth?: number
  stroke?: string
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
  const [brands, setBrands] = useState<Brand[]>([])
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null)
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
  const [backendFonts, setBackendFonts] = useState<Array<{
    id: string
    name: string
    fontFamily: string
    fileUrl: string
    isOwner: boolean
  }>>([])
  const [isUploadingFont, setIsUploadingFont] = useState(false)
  const [showFontPanel, setShowFontPanel] = useState(false)
  const [resizeSearchTerm, setResizeSearchTerm] = useState("")

  // Sidebar state
  const [activeSidebarSection, setActiveSidebarSection] = useState<string | null>('brand')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const fabricEditorRef = useRef<FabricEditorRef>(null)

  // Sidebar toggle function
  const toggleSidebarSection = (section: string) => {
    if (activeSidebarSection === section && sidebarOpen) {
      setSidebarOpen(false)
      setActiveSidebarSection(null)
    } else {
      setActiveSidebarSection(section)
      setSidebarOpen(true)
    }
  }

  // Load fonts from backend
  const loadFonts = useCallback(async () => {
    try {
      const response = await apiClient.getFonts()
      if (response.success && response.fonts) {
        setBackendFonts(response.fonts)

        // Add backend fonts to the font family list
        const backendFontFamilies = response.fonts.map((font: { fontFamily: string }) => font.fontFamily)
        const systemFonts = ["Arial", "Helvetica", "Times New Roman", "Georgia", "Verdana"]
        const allFonts = [...systemFonts, ...backendFontFamilies]
        setUploadedFonts([...new Set(allFonts)]) // Remove duplicates
      }
    } catch (error) {
      console.error('Failed to load fonts:', error)
    }
  }, [apiClient])

  // Pre-load backend fonts when editor is ready
  useEffect(() => {
    if (backendFonts.length > 0) {
      const preloadFonts = async () => {
        // Wait a bit to ensure the editor is ready
        await new Promise(resolve => setTimeout(resolve, 1000))

        if (fabricEditorRef.current) {
          for (const font of backendFonts) {
            const fontUrl = `${process.env.NEXT_PUBLIC_CDN_URL || 'http://localhost:5001'}${font.fileUrl}`
            try {
              await fabricEditorRef.current.loadFont(font.fontFamily, fontUrl)
              console.log(`Pre-loaded font: ${font.fontFamily}`)
            } catch (error) {
              console.error(`Failed to pre-load font ${font.fontFamily}:`, error)
            }
          }
        }
      }
      preloadFonts()
    }
  }, [backendFonts])

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("authToken")
    if (!token) {
      router.push("/auth/login")
      return
    }

    // Set token in API client
    apiClient.setToken(token)

    // Load brands from API
    const loadBrands = async () => {
      try {
        const response = await apiClient.getBrands()
        if (response.success && response.brands) {
          setBrands(response.brands)

          // Set first brand as selected if available, or use localStorage fallback
          const storedBrandData = localStorage.getItem("brandData")
          if (response.brands.length > 0) {
            const firstBrand = response.brands[0]
            setSelectedBrand(firstBrand)
            setBrandData({
              name: firstBrand.name,
              primaryColor: firstBrand.primaryColor,
              secondaryColor: firstBrand.secondaryColor,
              vibe: firstBrand.vibe,
              voice: firstBrand.voice,
              personality: firstBrand.personality,
              targetAudience: firstBrand.targetAudience,
              toneGuidelines: firstBrand.toneGuidelines,
              keyValues: firstBrand.keyValues,
              communicationStyle: firstBrand.communicationStyle,
            })
          } else if (storedBrandData) {
            // Fallback to localStorage if no brands exist
            const loadedBrandData = JSON.parse(storedBrandData)
            setBrandData(loadedBrandData)
          }
        }
      } catch (error) {
        console.error('Failed to load brands:', error)
        // Fallback to localStorage if API fails
        const storedBrandData = localStorage.getItem("brandData")
        if (storedBrandData) {
          const loadedBrandData = JSON.parse(storedBrandData)
          setBrandData(loadedBrandData)
        }
      }
    }

    loadBrands()
    loadFonts()
  }, [templateId, router, apiClient, loadFonts])

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("authToken")
    if (!token) {
      router.push("/auth/login")
      return
    }

    // Set token in API client
    apiClient.setToken(token)

    // Load brands from API
    const loadBrands = async () => {
      try {
        const response = await apiClient.getBrands()
        if (response.success && response.brands) {
          setBrands(response.brands)

          // Set first brand as selected if available, or use localStorage fallback
          const storedBrandData = localStorage.getItem("brandData")
          if (response.brands.length > 0) {
            const firstBrand = response.brands[0]
            setSelectedBrand(firstBrand)
            setBrandData({
              name: firstBrand.name,
              primaryColor: firstBrand.primaryColor,
              secondaryColor: firstBrand.secondaryColor,
              vibe: firstBrand.vibe,
              voice: firstBrand.voice,
              personality: firstBrand.personality,
              targetAudience: firstBrand.targetAudience,
              toneGuidelines: firstBrand.toneGuidelines,
              keyValues: firstBrand.keyValues,
              communicationStyle: firstBrand.communicationStyle,
            })
          } else if (storedBrandData) {
            // Fallback to localStorage if no brands exist
            const loadedBrandData = JSON.parse(storedBrandData)
            setBrandData(loadedBrandData)
          }
        }
      } catch (error) {
        console.error('Failed to load brands:', error)
        // Fallback to localStorage if API fails
        const storedBrandData = localStorage.getItem("brandData")
        if (storedBrandData) {
          const loadedBrandData = JSON.parse(storedBrandData)
          setBrandData(loadedBrandData)
        }
      }
    }

    loadBrands()
    loadFonts()
  }, [templateId, router, apiClient, loadFonts])

  // Set template data when brand data is loaded
  useEffect(() => {
    if (brandData) {
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
              color: brandData.primaryColor || "#000000",
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
              color: brandData.secondaryColor || "#666666",
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
              backgroundColor: brandData.primaryColor || "#3B82F6",
            },
          },
        ],
      })
    }
  }, [brandData, templateId])

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

    // Extract font family name from filename
    const fontFamilyName = file.name.split(".")[0].replace(/[-_]/g, " ")

    setIsUploadingFont(true)
    try {
      const response = await apiClient.uploadFont(file, fontFamilyName, false)

      if (response.success) {
        // Add the new font to the local state
        setUploadedFonts((prev) => [...prev, response.font.fontFamily])
        setBackendFonts((prev) => [...prev, {
          id: response.font.id,
          name: response.font.name,
          fontFamily: response.font.fontFamily,
          fileUrl: response.font.fileUrl,
          isOwner: true
        }])

        alert(`Font "${response.font.fontFamily}" uploaded successfully!`)

        // Load the font for immediate use
        if (fabricEditorRef.current) {
          const fontUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}${response.font.fileUrl}`
          await fabricEditorRef.current.loadFont(response.font.fontFamily, fontUrl)

          // Auto-apply the font to the currently selected text object
          if (selectedFabricObject && selectedFabricObject.type === "textbox") {
            fabricEditorRef.current.updateSelectedObject({ fontFamily: response.font.fontFamily })
            // Update the selected object to trigger re-render
            const activeObj = fabricEditorRef.current.canvas?.getActiveObject()
            if (activeObj) {
              setSelectedFabricObject(null)
              setTimeout(() => setSelectedFabricObject(activeObj), 0)
            }
          }
        }
      }
    } catch (error) {
      console.error("Font upload error:", error)
      alert("Failed to upload font. Please try again.")
    } finally {
      setIsUploadingFont(false)
      // Clear the input
      event.target.value = ""
    }
  }

  // Fabric.js event handlers
  const handleFabricObjectSelected = useCallback((obj: fabric.Object | null) => {
    setSelectedFabricObject(obj)

    // Auto-open element properties when an object is selected
    if (obj) {
      setActiveSidebarSection('element')
      setSidebarOpen(true)
    }
  }, [])

  const handleFabricObjectModified = useCallback(() => {
    if (!templateData || !fabricEditorRef.current) return

    const updatedElements = fabricEditorRef.current.exportTemplate()
    if (updatedElements) {
      setTemplateData({ ...templateData, elements: updatedElements })
    }
  }, [templateData])

  // Apply a brand to the canvas
  const applyBrand = (brand: Brand) => {
    setSelectedBrand(brand)
    setBrandData({
      name: brand.name,
      primaryColor: brand.primaryColor,
      secondaryColor: brand.secondaryColor,
      vibe: brand.vibe,
      voice: brand.voice,
      personality: brand.personality,
      targetAudience: brand.targetAudience,
      toneGuidelines: brand.toneGuidelines,
      keyValues: brand.keyValues,
      communicationStyle: brand.communicationStyle,
    })

    // Update template colors if template exists
    if (templateData && fabricEditorRef.current) {
      const updatedElements = templateData.elements.map((element) => {
        if (element.type === "text" && element.style) {
          return {
            ...element,
            style: {
              ...element.style,
              color: element.style.color === brandData?.primaryColor ? brand.primaryColor :
                element.style.color === brandData?.secondaryColor ? brand.secondaryColor :
                  element.style.color,
              backgroundColor: element.style.backgroundColor === brandData?.primaryColor ? brand.primaryColor :
                element.style.backgroundColor === brandData?.secondaryColor ? brand.secondaryColor :
                  element.style.backgroundColor,
            },
          }
        }
        return element
      })

      setTemplateData({ ...templateData, elements: updatedElements })
      fabricEditorRef.current.loadTemplate(updatedElements)
    }
  }

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

    // Update the editor dimensions to match the new template size
    fabricEditorRef.current.resizeCanvas(newWidth, newHeight, templateData.width, templateData.height)

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

    // Update the editor dimensions to match the new template size
    fabricEditorRef.current.resizeCanvas(width, height, templateData.width, templateData.height)

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

      const brandName = selectedBrand?.name || brandData?.name || "design"
      const templateName = templateData?.name || "template"
      const filename = `${brandName}_${templateName}_${Date.now()}.png`

      const link = document.createElement("a")
      link.download = filename
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

  // Set up canvas event listeners for object selection and modification
  useEffect(() => {
    if (!fabricEditorRef.current?.canvas) return

    const canvas = fabricEditorRef.current.canvas

    const handleSelectionCreated = (e: any) => {
      const selected = e.selected?.[0]
      handleFabricObjectSelected(selected || null)
    }

    const handleSelectionUpdated = (e: any) => {
      const selected = e.selected?.[0]
      handleFabricObjectSelected(selected || null)
    }

    const handleSelectionCleared = () => {
      handleFabricObjectSelected(null)
    }

    const handleObjectModified = () => {
      handleFabricObjectModified()
    }

    // Add event listeners
    canvas.on('selection:created', handleSelectionCreated)
    canvas.on('selection:updated', handleSelectionUpdated)
    canvas.on('selection:cleared', handleSelectionCleared)
    canvas.on('object:modified', handleObjectModified)

    // Cleanup
    return () => {
      canvas.off('selection:created', handleSelectionCreated)
      canvas.off('selection:updated', handleSelectionUpdated)
      canvas.off('selection:cleared', handleSelectionCleared)
      canvas.off('object:modified', handleObjectModified)
    }
  }, [handleFabricObjectSelected, handleFabricObjectModified, fabricEditorRef.current?.canvas])

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

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutsideSidebar = (event: MouseEvent) => {
      if (sidebarOpen) {
        const target = event.target as Element
        if (!target.closest(".sidebar-icon") && !target.closest(".sidebar-content")) {
          setSidebarOpen(false)
          setActiveSidebarSection(null)
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutsideSidebar)
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideSidebar)
    }
  }, [sidebarOpen])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false)
        setActiveSidebarSection(null)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [sidebarOpen])


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
      <EditorHeader
        templateData={templateData}
        setShowFontPanel={setShowFontPanel}
        setShowMagicFill={setShowMagicFill}
        handleFontUpload={handleFontUpload}
        showResizePanel={showResizePanel}
        setShowResizePanel={setShowResizePanel}
        handleResize={handleResize}
        handleCustomResize={handleCustomResize}
        handleExport={handleExport}
        resizeSearchTerm={resizeSearchTerm}
        setResizeSearchTerm={setResizeSearchTerm}
        isUploadingFont={isUploadingFont}
      />

      <EditorMain />

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
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
                    disabled={isUploadingFont}
                  />
                  <label
                    htmlFor="font-upload"
                    className={`cursor-pointer transition-colors duration-300 ${isUploadingFont
                      ? "text-slate-400 cursor-not-allowed"
                      : "text-slate-600 hover:text-slate-800"
                      }`}
                  >
                    <div className="space-y-4">
                      {isUploadingFont ? (
                        <RotateCcw className="w-10 h-10 mx-auto text-slate-400 animate-spin" />
                      ) : (
                        <Upload className="w-10 h-10 mx-auto text-slate-400" />
                      )}
                      <div className="text-sm font-semibold tracking-wide">
                        {isUploadingFont ? "Uploading..." : "Click to upload font file"}
                      </div>
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
                <div className="max-h-64 overflow-y-auto space-y-3">
                  {/* System Fonts */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">System Fonts</h4>
                    {["Arial", "Helvetica", "Times New Roman", "Georgia", "Verdana"].map((font) => (
                      <div
                        key={font}
                        className="p-3 bg-slate-50 rounded-xl text-sm border border-slate-200/60 hover:bg-slate-100 transition-all duration-300 font-medium tracking-wide flex items-center justify-between"
                        style={{ fontFamily: font }}
                      >
                        <span>{font}</span>
                        <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-lg">System</span>
                      </div>
                    ))}
                  </div>

                  {/* Backend Fonts */}
                  {backendFonts.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Custom Fonts</h4>
                      {backendFonts.map((font) => (
                        <div
                          key={font.id}
                          className="p-3 bg-slate-50 rounded-xl text-sm border border-slate-200/60 hover:bg-slate-100 transition-all duration-300 font-medium tracking-wide"
                        >
                          <div className="flex items-center justify-between">
                            <span style={{ fontFamily: font.fontFamily }}>{font.fontFamily}</span>
                            <div className="flex items-center gap-2">
                              {font.isOwner && (
                                <button
                                  onClick={async () => {
                                    if (confirm(`Delete font "${font.fontFamily}"?`)) {
                                      try {
                                        await apiClient.deleteFont(font.id)
                                        setBackendFonts(prev => prev.filter(f => f.id !== font.id))
                                        setUploadedFonts(prev => prev.filter(f => f !== font.fontFamily))
                                        alert('Font deleted successfully')
                                      } catch (error) {
                                        console.error('Delete font error:', error)
                                        alert('Failed to delete font')
                                      }
                                    }
                                  }}
                                  className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-lg hover:bg-red-200 transition-colors"
                                >
                                  Delete
                                </button>
                              )}
                              <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-lg">
                                {font.isOwner ? "Yours" : "Shared"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
