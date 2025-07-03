"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Filter,
  Wand2,
  Download,
  Settings,
  CreditCard,
  Palette,
  Plus,
  Grid3X3,
  List,
  Star,
  Clock,
  Sparkles,
} from "lucide-react"

// Mock template data - in a real app, this would come from your API
const mockTemplates = [
  {
    id: 1,
    name: "Instagram Post - Product Launch",
    vibe: "bold",
    thumbnail: "/api/placeholder/300/300",
    category: "Social Media",
    isPopular: true,
    lastUsed: "2 days ago",
  },
  {
    id: 2,
    name: "Social Media - Quote",
    vibe: "elegant",
    thumbnail: "/api/placeholder/300/300",
    category: "Social Media",
    isPopular: false,
    lastUsed: "1 week ago",
  },
  {
    id: 3,
    name: "Event Promotion",
    vibe: "playful",
    thumbnail: "/api/placeholder/300/300",
    category: "Marketing",
    isPopular: true,
    lastUsed: "3 days ago",
  },
  {
    id: 4,
    name: "Business Card",
    vibe: "professional",
    thumbnail: "/api/placeholder/300/300",
    category: "Print",
    isPopular: false,
    lastUsed: "1 month ago",
  },
  {
    id: 5,
    name: "Story Template",
    vibe: "minimal",
    thumbnail: "/api/placeholder/300/300",
    category: "Social Media",
    isPopular: true,
    lastUsed: "1 day ago",
  },
  {
    id: 6,
    name: "Sale Announcement",
    vibe: "bold",
    thumbnail: "/api/placeholder/300/300",
    category: "Marketing",
    isPopular: false,
    lastUsed: "5 days ago",
  },
  {
    id: 7,
    name: "Thank You Post",
    vibe: "elegant",
    thumbnail: "/api/placeholder/300/300",
    category: "Social Media",
    isPopular: true,
    lastUsed: "4 days ago",
  },
  {
    id: 8,
    name: "Behind the Scenes",
    vibe: "playful",
    thumbnail: "/api/placeholder/300/300",
    category: "Social Media",
    isPopular: false,
    lastUsed: "2 weeks ago",
  },
]

interface BrandData {
  name: string
  primaryColor: string
  secondaryColor: string
  vibe: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [brandData, setBrandData] = useState<BrandData | null>(null)
  const [templates] = useState(mockTemplates)
  const [filteredTemplates, setFilteredTemplates] = useState(mockTemplates)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedVibe, setSelectedVibe] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    // Load brand data from localStorage
    const storedBrandData = localStorage.getItem("brandData")
    if (storedBrandData) {
      const parsed = JSON.parse(storedBrandData)
      setBrandData(parsed)

      // Filter templates by user's vibe by default
      if (parsed.vibe && parsed.vibe !== "all") {
        setSelectedVibe(parsed.vibe)
        const filtered = mockTemplates.filter((template) => template.vibe === parsed.vibe)
        setFilteredTemplates(filtered)
      }
    } else {
      // Mock brand data for demo
      setBrandData({
        name: "Acme Studio",
        primaryColor: "#6366f1",
        secondaryColor: "#f59e0b",
        vibe: "professional",
      })
    }
  }, [router])

  useEffect(() => {
    let filtered = templates

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (template) =>
          template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          template.category.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by vibe
    if (selectedVibe && selectedVibe !== "all") {
      filtered = filtered.filter((template) => template.vibe === selectedVibe)
    }

    setFilteredTemplates(filtered)
  }, [searchTerm, selectedVibe, templates])

  const handleTemplateSelect = (templateId: number) => {
    // Navigate to editor with template
    router.push(`/editor/${templateId}`)
  }

  if (!brandData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-xl opacity-20 animate-pulse"></div>
          </div>
          <div className="text-sm font-medium text-slate-500 tracking-wide">Loading workspace...</div>
        </div>
      </div>
    )
  }

  const recentTemplates = templates
    .filter((t) => ["1 day ago", "2 days ago", "3 days ago"].includes(t.lastUsed))
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-[1600px] mx-auto px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-12">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                    <div className="w-5 h-5 bg-white rounded-lg opacity-90"></div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-20"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">DesignTool</h1>
                  <div className="text-xs text-slate-500 font-medium tracking-wide">Creative Studio</div>
                </div>
              </div>

              <div className="flex items-center gap-4 px-4 py-2.5 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-2xl border border-slate-200/60 shadow-sm">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full shadow-sm ring-2 ring-white/80"
                    style={{ backgroundColor: brandData.primaryColor }}
                  ></div>
                  <div
                    className="w-3 h-3 rounded-full shadow-sm ring-1 ring-white/60"
                    style={{ backgroundColor: brandData.secondaryColor }}
                  ></div>
                </div>
                <div className="w-px h-4 bg-slate-300"></div>
                <span className="text-sm font-semibold text-slate-700 tracking-wide">{brandData.name}</span>
                <div className="text-xs text-slate-500 bg-slate-200/60 px-2 py-1 rounded-lg font-medium capitalize tracking-wide">
                  {brandData.vibe}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/brands")}
                className="flex items-center gap-2.5 px-4 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 rounded-xl transition-all duration-300 font-medium tracking-wide"
              >
                <Palette className="w-4 h-4" />
                <span className="text-sm">Brands</span>
              </button>

              <div className="w-px h-6 bg-slate-200"></div>

              <button className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100/60 rounded-xl transition-all duration-300">
                <Settings className="w-4 h-4" />
              </button>
              <button className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100/60 rounded-xl transition-all duration-300">
                <CreditCard className="w-4 h-4" />
              </button>

              <button className="relative bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:from-slate-800 hover:to-slate-700 transition-all duration-300 shadow-lg shadow-slate-900/25 tracking-wide">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Upgrade to Pro
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl blur-xl opacity-20"></div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Good morning, {brandData.name}</h2>
            <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse"></div>
          </div>
          <p className="text-lg text-slate-600 font-medium tracking-wide max-w-2xl leading-relaxed">
            Ready to create something extraordinary? Choose from our curated collection of templates designed for your
            brand.
          </p>
        </div>

        {/* Recent Templates */}
        {recentTemplates.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <Clock className="w-5 h-5 text-slate-400" />
              <h3 className="text-lg font-semibold text-slate-900 tracking-tight">Continue where you left off</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentTemplates.map((template) => (
                <div
                  key={`recent-${template.id}`}
                  onClick={() => handleTemplateSelect(template.id)}
                  className="group relative bg-white rounded-3xl border border-slate-200/60 overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-slate-900/10 hover:border-slate-300/60 transition-all duration-500 hover:-translate-y-1"
                >
                  <div className="aspect-[16/10] bg-gradient-to-br from-slate-50 via-white to-slate-100 relative overflow-hidden">
                    <div className="absolute inset-6 rounded-2xl bg-white shadow-lg shadow-slate-900/5 flex items-center justify-center border border-slate-100">
                      <div
                        className="w-20 h-20 rounded-2xl opacity-20 group-hover:opacity-30 transition-all duration-500 group-hover:scale-110"
                        style={{ backgroundColor: brandData.primaryColor }}
                      ></div>
                    </div>
                    <div className="absolute top-4 right-4">
                      <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 shadow-lg shadow-slate-900/10 tracking-wide">
                        {template.lastUsed}
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="font-semibold text-slate-900 text-base mb-2 tracking-tight leading-tight group-hover:text-slate-700 transition-colors duration-300">
                      {template.name}
                    </h4>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500 font-medium tracking-wide">{template.category}</span>
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-3 h-3 rounded-full shadow-sm ring-1 ring-white"
                          style={{ backgroundColor: brandData.primaryColor }}
                        ></div>
                        <div
                          className="w-2.5 h-2.5 rounded-full shadow-sm ring-1 ring-white"
                          style={{ backgroundColor: brandData.secondaryColor }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Controls Bar */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search templates and categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-96 pl-12 pr-6 py-4 bg-white border border-slate-200/60 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/60 transition-all duration-300 text-sm placeholder:text-slate-400 font-medium tracking-wide shadow-sm hover:shadow-md hover:border-slate-300/60"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-slate-400" />
              <select
                value={selectedVibe}
                onChange={(e) => setSelectedVibe(e.target.value)}
                className="px-4 py-4 bg-white border border-slate-200/60 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/60 transition-all duration-300 text-sm text-slate-700 font-medium tracking-wide shadow-sm hover:shadow-md hover:border-slate-300/60 cursor-pointer"
              >
                <option value="all">All Styles</option>
                <option value="playful">Playful</option>
                <option value="elegant">Elegant</option>
                <option value="bold">Bold</option>
                <option value="minimal">Minimal</option>
                <option value="professional">Professional</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex items-center bg-slate-100/80 rounded-2xl p-1.5 shadow-sm">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-3 rounded-xl transition-all duration-300 font-medium tracking-wide ${
                  viewMode === "grid"
                    ? "bg-white text-slate-900 shadow-md shadow-slate-900/10"
                    : "text-slate-500 hover:text-slate-700 hover:bg-white/60"
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-3 rounded-xl transition-all duration-300 font-medium tracking-wide ${
                  viewMode === "list"
                    ? "bg-white text-slate-900 shadow-md shadow-slate-900/10"
                    : "text-slate-500 hover:text-slate-700 hover:bg-white/60"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Create New */}
            <button 
              onClick={() => router.push('/editor/new')}
              className="relative flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-4 rounded-2xl text-sm font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 tracking-wide hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              Create New Design
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur-xl opacity-20"></div>
            </button>
          </div>
        </div>

        {/* All Templates Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-8">
            <h3 className="text-xl font-semibold text-slate-900 tracking-tight">All Templates</h3>
            <div className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-xl text-sm font-semibold tracking-wide">
              {filteredTemplates.length}
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => handleTemplateSelect(template.id)}
                className="group relative bg-white rounded-3xl border border-slate-200/60 overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-slate-900/10 hover:border-slate-300/60 transition-all duration-500 hover:-translate-y-2"
              >
                {template.isPopular && (
                  <div className="absolute top-4 left-4 z-10">
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-amber-500/25 tracking-wide">
                      <Star className="w-3 h-3 fill-current" />
                      Popular
                    </div>
                  </div>
                )}

                <div className="aspect-[4/3] bg-gradient-to-br from-slate-50 via-white to-slate-100 relative overflow-hidden">
                  {/* Template Preview */}
                  <div className="absolute inset-6 rounded-2xl bg-white shadow-lg shadow-slate-900/5 flex items-center justify-center border border-slate-100">
                    <div
                      className="w-20 h-20 rounded-2xl opacity-20 group-hover:opacity-30 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                      style={{ backgroundColor: brandData.primaryColor }}
                    ></div>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                    <div className="flex gap-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <button className="bg-white/95 backdrop-blur-sm text-slate-700 p-3 rounded-2xl shadow-xl shadow-slate-900/20 hover:bg-white hover:scale-110 transition-all duration-300">
                        <Wand2 className="w-5 h-5" />
                      </button>
                      <button className="bg-white/95 backdrop-blur-sm text-slate-700 p-3 rounded-2xl shadow-xl shadow-slate-900/20 hover:bg-white hover:scale-110 transition-all duration-300">
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-slate-900 text-base leading-tight group-hover:text-slate-700 transition-colors duration-300 tracking-tight">
                      {template.name}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 bg-slate-100/80 px-3 py-1.5 rounded-xl capitalize font-semibold tracking-wide">
                        {template.vibe}
                      </span>
                      <span className="text-xs text-slate-400 font-medium tracking-wide">{template.category}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-3 h-3 rounded-full shadow-sm ring-1 ring-white"
                        style={{ backgroundColor: brandData.primaryColor }}
                      ></div>
                      <div
                        className="w-2.5 h-2.5 rounded-full shadow-sm ring-1 ring-white"
                        style={{ backgroundColor: brandData.secondaryColor }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-3">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => handleTemplateSelect(template.id)}
                className="group bg-white rounded-2xl border border-slate-200/60 p-6 cursor-pointer hover:shadow-xl hover:shadow-slate-900/5 hover:border-slate-300/60 transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl flex items-center justify-center shadow-sm">
                      <div
                        className="w-8 h-8 rounded-lg opacity-30 group-hover:opacity-40 transition-opacity duration-300"
                        style={{ backgroundColor: brandData.primaryColor }}
                      ></div>
                    </div>
                    {template.isPopular && (
                      <div className="absolute -top-1 -right-1">
                        <Star className="w-4 h-4 text-amber-500 fill-current" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 text-base mb-2 tracking-tight">{template.name}</h3>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-slate-500 bg-slate-100/80 px-3 py-1.5 rounded-xl capitalize font-semibold tracking-wide">
                        {template.vibe}
                      </span>
                      <span className="text-sm text-slate-400 font-medium tracking-wide">{template.category}</span>
                      <span className="text-xs text-slate-400 font-medium tracking-wide">
                        Last used {template.lastUsed}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                    <button className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100/60 rounded-2xl transition-all duration-300">
                      <Wand2 className="w-5 h-5" />
                    </button>
                    <button className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100/60 rounded-2xl transition-all duration-300">
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-24">
            <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">No templates found</h3>
            <p className="text-slate-500 max-w-md mx-auto text-lg leading-relaxed font-medium tracking-wide">
              We could not find any templates matching your criteria. Try adjusting your search terms or browse different
              style categories.
            </p>
            <button
              onClick={() => {
                setSearchTerm("")
                setSelectedVibe("all")
              }}
              className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 tracking-wide"
            >
              Clear Filters
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
