"use client"


import { Sidebar } from "@/components/ui"
import Editor from "./components/Editor"

// interface Brand {
//   _id: string
//   name: string
//   logoUrl?: string
//   primaryColor: string
//   secondaryColor: string
//   accentColor?: string
//   vibe: "playful" | "elegant" | "bold" | "minimal" | "professional"
//   voice: string
//   personality: string
//   targetAudience: string
//   toneGuidelines: string
//   keyValues: string
//   communicationStyle: string
//   industry?: string
//   tagline?: string
//   doNotUse?: string
//   preferredWords: string[]
//   avoidedWords: string[]
//   createdAt: string
//   updatedAt: string
// }

// interface BrandData {
//   name: string
//   primaryColor: string
//   secondaryColor: string
//   vibe: string
//   voice?: string
//   personality?: string
//   targetAudience?: string
//   toneGuidelines?: string
//   keyValues?: string
//   communicationStyle?: string
// }

// interface ElementStyle {
//   fontSize?: string
//   fontWeight?: string
//   fontFamily?: string
//   color?: string
//   backgroundColor?: string
//   shapeType?: 'rectangle' | 'circle' | 'triangle' | 'line'
//   radius?: number
//   strokeWidth?: number
//   stroke?: string
// }

// interface TemplateData {
//   id: number
//   name: string
//   width: number
//   height: number
//   elements: {
//     type: "text" | "image" | "shape"
//     content: string
//     x: number
//     y: number
//     width: number
//     height: number
//     style?: ElementStyle
//   }[]
// }

export default function EditorPage() {
  //   const router = useRouter()
  //   const params = useParams()
  //   const templateId = params.id as string
  //   const apiClient = useMemo(() => new ApiClient(), [])
  //   const [brands, setBrands] = useState<Brand[]>([])
  //   const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null)
  //   const [brandData, setBrandData] = useState<BrandData | null>(null)
  //   const [templateData, setTemplateData] = useState<TemplateData | null>(null)
  //   const [aiContent, setAiContent] = useState({
  //     headline: "Your Amazing Headline",
  //     bodyText: "Compelling copy that converts your audience",
  //   })
  //   const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  //   const [aiPrompt, setAiPrompt] = useState("")
  //   const [showMagicFill, setShowMagicFill] = useState(false)
  //   const [selectedFabricObject, setSelectedFabricObject] = useState<fabric.Object | null>(null)
  //   const [uploadedFonts, setUploadedFonts] = useState<string[]>([
  //     "Arial",
  //     "Helvetica",
  //     "Times New Roman",
  //     "Georgia",
  //     "Verdana",
  //   ])
  //   const [backendFonts, setBackendFonts] = useState<Array<{
  //     id: string
  //     name: string
  //     fontFamily: string
  //     fileUrl: string
  //     isOwner: boolean
  //   }>>([])
  //   const [isUploadingFont, setIsUploadingFont] = useState(false)
  //   const [showFontPanel, setShowFontPanel] = useState(false)
  //   const [resizeSearchTerm, setResizeSearchTerm] = useState("")

  //   // Sidebar state
  //   const [activeSidebarSection, setActiveSidebarSection] = useState<string | null>('brand')
  //   const [sidebarOpen, setSidebarOpen] = useState(true)

  //   const fabricEditorRef = useRef<FabricEditorRef>(null)

  //   // Sidebar toggle function
  //   const toggleSidebarSection = (section: string) => {
  //     if (activeSidebarSection === section && sidebarOpen) {
  //       setSidebarOpen(false)
  //       setActiveSidebarSection(null)
  //     } else {
  //       setActiveSidebarSection(section)
  //       setSidebarOpen(true)
  //     }
  //   }

  //   // Load fonts from backend
  //   const loadFonts = useCallback(async () => {
  //     try {
  //       const response = await apiClient.getFonts()
  //       if (response.success && response.fonts) {
  //         setBackendFonts(response.fonts)

  //         // Add backend fonts to the font family list
  //         const backendFontFamilies = response.fonts.map((font: { fontFamily: string }) => font.fontFamily)
  //         const systemFonts = ["Arial", "Helvetica", "Times New Roman", "Georgia", "Verdana"]
  //         const allFonts = [...systemFonts, ...backendFontFamilies]
  //         setUploadedFonts([...new Set(allFonts)]) // Remove duplicates
  //       }
  //     } catch (error) {
  //       console.error('Failed to load fonts:', error)
  //     }
  //   }, [apiClient])

  //   // Pre-load backend fonts when editor is ready
  //   useEffect(() => {
  //     if (backendFonts.length > 0) {
  //       const preloadFonts = async () => {
  //         // Wait a bit to ensure the editor is ready
  //         await new Promise(resolve => setTimeout(resolve, 1000))

  //         if (fabricEditorRef.current) {
  //           for (const font of backendFonts) {
  //             const fontUrl = `${process.env.NEXT_PUBLIC_CDN_URL || 'http://localhost:5001'}${font.fileUrl}`
  //             try {
  //               await fabricEditorRef.current.loadFont(font.fontFamily, fontUrl)
  //               console.log(`Pre-loaded font: ${font.fontFamily}`)
  //             } catch (error) {
  //               console.error(`Failed to pre-load font ${font.fontFamily}:`, error)
  //             }
  //           }
  //         }
  //       }
  //       preloadFonts()
  //     }
  //   }, [backendFonts])

  //   useEffect(() => {
  //     // Check if user is authenticated
  //     const token = localStorage.getItem("authToken")
  //     if (!token) {
  //       router.push("/auth/login")
  //       return
  //     }

  //     // Set token in API client
  //     apiClient.setToken(token)

  //     // Load brands from API
  //     const loadBrands = async () => {
  //       try {
  //         const response = await apiClient.getBrands()
  //         if (response.success && response.brands) {
  //           setBrands(response.brands)

  //           // Set first brand as selected if available, or use localStorage fallback
  //           const storedBrandData = localStorage.getItem("brandData")
  //           if (response.brands.length > 0) {
  //             const firstBrand = response.brands[0]
  //             setSelectedBrand(firstBrand)
  //             setBrandData({
  //               name: firstBrand.name,
  //               primaryColor: firstBrand.primaryColor,
  //               secondaryColor: firstBrand.secondaryColor,
  //               vibe: firstBrand.vibe,
  //               voice: firstBrand.voice,
  //               personality: firstBrand.personality,
  //               targetAudience: firstBrand.targetAudience,
  //               toneGuidelines: firstBrand.toneGuidelines,
  //               keyValues: firstBrand.keyValues,
  //               communicationStyle: firstBrand.communicationStyle,
  //             })
  //           } else if (storedBrandData) {
  //             // Fallback to localStorage if no brands exist
  //             const loadedBrandData = JSON.parse(storedBrandData)
  //             setBrandData(loadedBrandData)
  //           }
  //         }
  //       } catch (error) {
  //         console.error('Failed to load brands:', error)
  //         // Fallback to localStorage if API fails
  //         const storedBrandData = localStorage.getItem("brandData")
  //         if (storedBrandData) {
  //           const loadedBrandData = JSON.parse(storedBrandData)
  //           setBrandData(loadedBrandData)
  //         }
  //       }
  //     }

  //     loadBrands()
  //     loadFonts()
  //   }, [templateId, router, apiClient, loadFonts])

  //   useEffect(() => {
  //     // Check if user is authenticated
  //     const token = localStorage.getItem("authToken")
  //     if (!token) {
  //       router.push("/auth/login")
  //       return
  //     }

  //     // Set token in API client
  //     apiClient.setToken(token)

  //     // Load brands from API
  //     const loadBrands = async () => {
  //       try {
  //         const response = await apiClient.getBrands()
  //         if (response.success && response.brands) {
  //           setBrands(response.brands)

  //           // Set first brand as selected if available, or use localStorage fallback
  //           const storedBrandData = localStorage.getItem("brandData")
  //           if (response.brands.length > 0) {
  //             const firstBrand = response.brands[0]
  //             setSelectedBrand(firstBrand)
  //             setBrandData({
  //               name: firstBrand.name,
  //               primaryColor: firstBrand.primaryColor,
  //               secondaryColor: firstBrand.secondaryColor,
  //               vibe: firstBrand.vibe,
  //               voice: firstBrand.voice,
  //               personality: firstBrand.personality,
  //               targetAudience: firstBrand.targetAudience,
  //               toneGuidelines: firstBrand.toneGuidelines,
  //               keyValues: firstBrand.keyValues,
  //               communicationStyle: firstBrand.communicationStyle,
  //             })
  //           } else if (storedBrandData) {
  //             // Fallback to localStorage if no brands exist
  //             const loadedBrandData = JSON.parse(storedBrandData)
  //             setBrandData(loadedBrandData)
  //           }
  //         }
  //       } catch (error) {
  //         console.error('Failed to load brands:', error)
  //         // Fallback to localStorage if API fails
  //         const storedBrandData = localStorage.getItem("brandData")
  //         if (storedBrandData) {
  //           const loadedBrandData = JSON.parse(storedBrandData)
  //           setBrandData(loadedBrandData)
  //         }
  //       }
  //     }

  //     loadBrands()
  //     loadFonts()
  //   }, [templateId, router, apiClient, loadFonts])

  //   // Set template data when brand data is loaded
  //   useEffect(() => {
  //     if (brandData) {
  //       setTemplateData({
  //         id: Number.parseInt(templateId),
  //         name: `Template ${templateId}`,
  //         width: 1080,
  //         height: 1080,
  //         elements: [
  //           {
  //             type: "text",
  //             content: "Your Amazing Headline",
  //             x: 40,
  //             y: 200,
  //             width: 1000,
  //             height: 100,
  //             style: {
  //               fontSize: "48px",
  //               fontWeight: "bold",
  //               color: brandData.primaryColor || "#000000",
  //             },
  //           },
  //           {
  //             type: "text",
  //             content: "Compelling copy that converts your audience",
  //             x: 40,
  //             y: 320,
  //             width: 1000,
  //             height: 80,
  //             style: {
  //               fontSize: "24px",
  //               color: brandData.secondaryColor || "#666666",
  //             },
  //           },
  //           {
  //             type: "text",
  //             content: "Get Started",
  //             x: 440,
  //             y: 850,
  //             width: 200,
  //             height: 60,
  //             style: {
  //               fontSize: "18px",
  //               fontWeight: "bold",
  //               color: "#ffffff",
  //               backgroundColor: brandData.primaryColor || "#3B82F6",
  //             },
  //           },
  //         ],
  //       })
  //     }
  //   }, [brandData, templateId])

  //   const handleAIGenerate = async () => {
  //     if (!aiPrompt.trim()) return

  //     setIsGeneratingAI(true)
  //     try {
  //       // Get current template content to provide context
  //       const currentContent = templateData ? fabricEditorRef.current?.exportTemplate() || templateData.elements : []

  //       // Call the enhanced AI API with current content context and comprehensive brand information
  //       const response = await apiClient.magicFill({
  //         prompt: aiPrompt,
  //         vibe: brandData?.vibe || "professional",
  //         brandContext: {
  //           name: brandData?.name || "Generic brand",
  //           voice: brandData?.voice || "Professional and engaging",
  //           personality: brandData?.personality || "Friendly and approachable",
  //           targetAudience: brandData?.targetAudience || "General audience",
  //           toneGuidelines: brandData?.toneGuidelines || "Use clear, concise language that resonates with the audience",
  //           keyValues: brandData?.keyValues || "Quality, innovation, customer satisfaction",
  //           communicationStyle: brandData?.communicationStyle || "Direct and informative",
  //         },
  //         currentContent: currentContent,
  //       })

  //       if (response.success && response.content) {
  //         setAiContent(response.content)

  //         // Update template with AI content and enhanced brand styling
  //         if (templateData && fabricEditorRef.current) {
  //           const updatedElements = templateData.elements.map((element, index) => {
  //             if (element.type === "text") {
  //               let newElement = { ...element }
  //               if (index === 0) {
  //                 newElement = {
  //                   ...element,
  //                   content: response.content.headline,
  //                   style: {
  //                     ...element.style,
  //                     color: brandData?.primaryColor || element.style?.color,
  //                     fontWeight: "bold",
  //                   },
  //                 }
  //               } else if (index === 1) {
  //                 newElement = {
  //                   ...element,
  //                   content: response.content.bodyText,
  //                   style: {
  //                     ...element.style,
  //                     color: brandData?.secondaryColor || element.style?.color,
  //                   },
  //                 }
  //               }
  //               return newElement
  //             }
  //             return element
  //           })

  //           setTemplateData({ ...templateData, elements: updatedElements })
  //           fabricEditorRef.current.loadTemplate(updatedElements)
  //         }
  //       } else {
  //         // Fallback to mock response if API fails
  //         const mockResponse = {
  //           headline: "Revolutionary Solution Awaits",
  //           bodyText: "Transform your business with our innovative approach",
  //         }
  //         setAiContent(mockResponse)
  //       }

  //       setShowMagicFill(false)
  //     } catch (error) {
  //       console.error("AI generation error:", error)
  //       setShowMagicFill(false)
  //     } finally {
  //       setIsGeneratingAI(false)
  //     }
  //   }

  //   // Font management functions
  //   const handleFontUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  //     const file = event.target.files?.[0]
  //     if (!file) return

  //     const validTypes = [".woff", ".woff2", ".ttf", ".otf"]
  //     const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()

  //     if (!validTypes.includes(fileExtension)) {
  //       alert("Please upload a valid font file (.woff, .woff2, .ttf, .otf)")
  //       return
  //     }

  //     // Extract font family name from filename
  //     const fontFamilyName = file.name.split(".")[0].replace(/[-_]/g, " ")

  //     setIsUploadingFont(true)
  //     try {
  //       const response = await apiClient.uploadFont(file, fontFamilyName, false)

  //       if (response.success) {
  //         // Add the new font to the local state
  //         setUploadedFonts((prev) => [...prev, response.font.fontFamily])
  //         setBackendFonts((prev) => [...prev, {
  //           id: response.font.id,
  //           name: response.font.name,
  //           fontFamily: response.font.fontFamily,
  //           fileUrl: response.font.fileUrl,
  //           isOwner: true
  //         }])

  //         alert(`Font "${response.font.fontFamily}" uploaded successfully!`)

  //         // Load the font for immediate use
  //         if (fabricEditorRef.current) {
  //           const fontUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}${response.font.fileUrl}`
  //           await fabricEditorRef.current.loadFont(response.font.fontFamily, fontUrl)

  //           // Auto-apply the font to the currently selected text object
  //           if (selectedFabricObject && selectedFabricObject.type === "textbox") {
  //             fabricEditorRef.current.updateSelectedObject({ fontFamily: response.font.fontFamily })
  //             // Update the selected object to trigger re-render
  //             const activeObj = fabricEditorRef.current.canvas?.getActiveObject()
  //             if (activeObj) {
  //               setSelectedFabricObject(null)
  //               setTimeout(() => setSelectedFabricObject(activeObj), 0)
  //             }
  //           }
  //         }
  //       }
  //     } catch (error) {
  //       console.error("Font upload error:", error)
  //       alert("Failed to upload font. Please try again.")
  //     } finally {
  //       setIsUploadingFont(false)
  //       // Clear the input
  //       event.target.value = ""
  //     }
  //   }

  //   // Fabric.js event handlers
  //   const handleFabricObjectSelected = useCallback((obj: fabric.Object | null) => {
  //     setSelectedFabricObject(obj)

  //     // Auto-open element properties when an object is selected
  //     if (obj) {
  //       setActiveSidebarSection('element')
  //       setSidebarOpen(true)
  //     }
  //   }, [])

  //   const handleFabricObjectModified = useCallback(() => {
  //     if (!templateData || !fabricEditorRef.current) return

  //     const updatedElements = fabricEditorRef.current.exportTemplate()
  //     if (updatedElements) {
  //       setTemplateData({ ...templateData, elements: updatedElements })
  //     }
  //   }, [templateData])

  //   // Apply a brand to the canvas
  //   const applyBrand = (brand: Brand) => {
  //     setSelectedBrand(brand)
  //     setBrandData({
  //       name: brand.name,
  //       primaryColor: brand.primaryColor,
  //       secondaryColor: brand.secondaryColor,
  //       vibe: brand.vibe,
  //       voice: brand.voice,
  //       personality: brand.personality,
  //       targetAudience: brand.targetAudience,
  //       toneGuidelines: brand.toneGuidelines,
  //       keyValues: brand.keyValues,
  //       communicationStyle: brand.communicationStyle,
  //     })

  //     // Update template colors if template exists
  //     if (templateData && fabricEditorRef.current) {
  //       const updatedElements = templateData.elements.map((element) => {
  //         if (element.type === "text" && element.style) {
  //           return {
  //             ...element,
  //             style: {
  //               ...element.style,
  //               color: element.style.color === brandData?.primaryColor ? brand.primaryColor :
  //                 element.style.color === brandData?.secondaryColor ? brand.secondaryColor :
  //                   element.style.color,
  //               backgroundColor: element.style.backgroundColor === brandData?.primaryColor ? brand.primaryColor :
  //                 element.style.backgroundColor === brandData?.secondaryColor ? brand.secondaryColor :
  //                   element.style.backgroundColor,
  //             },
  //           }
  //         }
  //         return element
  //       })

  //       setTemplateData({ ...templateData, elements: updatedElements })
  //       fabricEditorRef.current.loadTemplate(updatedElements)
  //     }
  //   }

  //   // Enhanced social media format presets organized by categories
  //   const socialMediaFormats = {
  //     // Instagram
  //     "instagram-square": { width: 1080, height: 1080, name: "Instagram Square Post", category: "Instagram" },
  //     "instagram-portrait": { width: 1080, height: 1350, name: "Instagram Portrait Post", category: "Instagram" },
  //     "instagram-landscape": { width: 1080, height: 566, name: "Instagram Landscape Post", category: "Instagram" },
  //     "instagram-story": { width: 1080, height: 1920, name: "Instagram Story", category: "Instagram" },
  //     "instagram-reel": { width: 1080, height: 1920, name: "Instagram Reel", category: "Instagram" },
  //     "instagram-igtv-cover": { width: 420, height: 654, name: "Instagram IGTV Cover", category: "Instagram" },
  //     "instagram-highlight-cover": { width: 161, height: 161, name: "Instagram Highlight Cover", category: "Instagram" },

  //     // TikTok
  //     "tiktok-video": { width: 1080, height: 1920, name: "TikTok Video", category: "TikTok" },
  //     "tiktok-profile": { width: 200, height: 200, name: "TikTok Profile Picture", category: "TikTok" },

  //     // YouTube
  //     "youtube-thumbnail": { width: 1280, height: 720, name: "YouTube Thumbnail", category: "YouTube" },
  //     "youtube-shorts": { width: 1080, height: 1920, name: "YouTube Shorts", category: "YouTube" },
  //     "youtube-channel-art": { width: 2560, height: 1440, name: "YouTube Channel Art", category: "YouTube" },
  //     "youtube-profile": { width: 800, height: 800, name: "YouTube Profile Picture", category: "YouTube" },
  //     "youtube-end-screen": { width: 1280, height: 720, name: "YouTube End Screen", category: "YouTube" },

  //     // Facebook
  //     "facebook-post": { width: 1200, height: 630, name: "Facebook Post", category: "Facebook" },
  //     "facebook-story": { width: 1080, height: 1920, name: "Facebook Story", category: "Facebook" },
  //     "facebook-cover": { width: 1200, height: 315, name: "Facebook Cover Photo", category: "Facebook" },
  //     "facebook-profile": { width: 170, height: 170, name: "Facebook Profile Picture", category: "Facebook" },
  //     "facebook-event-cover": { width: 1920, height: 1080, name: "Facebook Event Cover", category: "Facebook" },
  //     "facebook-ad": { width: 1200, height: 628, name: "Facebook Ad", category: "Facebook" },

  //     // Twitter / X
  //     "twitter-post": { width: 1200, height: 675, name: "Twitter/X Post", category: "Twitter" },
  //     "twitter-header": { width: 1500, height: 500, name: "Twitter/X Header", category: "Twitter" },
  //     "twitter-profile": { width: 400, height: 400, name: "Twitter/X Profile Picture", category: "Twitter" },
  //     "twitter-card": { width: 1200, height: 628, name: "Twitter/X Card", category: "Twitter" },

  //     // LinkedIn
  //     "linkedin-post": { width: 1200, height: 627, name: "LinkedIn Post", category: "LinkedIn" },
  //     "linkedin-story": { width: 1080, height: 1920, name: "LinkedIn Story", category: "LinkedIn" },
  //     "linkedin-cover": { width: 1584, height: 396, name: "LinkedIn Cover Photo", category: "LinkedIn" },
  //     "linkedin-profile": { width: 400, height: 400, name: "LinkedIn Profile Picture", category: "LinkedIn" },
  //     "linkedin-company-logo": { width: 300, height: 300, name: "LinkedIn Company Logo", category: "LinkedIn" },
  //     "linkedin-ad": { width: 1200, height: 627, name: "LinkedIn Ad", category: "LinkedIn" },

  //     // Pinterest
  //     "pinterest-pin": { width: 1000, height: 1500, name: "Pinterest Pin (2:3)", category: "Pinterest" },
  //     "pinterest-square": { width: 1000, height: 1000, name: "Pinterest Square Pin", category: "Pinterest" },
  //     "pinterest-long": { width: 1000, height: 2100, name: "Pinterest Long Pin", category: "Pinterest" },
  //     "pinterest-board-cover": { width: 222, height: 150, name: "Pinterest Board Cover", category: "Pinterest" },

  //     // Standard
  //     "square-1-1": { width: 1080, height: 1080, name: "Square (1:1)", category: "Standard" },
  //     "landscape-16-9": { width: 1920, height: 1080, name: "Landscape (16:9)", category: "Standard" },
  //     "portrait-9-16": { width: 1080, height: 1920, name: "Portrait (9:16)", category: "Standard" },
  //     "wide-21-9": { width: 2560, height: 1080, name: "Ultra Wide (21:9)", category: "Standard" },

  //     // Print Materials
  //     "a4-portrait": { width: 2480, height: 3508, name: "A4 Portrait", category: "Print" },
  //     "a4-landscape": { width: 3508, height: 2480, name: "A4 Landscape", category: "Print" },
  //     "business-card": { width: 1050, height: 600, name: "Business Card", category: "Print" },
  //     postcard: { width: 1875, height: 1275, name: 'Postcard (6x4")', category: "Print" },
  //   }

  //   const [showResizePanel, setShowResizePanel] = useState(false)

  //   const handleResize = (formatKey?: string) => {
  //     if (!templateData || !fabricEditorRef.current) return

  //     let newWidth, newHeight, formatName

  //     if (formatKey && socialMediaFormats[formatKey as keyof typeof socialMediaFormats]) {
  //       const format = socialMediaFormats[formatKey as keyof typeof socialMediaFormats]
  //       newWidth = format.width
  //       newHeight = format.height
  //       formatName = format.name
  //     } else {
  //       // Default to 16:9 if no format specified
  //       newWidth = 1920
  //       newHeight = 1080
  //       formatName = "16:9 Landscape"
  //     }

  //     const scaleX = newWidth / templateData.width
  //     const scaleY = newHeight / templateData.height

  //     const resizedElements = templateData.elements.map((element) => ({
  //       ...element,
  //       x: element.x * scaleX,
  //       y: element.y * scaleY,
  //       width: element.width * scaleX,
  //       height: element.height * scaleY,
  //     }))

  //     const updatedTemplate = {
  //       ...templateData,
  //       width: newWidth,
  //       height: newHeight,
  //       elements: resizedElements,
  //     }

  //     setTemplateData(updatedTemplate)

  //     // Update the editor dimensions to match the new template size
  //     fabricEditorRef.current.resizeCanvas(newWidth, newHeight, templateData.width, templateData.height)

  //     setShowResizePanel(false)

  //     // Show success message
  //     console.log(`Resized to ${formatName}: ${newWidth}×${newHeight}px`)
  //   }

  //   const handleCustomResize = (width: number, height: number) => {
  //     if (!templateData || !fabricEditorRef.current) return

  //     const scaleX = width / templateData.width
  //     const scaleY = height / templateData.height

  //     const resizedElements = templateData.elements.map((element) => ({
  //       ...element,
  //       x: element.x * scaleX,
  //       y: element.y * scaleY,
  //       width: element.width * scaleX,
  //       height: element.height * scaleY,
  //     }))

  //     const updatedTemplate = {
  //       ...templateData,
  //       width: width,
  //       height: height,
  //       elements: resizedElements,
  //     }

  //     setTemplateData(updatedTemplate)

  //     // Update the editor dimensions to match the new template size
  //     fabricEditorRef.current.resizeCanvas(width, height, templateData.width, templateData.height)

  //     setShowResizePanel(false)

  //     // Show success message
  //     console.log(`Resized to custom size: ${width}×${height}px`)
  //   }

  //   const handleExport = () => {
  //     if (fabricEditorRef.current && fabricEditorRef.current.canvas) {
  //       const dataURL = fabricEditorRef.current.canvas.toDataURL({
  //         format: "png",
  //         quality: 1,
  //         multiplier: 2,
  //       })

  //       const brandName = selectedBrand?.name || brandData?.name || "design"
  //       const templateName = templateData?.name || "template"
  //       const filename = `${brandName}_${templateName}_${Date.now()}.png`

  //       const link = document.createElement("a")
  //       link.download = filename
  //       link.href = dataURL
  //       document.body.appendChild(link)
  //       link.click()
  //       document.body.removeChild(link)
  //     }
  //   }

  //   const getCanvasDimensions = () => {
  //     if (!templateData) return { width: 400, height: 400 }

  //     const maxWidth = 500
  //     const maxHeight = 500
  //     const aspectRatio = templateData.width / templateData.height

  //     let canvasWidth = maxWidth
  //     let canvasHeight = maxWidth / aspectRatio

  //     if (canvasHeight > maxHeight) {
  //       canvasHeight = maxHeight
  //       canvasWidth = maxHeight * aspectRatio
  //     }

  //     return {
  //       width: Math.round(canvasWidth),
  //       height: Math.round(canvasHeight),
  //     }
  //   }

  //   useEffect(() => {
  //     if (templateData && fabricEditorRef.current && templateData.elements) {
  //       fabricEditorRef.current.loadTemplate(templateData.elements)
  //     }
  //   }, [templateData])

  //   // Set up canvas event listeners for object selection and modification
  //   useEffect(() => {
  //     if (!fabricEditorRef.current?.canvas) return

  //     const canvas = fabricEditorRef.current.canvas

  //     const handleSelectionCreated = (e: any) => {
  //       const selected = e.selected?.[0]
  //       handleFabricObjectSelected(selected || null)
  //     }

  //     const handleSelectionUpdated = (e: any) => {
  //       const selected = e.selected?.[0]
  //       handleFabricObjectSelected(selected || null)
  //     }

  //     const handleSelectionCleared = () => {
  //       handleFabricObjectSelected(null)
  //     }

  //     const handleObjectModified = () => {
  //       handleFabricObjectModified()
  //     }

  //     // Add event listeners
  //     canvas.on('selection:created', handleSelectionCreated)
  //     canvas.on('selection:updated', handleSelectionUpdated)
  //     canvas.on('selection:cleared', handleSelectionCleared)
  //     canvas.on('object:modified', handleObjectModified)

  //     // Cleanup
  //     return () => {
  //       canvas.off('selection:created', handleSelectionCreated)
  //       canvas.off('selection:updated', handleSelectionUpdated)
  //       canvas.off('selection:cleared', handleSelectionCleared)
  //       canvas.off('object:modified', handleObjectModified)
  //     }
  //   }, [handleFabricObjectSelected, handleFabricObjectModified, fabricEditorRef.current?.canvas])

  //   // Close resize panel when clicking outside
  //   useEffect(() => {
  //     const handleClickOutside = (event: MouseEvent) => {
  //       if (showResizePanel) {
  //         const target = event.target as Element
  //         if (!target.closest(".resize-dropdown")) {
  //           setShowResizePanel(false)
  //         }
  //       }
  //     }

  //     document.addEventListener("mousedown", handleClickOutside)
  //     return () => {
  //       document.removeEventListener("mousedown", handleClickOutside)
  //     }
  //   }, [showResizePanel])

  //   // Close sidebar when clicking outside
  //   useEffect(() => {
  //     const handleClickOutsideSidebar = (event: MouseEvent) => {
  //       if (sidebarOpen) {
  //         const target = event.target as Element
  //         if (!target.closest(".sidebar-icon") && !target.closest(".sidebar-content")) {
  //           setSidebarOpen(false)
  //           setActiveSidebarSection(null)
  //         }
  //       }
  //     }

  //     document.addEventListener("mousedown", handleClickOutsideSidebar)
  //     return () => {
  //       document.removeEventListener("mousedown", handleClickOutsideSidebar)
  //     }
  //   }, [sidebarOpen])

  //   // Handle keyboard shortcuts
  //   useEffect(() => {
  //     const handleKeyDown = (event: KeyboardEvent) => {
  //       if (event.key === 'Escape' && sidebarOpen) {
  //         setSidebarOpen(false)
  //         setActiveSidebarSection(null)
  //       }
  //     }

  //     document.addEventListener('keydown', handleKeyDown)
  //     return () => {
  //       document.removeEventListener('keydown', handleKeyDown)
  //     }
  //   }, [sidebarOpen])


  //   if (!brandData || !templateData) {
  //     return (
  //       <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
  //         <div className="flex flex-col items-center gap-4">
  //           <div className="relative">
  //             <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl animate-pulse"></div>
  //             <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-xl opacity-20 animate-pulse"></div>
  //           </div>
  //           <div className="text-sm font-medium text-slate-500 tracking-wide">Loading your design workspace...</div>
  //         </div>
  //       </div>
  //     )
  //   }

  return (
    <>
      {/* interface SidebarSection {
      title: string
      items: SidebarItem[]
    }
    interface SidebarItem {
  id: string
  title: string
  href?: string
  children?: SidebarItem[]
} */}
      <Sidebar
        sections={[
          {
            title: "Brand",
            items: [
              {
                id: "brand",
                title: "Brand Settings",
                href: "/editor/brand",
              },
              {
                id: "apply-brand",
                title: "Apply Brand",
                href: "/editor/apply-brand",
              },
            ],
          },
          {
            title: "Templates",
            items: [
              {
                id: "templates",
                title: "Templates",
                href: "/editor/templates",
              },
            ],
          },
          {
            title: "AI Tools",
            items: [
              {
                id: "ai-tools",
                title: "AI Content Generation",
                href: "/editor/ai-tools",
              },
            ],
          },
        ]}

      />
      <main className="absolute top-0 left-0 pl-[var(--sidebar-width)] w-full h-full overflow-hidden">
        <Editor />
      </main>
    </>
  )
}
