'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, Wand2, Download, Settings, CreditCard, Palette } from 'lucide-react';

// Mock template data - in a real app, this would come from your API
const mockTemplates = [
  { id: 1, name: 'Instagram Post - Product Launch', vibe: 'bold', thumbnail: '/api/placeholder/300/300' },
  { id: 2, name: 'Social Media - Quote', vibe: 'elegant', thumbnail: '/api/placeholder/300/300' },
  { id: 3, name: 'Event Promotion', vibe: 'playful', thumbnail: '/api/placeholder/300/300' },
  { id: 4, name: 'Business Card', vibe: 'professional', thumbnail: '/api/placeholder/300/300' },
  { id: 5, name: 'Story Template', vibe: 'minimal', thumbnail: '/api/placeholder/300/300' },
  { id: 6, name: 'Sale Announcement', vibe: 'bold', thumbnail: '/api/placeholder/300/300' },
  { id: 7, name: 'Thank You Post', vibe: 'elegant', thumbnail: '/api/placeholder/300/300' },
  { id: 8, name: 'Behind the Scenes', vibe: 'playful', thumbnail: '/api/placeholder/300/300' },
];

interface BrandData {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  vibe: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [brandData, setBrandData] = useState<BrandData | null>(null);
  const [templates] = useState(mockTemplates);
  const [filteredTemplates, setFilteredTemplates] = useState(mockTemplates);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVibe, setSelectedVibe] = useState('all');

  useEffect(() => {
    // Load brand data from localStorage
    const storedBrandData = localStorage.getItem('brandData');
    if (storedBrandData) {
      const parsed = JSON.parse(storedBrandData);
      setBrandData(parsed);
      
      // Filter templates by user's vibe by default
      if (parsed.vibe && parsed.vibe !== 'all') {
        setSelectedVibe(parsed.vibe);
        const filtered = mockTemplates.filter(template => template.vibe === parsed.vibe);
        setFilteredTemplates(filtered);
      }
    } else {
      // If no brand data, redirect to onboarding
      router.push('/onboarding');
    }
  }, [router]);

  useEffect(() => {
    let filtered = templates;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by vibe
    if (selectedVibe && selectedVibe !== 'all') {
      filtered = filtered.filter(template => template.vibe === selectedVibe);
    }

    setFilteredTemplates(filtered);
  }, [searchTerm, selectedVibe, templates]);

  const handleTemplateSelect = (templateId: number) => {
    // Navigate to editor with template
    router.push(`/editor/${templateId}`);
  };

  if (!brandData) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">DesignTool</h1>
              <div className="ml-8 flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: brandData.primaryColor }}
                ></div>
                <span className="text-sm text-gray-600">{brandData.name}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/brands')}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Palette className="w-4 h-4" />
                <span className="text-sm font-medium">Brands</span>
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Settings className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <CreditCard className="w-5 h-5" />
              </button>
              <button className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600">
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {brandData.name}!
          </h2>
          <p className="text-gray-600">Choose a template to start creating amazing designs</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedVibe}
              onChange={(e) => setSelectedVibe(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Vibes</option>
              <option value="playful">Playful</option>
              <option value="elegant">Elegant</option>
              <option value="bold">Bold</option>
              <option value="minimal">Minimal</option>
              <option value="professional">Professional</option>
            </select>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              onClick={() => handleTemplateSelect(template.id)}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="aspect-square bg-gray-100 relative">
                {/* Placeholder for template thumbnail */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="w-24 h-24 rounded-lg opacity-20"
                    style={{ backgroundColor: brandData.primaryColor }}
                  ></div>
                </div>
                
                {/* Template Preview Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                  <div className="flex gap-2">
                    <button className="bg-white text-gray-700 p-2 rounded-lg shadow-md hover:bg-gray-50">
                      <Wand2 className="w-4 h-4" />
                    </button>
                    <button className="bg-white text-gray-700 p-2 rounded-lg shadow-md hover:bg-gray-50">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-1">{template.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 capitalize">{template.vibe}</span>
                  <div className="flex items-center gap-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: brandData.primaryColor }}
                    ></div>
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: brandData.secondaryColor }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </main>
    </div>
  );
}
