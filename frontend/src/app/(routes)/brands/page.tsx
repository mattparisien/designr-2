"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Plus,
  Edit3,
  Trash2,
  Palette,
  MessageSquare,
  Users,
  Save,
  X,
  Wand2,
  Sparkles,
  Star,
  Building2,
} from "lucide-react"
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

const VIBE_OPTIONS = [
  { value: "professional", label: "Professional", description: "Clean, trustworthy, and reliable" },
  { value: "playful", label: "Playful", description: "Fun, energetic, and approachable" },
  { value: "elegant", label: "Elegant", description: "Sophisticated, refined, and luxurious" },
  { value: "bold", label: "Bold", description: "Strong, confident, and impactful" },
  { value: "minimal", label: "Minimal", description: "Simple, clean, and focused" },
]

export default function BrandsPage() {
  const router = useRouter()
  const apiClient = useMemo(() => new ApiClient(), [])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [formData, setFormData] = useState<{
    name: string
    primaryColor: string
    secondaryColor: string
    accentColor: string
    vibe: "playful" | "elegant" | "bold" | "minimal" | "professional"
    voice: string
    personality: string
    targetAudience: string
    toneGuidelines: string
    keyValues: string
    communicationStyle: string
    industry: string
    tagline: string
    doNotUse: string
    preferredWords: string[]
    avoidedWords: string[]
  }>({
    name: "",
    primaryColor: "#6366f1",
    secondaryColor: "#f59e0b",
    accentColor: "#10b981",
    vibe: "professional" as const,
    voice: "",
    personality: "",
    targetAudience: "",
    toneGuidelines: "",
    keyValues: "",
    communicationStyle: "",
    industry: "",
    tagline: "",
    doNotUse: "",
    preferredWords: [] as string[],
    avoidedWords: [] as string[],
  })

  // AI generation loading states
  const [isGenerating, setIsGenerating] = useState({
    voice: false,
    personality: false,
    targetAudience: false,
    toneGuidelines: false,
    keyValues: false,
    communicationStyle: false,
    tagline: false,
  })

  const loadBrands = useCallback(async () => {
    try {
      setLoading(true)
      const response = await apiClient.getBrands()
      setBrands(response.brands || [])
    } catch (error) {
      console.error("Failed to load brands:", error)
    } finally {
      setLoading(false)
    }
  }, [apiClient])

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      router.push("/auth/login")
      return
    }
    apiClient.setToken(token)
    loadBrands()
  }, [apiClient, router, loadBrands])

  const handleCreate = () => {
    setFormData({
      name: "",
      primaryColor: "#6366f1",
      secondaryColor: "#f59e0b",
      accentColor: "#10b981",
      vibe: "professional",
      voice: "Professional and engaging",
      personality: "Friendly and approachable",
      targetAudience: "General audience",
      toneGuidelines: "Use clear, concise language that resonates with the audience",
      keyValues: "Quality, innovation, customer satisfaction",
      communicationStyle: "Direct and informative",
      industry: "",
      tagline: "",
      doNotUse: "",
      preferredWords: [],
      avoidedWords: [],
    })
    setEditingBrand(null)
    setShowCreateModal(true)
  }

  const handleEdit = (brand: Brand) => {
    setFormData({
      name: brand.name,
      primaryColor: brand.primaryColor,
      secondaryColor: brand.secondaryColor,
      accentColor: brand.accentColor || "#10b981",
      vibe: brand.vibe,
      voice: brand.voice,
      personality: brand.personality,
      targetAudience: brand.targetAudience,
      toneGuidelines: brand.toneGuidelines,
      keyValues: brand.keyValues,
      communicationStyle: brand.communicationStyle,
      industry: brand.industry || "",
      tagline: brand.tagline || "",
      doNotUse: brand.doNotUse || "",
      preferredWords: brand.preferredWords || [],
      avoidedWords: brand.avoidedWords || [],
    })
    setEditingBrand(brand)
    setShowCreateModal(true)
  }

  const handleSave = async () => {
    try {
      if (editingBrand) {
        await apiClient.updateBrand(editingBrand._id, formData)
      } else {
        await apiClient.createBrand(formData)
      }
      setShowCreateModal(false)
      loadBrands()
    } catch (error) {
      console.error("Failed to save brand:", error)
      alert("Failed to save brand. Please try again.")
    }
  }

  const handleDelete = async (brandId: string) => {
    if (!confirm("Are you sure you want to delete this brand?")) return

    try {
      await apiClient.deleteBrand(brandId)
      loadBrands()
    } catch (error) {
      console.error("Failed to delete brand:", error)
      alert("Failed to delete brand. Please try again.")
    }
  }

  const addWord = (field: "preferredWords" | "avoidedWords", word: string) => {
    if (word.trim() && !formData[field].includes(word.trim())) {
      setFormData({
        ...formData,
        [field]: [...formData[field], word.trim()],
      })
    }
  }

  const removeWord = (field: "preferredWords" | "avoidedWords", index: number) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index),
    })
  }

  // AI generation functions
  const generateBrandField = async (field: keyof typeof isGenerating) => {
    if (!formData.name || !formData.industry) {
      alert("Please provide at least the brand name and industry before generating AI content.")
      return
    }

    // Check if already generating any field to prevent rate limiting
    const isAnyGenerating = Object.values(isGenerating).some(Boolean)
    if (isAnyGenerating) {
      alert("Please wait for the current AI generation to complete before starting another.")
      return
    }

    setIsGenerating((prev) => ({ ...prev, [field]: true }))

    try {
      const context = `
        Brand Name: ${formData.name}
        ${formData.industry ? `Industry: ${formData.industry}` : ""}
        Brand Vibe: ${formData.vibe}
        ${formData.tagline ? `Tagline: ${formData.tagline}` : ""}
        ${formData.voice ? `Current Voice: ${formData.voice}` : ""}
        ${formData.personality ? `Current Personality: ${formData.personality}` : ""}
        ${formData.targetAudience ? `Current Target Audience: ${formData.targetAudience}` : ""}
        ${formData.toneGuidelines ? `Current Tone Guidelines: ${formData.toneGuidelines}` : ""}
        ${formData.keyValues ? `Current Key Values: ${formData.keyValues}` : ""}
        ${formData.communicationStyle ? `Current Communication Style: ${formData.communicationStyle}` : ""}
        ${formData.doNotUse ? `Content to Avoid: ${formData.doNotUse}` : ""}
        ${
          formData.preferredWords && formData.preferredWords.length > 0
            ? `Preferred Words: ${formData.preferredWords.join(", ")}`
            : ""
        }
        ${
          formData.avoidedWords && formData.avoidedWords.length > 0
            ? `Words to Avoid: ${formData.avoidedWords.join(", ")}`
            : ""
        }
      `.trim()

      let prompt = ""
      switch (field) {
        case "voice":
          prompt = `Based on the brand information, generate a brand voice description (2-3 sentences, max 500 characters) that captures how this brand should sound when communicating. Focus on tone, personality, and communication approach.`
          break
        case "personality":
          prompt = `Based on the brand information, describe the brand's personality (2-3 sentences, max 500 characters) using adjectives and characteristics that would make this brand relatable and memorable.`
          break
        case "targetAudience":
          prompt = `Based on the brand information, describe the target audience (2-3 sentences, max 500 characters) including demographics, psychographics, and what motivates them.`
          break
        case "toneGuidelines":
          prompt = `Based on the brand information, create specific tone guidelines (3-4 sentences, max 1000 characters) that explain how the brand should communicate, what to emphasize, and what approach to take.`
          break
        case "keyValues":
          prompt = `Based on the brand information, identify 3-5 key brand values (in a single sentence, max 500 characters) that drive this brand's mission and resonate with its audience.`
          break
        case "communicationStyle":
          prompt = `Based on the brand information, describe the communication style (2-3 sentences, max 500 characters) including language complexity, formality level, and preferred communication methods.`
          break
        case "tagline":
          prompt = `Based on the brand information, create a memorable and impactful tagline (maximum 8 words, max 200 characters) that captures the brand's essence and value proposition.`
          break
      }

      const response = await apiClient.magicFill({
        prompt: `${context}\n\n${prompt}\n\nRespond with just the ${field} content, no additional explanation or formatting.`,
        vibe: formData.vibe,
        brandContext: {
          name: formData.name,
          industry: formData.industry,
          tagline: formData.tagline,
          voice: formData.voice,
          personality: formData.personality,
          targetAudience: formData.targetAudience,
          toneGuidelines: formData.toneGuidelines,
          keyValues: formData.keyValues,
          communicationStyle: formData.communicationStyle,
          doNotUse: formData.doNotUse,
          preferredWords: formData.preferredWords,
          avoidedWords: formData.avoidedWords,
        },
      })

      console.log(`AI response for ${field}:`, response)

      if (response.success && response.content) {
        // Extract the generated content
        let generatedContent = ""
        if (typeof response.content === "string") {
          // If the response is a plain string, use it directly
          generatedContent = response.content
        } else if (response.content[field]) {
          // If the AI returned an object with the field name as a key, use that value
          generatedContent = response.content[field]
        } else if (response.content.headline || response.content.bodyText) {
          // If it's a JSON object, try to extract meaningful content
          // For brand fields, prioritize headline as it's usually the main content
          generatedContent = response.content.headline || response.content.bodyText || ""
        } else {
          // Fallback to converting the entire response to string
          generatedContent = JSON.stringify(response.content)
        }

        // Apply character limits as safety measure
        const limits: { [key: string]: number } = {
          voice: 500,
          personality: 500,
          targetAudience: 500,
          toneGuidelines: 1000,
          keyValues: 500,
          communicationStyle: 500,
          tagline: 200,
        }

        const maxLength = limits[field]
        if (maxLength && generatedContent.length > maxLength) {
          generatedContent = generatedContent.substring(0, maxLength).trim()
          // If we cut off mid-sentence, try to end at the last complete sentence
          const lastPeriod = generatedContent.lastIndexOf(".")
          const lastExclamation = generatedContent.lastIndexOf("!")
          const lastQuestion = generatedContent.lastIndexOf("?")
          const lastSentenceEnd = Math.max(lastPeriod, lastExclamation, lastQuestion)
          if (lastSentenceEnd > maxLength * 0.7) {
            // Only trim to sentence if we don't lose too much
            generatedContent = generatedContent.substring(0, lastSentenceEnd + 1)
          }
        }

        setFormData((prev) => ({
          ...prev,
          [field]: generatedContent.trim(),
        }))
      } else {
        throw new Error("Failed to generate content")
      }
    } catch (error: unknown) {
      console.error(`Failed to generate ${field}:`, error)
      // Handle different error types
      const errorMessage = error instanceof Error ? error.message : String(error)
      const errorObj = error as { status?: number }

      if (errorMessage?.includes("429") || errorObj?.status === 429) {
        alert(`Rate limit reached. Please wait a moment before generating more content. Try again in 30-60 seconds.`)
      } else if (errorMessage?.includes("401") || errorObj?.status === 401) {
        alert("Authentication error. Please check your API credentials.")
      } else if (errorMessage?.includes("402") || errorObj?.status === 402) {
        alert("Quota exceeded. Please check your OpenAI billing and usage limits.")
      } else {
        alert(`Failed to generate ${field}. Please try again in a moment.`)
      }
    } finally {
      setIsGenerating((prev) => ({ ...prev, [field]: false }))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-xl opacity-20 animate-pulse"></div>
          </div>
          <div className="text-sm font-medium text-slate-500 tracking-wide">Loading brands...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-[1600px] mx-auto px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-8">
              <button
                onClick={() => router.push("/dashboard")}
                className="p-3 hover:bg-slate-100/60 rounded-2xl transition-all duration-300 text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Brand Management</h1>
                <p className="text-slate-500 text-sm font-medium tracking-wide">
                  Define your brand identity and voice for consistent designs
                </p>
              </div>
            </div>

            <button
              onClick={handleCreate}
              className="relative flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-4 rounded-2xl text-sm font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 tracking-wide hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              Create Brand
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur-xl opacity-20"></div>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-8 py-12">
        {brands.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-200 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
              <Palette className="w-10 h-10 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">No brands yet</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto text-lg leading-relaxed font-medium tracking-wide">
              Create your first brand to define your identity, colors, and voice for consistent design generation.
            </p>
            <button
              onClick={handleCreate}
              className="relative bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 tracking-wide"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5" />
                Create Your First Brand
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur-xl opacity-20"></div>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {brands.map((brand) => (
              <div
                key={brand._id}
                className="group bg-white rounded-3xl border border-slate-200/60 p-8 hover:shadow-2xl hover:shadow-slate-900/10 hover:border-slate-300/60 transition-all duration-500 hover:-translate-y-2"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-slate-900/10"
                      style={{ backgroundColor: brand.primaryColor }}
                    >
                      {brand.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-1">{brand.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500 bg-slate-100/80 px-3 py-1.5 rounded-xl capitalize font-semibold tracking-wide">
                          {brand.vibe}
                        </span>
                        {brand.industry && (
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Building2 className="w-3 h-3" />
                            <span className="text-xs font-medium tracking-wide">{brand.industry}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                    <button
                      onClick={() => handleEdit(brand)}
                      className="p-3 hover:bg-slate-100/60 rounded-2xl transition-all duration-300 text-slate-400 hover:text-slate-600"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(brand._id)}
                      className="p-3 hover:bg-red-50 rounded-2xl transition-all duration-300 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                      <div
                        className="w-4 h-4 rounded-full shadow-sm ring-1 ring-white"
                        style={{ backgroundColor: brand.primaryColor }}
                      />
                      <div
                        className="w-4 h-4 rounded-full shadow-sm ring-1 ring-white"
                        style={{ backgroundColor: brand.secondaryColor }}
                      />
                      {brand.accentColor && (
                        <div
                          className="w-4 h-4 rounded-full shadow-sm ring-1 ring-white"
                          style={{ backgroundColor: brand.accentColor }}
                        />
                      )}
                    </div>
                  </div>

                  {brand.tagline && (
                    <p className="text-sm text-slate-600 italic font-medium leading-relaxed">
                      &ldquo;{brand.tagline}&rdquo;
                    </p>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MessageSquare className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-600 font-medium leading-relaxed line-clamp-2">
                        {brand.voice}
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-600 font-medium leading-relaxed line-clamp-2">
                        {brand.targetAudience}
                      </span>
                    </div>
                  </div>

                  {brand.keyValues && (
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-3 h-3 text-slate-400" />
                        <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">Key Values</span>
                      </div>
                      <p className="text-sm text-slate-600 font-medium leading-relaxed line-clamp-2">
                        {brand.keyValues}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200/60 w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-slate-900/20">
            <div className="sticky top-0 bg-white/95 backdrop-blur-xl p-8 border-b border-slate-200/60 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {editingBrand ? "Edit Brand" : "Create New Brand"}
                  </h3>
                  <p className="text-slate-500 font-medium tracking-wide mt-1">
                    Define your brand identity for consistent designs
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-3 hover:bg-slate-100/60 rounded-2xl transition-all duration-300 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-10">
              {/* AI Helper Notice */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200/60 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Wand2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-slate-900 mb-2 tracking-tight">
                      AI-Powered Brand Building
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium mb-3">
                      Fill in your brand name and industry first, then use the{" "}
                      <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg font-semibold">
                        <Wand2 className="w-3 h-3" />
                        AI
                      </span>{" "}
                      buttons to automatically generate professional brand voice, personality, target audience, and more
                      based on your information.
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      💡 <strong>Tip:</strong> Generate one field at a time to avoid rate limits. Wait for each
                      generation to complete before starting the next.
                    </p>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="space-y-6">
                <h4 className="text-xl font-bold text-slate-900 flex items-center gap-3 tracking-tight">
                  <Palette className="w-6 h-6 text-indigo-500" />
                  Basic Information
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3 tracking-wide">
                      Brand Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-4 bg-white border border-slate-200/60 rounded-2xl text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/60 transition-all duration-300 font-medium tracking-wide shadow-sm hover:shadow-md hover:border-slate-300/60"
                      placeholder="Enter brand name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3 tracking-wide">Industry</label>
                    <input
                      type="text"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="w-full px-4 py-4 bg-white border border-slate-200/60 rounded-2xl text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/60 transition-all duration-300 font-medium tracking-wide shadow-sm hover:shadow-md hover:border-slate-300/60"
                      placeholder="e.g., Technology, Fashion, Food"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-slate-700 tracking-wide">Tagline</label>
                    <button
                      onClick={() => generateBrandField("tagline")}
                      disabled={isGenerating.tagline || !formData.name || !formData.industry}
                      className="flex items-center gap-2 px-3 py-2 text-xs bg-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold tracking-wide"
                      title="Generate with AI"
                    >
                      <Wand2 className="w-3 h-3" />
                      {isGenerating.tagline ? "Generating..." : "AI"}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    className="w-full px-4 py-4 bg-white border border-slate-200/60 rounded-2xl text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/60 transition-all duration-300 font-medium tracking-wide shadow-sm hover:shadow-md hover:border-slate-300/60"
                    placeholder="Your brand's memorable tagline"
                  />
                </div>
              </div>

              {/* Brand Colors */}
              <div className="space-y-6">
                <h4 className="text-xl font-bold text-slate-900 tracking-tight">Brand Colors</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3 tracking-wide">
                      Primary Color *
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="w-16 h-16 rounded-2xl border border-slate-200/60 bg-transparent cursor-pointer shadow-sm hover:shadow-md transition-all duration-300"
                      />
                      <input
                        type="text"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="flex-1 px-4 py-3 bg-white border border-slate-200/60 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/60 transition-all duration-300 font-medium tracking-wide shadow-sm hover:shadow-md hover:border-slate-300/60"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3 tracking-wide">
                      Secondary Color *
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="color"
                        value={formData.secondaryColor}
                        onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                        className="w-16 h-16 rounded-2xl border border-slate-200/60 bg-transparent cursor-pointer shadow-sm hover:shadow-md transition-all duration-300"
                      />
                      <input
                        type="text"
                        value={formData.secondaryColor}
                        onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                        className="flex-1 px-4 py-3 bg-white border border-slate-200/60 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/60 transition-all duration-300 font-medium tracking-wide shadow-sm hover:shadow-md hover:border-slate-300/60"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3 tracking-wide">
                      Accent Color
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="color"
                        value={formData.accentColor}
                        onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                        className="w-16 h-16 rounded-2xl border border-slate-200/60 bg-transparent cursor-pointer shadow-sm hover:shadow-md transition-all duration-300"
                      />
                      <input
                        type="text"
                        value={formData.accentColor}
                        onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                        className="flex-1 px-4 py-3 bg-white border border-slate-200/60 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/60 transition-all duration-300 font-medium tracking-wide shadow-sm hover:shadow-md hover:border-slate-300/60"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Brand Vibe */}
              <div className="space-y-6">
                <h4 className="text-xl font-bold text-slate-900 tracking-tight">Brand Vibe</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {VIBE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFormData({ ...formData, vibe: option.value as typeof formData.vibe })}
                      className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left shadow-sm hover:shadow-md ${
                        formData.vibe === option.value
                          ? "border-indigo-500 bg-indigo-50 shadow-indigo-500/10"
                          : "border-slate-200/60 bg-white hover:bg-slate-50 hover:border-slate-300/60"
                      }`}
                    >
                      <div className="font-semibold text-slate-900 mb-2 tracking-tight">{option.label}</div>
                      <div className="text-sm text-slate-600 font-medium leading-relaxed">{option.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand Voice & Personality */}
              <div className="space-y-6">
                <h4 className="text-xl font-bold text-slate-900 flex items-center gap-3 tracking-tight">
                  <MessageSquare className="w-6 h-6 text-indigo-500" />
                  Brand Voice & Personality
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-semibold text-slate-700 tracking-wide">
                        Brand Voice *{" "}
                        <span className="text-xs text-slate-500 font-medium">({formData.voice.length}/500)</span>
                      </label>
                      <button
                        onClick={() => generateBrandField("voice")}
                        disabled={isGenerating.voice || !formData.name || !formData.industry}
                        className="flex items-center gap-2 px-3 py-2 text-xs bg-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold tracking-wide"
                        title="Generate with AI"
                      >
                        <Wand2 className="w-3 h-3" />
                        {isGenerating.voice ? "Generating..." : "AI"}
                      </button>
                    </div>
                    <textarea
                      value={formData.voice}
                      onChange={(e) => setFormData({ ...formData, voice: e.target.value })}
                      className={`w-full px-4 py-4 bg-white border rounded-2xl text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/60 transition-all duration-300 resize-none font-medium tracking-wide shadow-sm hover:shadow-md ${
                        formData.voice.length > 500
                          ? "border-red-500 hover:border-red-600"
                          : "border-slate-200/60 hover:border-slate-300/60"
                      }`}
                      rows={4}
                      placeholder="e.g., Professional and engaging, with a touch of humor"
                      maxLength={500}
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-semibold text-slate-700 tracking-wide">
                        Brand Personality *{" "}
                        <span className="text-xs text-slate-500 font-medium">({formData.personality.length}/500)</span>
                      </label>
                      <button
                        onClick={() => generateBrandField("personality")}
                        disabled={isGenerating.personality || !formData.name || !formData.industry}
                        className="flex items-center gap-2 px-3 py-2 text-xs bg-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold tracking-wide"
                        title="Generate with AI"
                      >
                        <Wand2 className="w-3 h-3" />
                        {isGenerating.personality ? "Generating..." : "AI"}
                      </button>
                    </div>
                    <textarea
                      value={formData.personality}
                      onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                      className={`w-full px-4 py-4 bg-white border rounded-2xl text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/60 transition-all duration-300 resize-none font-medium tracking-wide shadow-sm hover:shadow-md ${
                        formData.personality.length > 500
                          ? "border-red-500 hover:border-red-600"
                          : "border-slate-200/60 hover:border-slate-300/60"
                      }`}
                      rows={4}
                      placeholder="e.g., Friendly, approachable, innovative, trustworthy"
                      maxLength={500}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-semibold text-slate-700 tracking-wide">
                        Target Audience *{" "}
                        <span className="text-xs text-slate-500 font-medium">
                          ({formData.targetAudience.length}/500)
                        </span>
                      </label>
                      <button
                        onClick={() => generateBrandField("targetAudience")}
                        disabled={isGenerating.targetAudience || !formData.name || !formData.industry}
                        className="flex items-center gap-2 px-3 py-2 text-xs bg-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold tracking-wide"
                        title="Generate with AI"
                      >
                        <Wand2 className="w-3 h-3" />
                        {isGenerating.targetAudience ? "Generating..." : "AI"}
                      </button>
                    </div>
                    <textarea
                      value={formData.targetAudience}
                      onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                      className={`w-full px-4 py-4 bg-white border rounded-2xl text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/60 transition-all duration-300 resize-none font-medium tracking-wide shadow-sm hover:shadow-md ${
                        formData.targetAudience.length > 500
                          ? "border-red-500 hover:border-red-600"
                          : "border-slate-200/60 hover:border-slate-300/60"
                      }`}
                      rows={4}
                      placeholder="e.g., Young professionals aged 25-35 who value innovation"
                      maxLength={500}
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-semibold text-slate-700 tracking-wide">
                        Communication Style *{" "}
                        <span className="text-xs text-slate-500 font-medium">
                          ({formData.communicationStyle.length}/500)
                        </span>
                      </label>
                      <button
                        onClick={() => generateBrandField("communicationStyle")}
                        disabled={isGenerating.communicationStyle || !formData.name || !formData.industry}
                        className="flex items-center gap-2 px-3 py-2 text-xs bg-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold tracking-wide"
                        title="Generate with AI"
                      >
                        <Wand2 className="w-3 h-3" />
                        {isGenerating.communicationStyle ? "Generating..." : "AI"}
                      </button>
                    </div>
                    <textarea
                      value={formData.communicationStyle}
                      onChange={(e) => setFormData({ ...formData, communicationStyle: e.target.value })}
                      className={`w-full px-4 py-4 bg-white border rounded-2xl text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/60 transition-all duration-300 resize-none font-medium tracking-wide shadow-sm hover:shadow-md ${
                        formData.communicationStyle.length > 500
                          ? "border-red-500 hover:border-red-600"
                          : "border-slate-200/60 hover:border-slate-300/60"
                      }`}
                      rows={4}
                      placeholder="e.g., Direct and informative, but warm and encouraging"
                      maxLength={500}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Guidelines */}
              <div className="space-y-6">
                <h4 className="text-xl font-bold text-slate-900 tracking-tight">Guidelines & Values</h4>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-slate-700 tracking-wide">
                      Tone Guidelines *{" "}
                      <span className="text-xs text-slate-500 font-medium">
                        ({formData.toneGuidelines.length}/1000)
                      </span>
                    </label>
                    <button
                      onClick={() => generateBrandField("toneGuidelines")}
                      disabled={isGenerating.toneGuidelines || !formData.name || !formData.industry}
                      className="flex items-center gap-2 px-3 py-2 text-xs bg-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold tracking-wide"
                      title="Generate with AI"
                    >
                      <Wand2 className="w-3 h-3" />
                      {isGenerating.toneGuidelines ? "Generating..." : "AI"}
                    </button>
                  </div>
                  <textarea
                    value={formData.toneGuidelines}
                    onChange={(e) => setFormData({ ...formData, toneGuidelines: e.target.value })}
                    className={`w-full px-4 py-4 bg-white border rounded-2xl text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/60 transition-all duration-300 resize-none font-medium tracking-wide shadow-sm hover:shadow-md ${
                      formData.toneGuidelines.length > 1000
                        ? "border-red-500 hover:border-red-600"
                        : "border-slate-200/60 hover:border-slate-300/60"
                    }`}
                    rows={4}
                    placeholder="Specific guidelines on how to communicate"
                    maxLength={1000}
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-slate-700 tracking-wide">
                      Key Values *{" "}
                      <span className="text-xs text-slate-500 font-medium">({formData.keyValues.length}/500)</span>
                    </label>
                    <button
                      onClick={() => generateBrandField("keyValues")}
                      disabled={isGenerating.keyValues || !formData.name || !formData.industry}
                      className="flex items-center gap-2 px-3 py-2 text-xs bg-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold tracking-wide"
                      title="Generate with AI"
                    >
                      <Wand2 className="w-3 h-3" />
                      {isGenerating.keyValues ? "Generating..." : "AI"}
                    </button>
                  </div>
                  <textarea
                    value={formData.keyValues}
                    onChange={(e) => setFormData({ ...formData, keyValues: e.target.value })}
                    className={`w-full px-4 py-4 bg-white border rounded-2xl text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/60 transition-all duration-300 resize-none font-medium tracking-wide shadow-sm hover:shadow-md ${
                      formData.keyValues.length > 500
                        ? "border-red-500 hover:border-red-600"
                        : "border-slate-200/60 hover:border-slate-300/60"
                    }`}
                    rows={4}
                    placeholder="Core values that drive your brand"
                    maxLength={500}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3 tracking-wide">
                    What Not to Do
                  </label>
                  <textarea
                    value={formData.doNotUse}
                    onChange={(e) => setFormData({ ...formData, doNotUse: e.target.value })}
                    className="w-full px-4 py-4 bg-white border border-slate-200/60 rounded-2xl text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/60 transition-all duration-300 resize-none font-medium tracking-wide shadow-sm hover:shadow-md hover:border-slate-300/60"
                    rows={4}
                    placeholder="Things to avoid in communication"
                  />
                </div>
              </div>

              {/* Word Lists */}
              <div className="space-y-6">
                <h4 className="text-xl font-bold text-slate-900 tracking-tight">Language Preferences</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3 tracking-wide">
                      Preferred Words
                    </label>
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <input
                          type="text"
                          placeholder="Add a preferred word"
                          className="flex-1 px-4 py-3 bg-white border border-slate-200/60 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/60 transition-all duration-300 font-medium tracking-wide shadow-sm hover:shadow-md hover:border-slate-300/60"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              addWord("preferredWords", e.currentTarget.value)
                              e.currentTarget.value = ""
                            }
                          }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.preferredWords.map((word, index) => (
                          <span
                            key={index}
                            className="bg-emerald-100 text-emerald-700 px-3 py-2 rounded-xl text-sm flex items-center gap-2 font-semibold tracking-wide"
                          >
                            {word}
                            <button
                              onClick={() => removeWord("preferredWords", index)}
                              className="hover:text-emerald-900 transition-colors duration-200"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3 tracking-wide">
                      Words to Avoid
                    </label>
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <input
                          type="text"
                          placeholder="Add a word to avoid"
                          className="flex-1 px-4 py-3 bg-white border border-slate-200/60 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/60 transition-all duration-300 font-medium tracking-wide shadow-sm hover:shadow-md hover:border-slate-300/60"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              addWord("avoidedWords", e.currentTarget.value)
                              e.currentTarget.value = ""
                            }
                          }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.avoidedWords.map((word, index) => (
                          <span
                            key={index}
                            className="bg-red-100 text-red-700 px-3 py-2 rounded-xl text-sm flex items-center gap-2 font-semibold tracking-wide"
                          >
                            {word}
                            <button
                              onClick={() => removeWord("avoidedWords", index)}
                              className="hover:text-red-900 transition-colors duration-200"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white/95 backdrop-blur-xl p-8 border-t border-slate-200/60 rounded-b-3xl">
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-8 py-4 border border-slate-200/60 rounded-2xl font-semibold hover:bg-slate-50 transition-all duration-300 text-slate-700 tracking-wide shadow-sm hover:shadow-md hover:border-slate-300/60"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!formData.name || !formData.primaryColor || !formData.secondaryColor}
                  className="relative bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 transition-all duration-300 shadow-lg shadow-indigo-500/25 tracking-wide hover:shadow-xl hover:shadow-indigo-500/30"
                >
                  <Save className="w-4 h-4" />
                  {editingBrand ? "Update Brand" : "Create Brand"}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur-xl opacity-20"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
