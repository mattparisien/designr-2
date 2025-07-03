'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Wand2, RotateCcw, Download, Maximize, Sparkles, Type, Palette, Settings, Eye, ZoomIn, ZoomOut, MoreHorizontal, Upload, Save } from 'lucide-react';
import { ApiClient } from '../../../lib/api';
import FabricEditor, { FabricEditorRef } from '../../../components/FabricEditor';
import * as fabric from 'fabric';

interface BrandData {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  vibe: string;
}

interface ElementStyle {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
}

interface TemplateData {
  id: number;
  name: string;
  width: number;
  height: number;
  elements: {
    type: 'text' | 'image' | 'shape';
    content: string;
    x: number;
    y: number;
    width: number;
    height: number;
    style?: ElementStyle;
  }[];
}

export default function EditorPage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;
  
  const apiClient = useMemo(() => new ApiClient(), []);

  const [brandData, setBrandData] = useState<BrandData | null>(null);
  const [templateData, setTemplateData] = useState<TemplateData | null>(null);
  const [aiContent, setAiContent] = useState({
    headline: 'Your Amazing Headline',
    bodyText: 'Compelling copy that converts your audience',
    callToAction: 'Get Started'
  });
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showMagicFill, setShowMagicFill] = useState(false);
  const [selectedFabricObject, setSelectedFabricObject] = useState<fabric.Object | null>(null);
  const [uploadedFonts, setUploadedFonts] = useState<string[]>(['Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana']);
  const [showFontPanel, setShowFontPanel] = useState(false);
  const fabricEditorRef = useRef<FabricEditorRef>(null);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    // Set token in API client
    apiClient.setToken(token);

    // Load brand data
    const storedBrandData = localStorage.getItem('brandData');
    let loadedBrandData = null;
    if (storedBrandData) {
      loadedBrandData = JSON.parse(storedBrandData);
      setBrandData(loadedBrandData);
    }

    // Mock template data - in a real app, this would come from your API
    setTemplateData({
      id: parseInt(templateId),
      name: `Template ${templateId}`,
      width: 1080,
      height: 1080,
      elements: [
        {
          type: 'text',
          content: 'Your Amazing Headline',
          x: 40,
          y: 200,
          width: 1000,
          height: 100,
          style: { 
            fontSize: '48px', 
            fontWeight: 'bold', 
            color: loadedBrandData?.primaryColor || '#000000' 
          }
        },
        {
          type: 'text',
          content: 'Compelling copy that converts your audience',
          x: 40,
          y: 320,
          width: 1000,
          height: 80,
          style: { 
            fontSize: '24px', 
            color: loadedBrandData?.secondaryColor || '#666666' 
          }
        },
        {
          type: 'text',
          content: 'Get Started',
          x: 440,
          y: 850,
          width: 200,
          height: 60,
          style: { 
            fontSize: '18px', 
            fontWeight: 'bold', 
            color: '#ffffff', 
            backgroundColor: loadedBrandData?.primaryColor || '#3B82F6' 
          }
        }
      ]
    });
  }, [templateId, router, apiClient]);

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;

    setIsGeneratingAI(true);
    try {
      // Get current template content to provide context to AI
      const currentContent = templateData?.elements || [];
      
      // Call the real AI API with current content as context
      const response = await apiClient.magicFill({
        prompt: aiPrompt,
        vibe: brandData?.vibe || 'professional',
        brandContext: brandData?.name || 'Generic brand',
        currentContent
      });

      if (response.success && response.content) {
        setAiContent(response.content);
        
        // Update template with AI content and enhanced brand styling
        if (templateData && fabricEditorRef.current) {
          setAiContent(response.content);
          
          const updatedElements = templateData.elements.map((element, index) => {
            if (element.type === 'text') {
              let newElement = { ...element };
              
              if (index === 0) {
                // Headline - use primary color and bold styling
                newElement = { 
                  ...element, 
                  content: response.content.headline,
                  style: {
                    ...element.style,
                    color: brandData?.primaryColor || element.style?.color,
                    fontWeight: 'bold'
                  }
                };
              } else if (index === 1) {
                // Body text - use secondary color
                newElement = { 
                  ...element, 
                  content: response.content.bodyText,
                  style: {
                    ...element.style,
                    color: brandData?.secondaryColor || element.style?.color
                  }
                };
              } else if (index === 2) {
                // CTA - use primary color as background
                newElement = { 
                  ...element, 
                  content: response.content.callToAction,
                  style: {
                    ...element.style,
                    backgroundColor: brandData?.primaryColor || element.style?.backgroundColor,
                    color: '#ffffff',
                    fontWeight: 'bold'
                  }
                };
              }
              
              return newElement;
            }
            return element;
          });
          
          setTemplateData({ ...templateData, elements: updatedElements });
          
          // Load updated template into Fabric.js
          fabricEditorRef.current.loadTemplate(updatedElements);
        }
      } else {
        // Fallback to mock response if API fails
        const mockResponse = {
          headline: 'Revolutionary Solution Awaits',
          bodyText: 'Transform your business with our innovative approach',
          callToAction: 'Start Today'
        };

        setAiContent(mockResponse);
        
        // Update template with fallback content and brand styling
        if (templateData && fabricEditorRef.current) {
          const updatedElements = templateData.elements.map((element, index) => {
            if (element.type === 'text') {
              let newElement = { ...element };
              
              if (index === 0) {
                newElement = { 
                  ...element, 
                  content: mockResponse.headline,
                  style: {
                    ...element.style,
                    color: brandData?.primaryColor || element.style?.color,
                    fontWeight: 'bold'
                  }
                };
              } else if (index === 1) {
                newElement = { 
                  ...element, 
                  content: mockResponse.bodyText,
                  style: {
                    ...element.style,
                    color: brandData?.secondaryColor || element.style?.color
                  }
                };
              } else if (index === 2) {
                newElement = { 
                  ...element, 
                  content: mockResponse.callToAction,
                  style: {
                    ...element.style,
                    backgroundColor: brandData?.primaryColor || element.style?.backgroundColor,
                    color: '#ffffff',
                    fontWeight: 'bold'
                  }
                };
              }
              
              return newElement;
            }
            return element;
          });
          
          setTemplateData({ ...templateData, elements: updatedElements });
          
          // Load updated template into Fabric.js
          fabricEditorRef.current.loadTemplate(updatedElements);
        }
      }
      
      setShowMagicFill(false);
    } catch (error) {
      console.error('AI generation error:', error);
      
      // Fallback to mock response on error
      const mockResponse = {
        headline: 'Revolutionary Solution Awaits',
        bodyText: 'Transform your business with our innovative approach',
        callToAction: 'Start Today'
      };

      setAiContent(mockResponse);
      
      // Update template with fallback content and brand styling
      if (templateData && fabricEditorRef.current) {
        const updatedElements = templateData.elements.map((element, index) => {
          if (element.type === 'text') {
            let newElement = { ...element };
            
            if (index === 0) {
              newElement = { 
                ...element, 
                content: mockResponse.headline,
                style: {
                  ...element.style,
                  color: brandData?.primaryColor || element.style?.color,
                  fontWeight: 'bold'
                }
              };
            } else if (index === 1) {
              newElement = { 
                ...element, 
                content: mockResponse.bodyText,
                style: {
                  ...element.style,
                  color: brandData?.secondaryColor || element.style?.color
                }
              };
            } else if (index === 2) {
              newElement = { 
                ...element, 
                content: mockResponse.callToAction,
                style: {
                  ...element.style,
                  backgroundColor: brandData?.primaryColor || element.style?.backgroundColor,
                  color: '#ffffff',
                  fontWeight: 'bold'
                }
              };
            }
            
            return newElement;
          }
          return element;
        });
        
        setTemplateData({ ...templateData, elements: updatedElements });
        
        // Load updated template into Fabric.js
        fabricEditorRef.current.loadTemplate(updatedElements);
      }
      
      setShowMagicFill(false);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Font management functions
  const handleFontUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['.woff', '.woff2', '.ttf', '.otf'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!validTypes.includes(fileExtension)) {
      alert('Please upload a valid font file (.woff, .woff2, .ttf, .otf)');
      return;
    }

    try {
      // Create a font face and load the font
      const fontUrl = URL.createObjectURL(file);
      const fontName = file.name.split('.')[0];
      
      // Load font in Fabric.js editor if available
      if (fabricEditorRef.current) {
        const success = await fabricEditorRef.current.loadFont(fontName, fontUrl);
        if (success) {
          // Add to uploaded fonts list
          setUploadedFonts(prev => [...prev, fontName]);
          alert(`Font "${fontName}" uploaded successfully!`);
        } else {
          alert('Failed to load font. Please try again.');
        }
      } else {
        // Fallback to document fonts
        const fontFace = new FontFace(fontName, `url(${fontUrl})`);
        await fontFace.load();
        document.fonts.add(fontFace);
        
        // Add to uploaded fonts list
        setUploadedFonts(prev => [...prev, fontName]);
        alert(`Font "${fontName}" uploaded successfully!`);
      }
    } catch (error) {
      console.error('Font upload error:', error);
      alert('Failed to upload font. Please try again.');
    }
  };

  // Fabric.js event handlers
  const handleFabricObjectSelected = useCallback((obj: fabric.Object | null) => {
    setSelectedFabricObject(obj);
  }, []);

  const handleFabricObjectModified = useCallback(() => {
    // Update template data when fabric object is modified
    if (!templateData || !fabricEditorRef.current) return;
    
    const updatedElements = fabricEditorRef.current.exportTemplate();
    setTemplateData({ ...templateData, elements: updatedElements });
  }, [templateData]);

  const handleResize = () => {
    if (!templateData) return;

    // New dimensions (16:9 aspect ratio)
    const newOriginalWidth = 1920;
    const newOriginalHeight = 1080;

    // Calculate new canvas display dimensions
    const aspectRatio = newOriginalWidth / newOriginalHeight;
    const maxWidth = 500;
    const maxHeight = 500;
    
    let newCanvasWidth = maxWidth;
    let newCanvasHeight = maxWidth / aspectRatio;
    
    if (newCanvasHeight > maxHeight) {
      newCanvasHeight = maxHeight;
      newCanvasWidth = maxHeight * aspectRatio;
    }

    // Resize to 1920x1080
    const scaleX = newOriginalWidth / templateData.width;
    const scaleY = newOriginalHeight / templateData.height;

    const resizedElements = templateData.elements.map(element => ({
      ...element,
      x: element.x * scaleX,
      y: element.y * scaleY,
      width: element.width * scaleX,
      height: element.height * scaleY
    }));

    const updatedTemplate = {
      ...templateData,
      width: newOriginalWidth,
      height: newOriginalHeight,
      elements: resizedElements
    };

    setTemplateData(updatedTemplate);
    
    // Use the new resizeCanvas method to properly resize the Fabric.js canvas
    if (fabricEditorRef.current) {
      fabricEditorRef.current.resizeCanvas(
        Math.round(newCanvasWidth),
        Math.round(newCanvasHeight),
        newOriginalWidth,
        newOriginalHeight
      );
    }
  };

  const handleExport = () => {
    if (fabricEditorRef.current && fabricEditorRef.current.canvas) {
      // Export as PNG from Fabric.js canvas
      const dataURL = fabricEditorRef.current.canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 2 // For higher resolution
      });
      
      // Create download link
      const link = document.createElement('a');
      link.download = `${templateData?.name || 'design'}.png`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Fallback message
      alert('Export functionality requires the canvas to be loaded!');
    }
  };

  // Calculate canvas dimensions that fit in the container while maintaining aspect ratio
  const getCanvasDimensions = () => {
    if (!templateData) return { width: 400, height: 400 };
    
    const maxWidth = 500; // Maximum width for the canvas
    const maxHeight = 500; // Maximum height for the canvas
    const aspectRatio = templateData.width / templateData.height;
    
    let canvasWidth = maxWidth;
    let canvasHeight = maxWidth / aspectRatio;
    
    // If height exceeds max, scale down based on height
    if (canvasHeight > maxHeight) {
      canvasHeight = maxHeight;
      canvasWidth = maxHeight * aspectRatio;
    }
    
    return {
      width: Math.round(canvasWidth),
      height: Math.round(canvasHeight)
    };
  };

  // Load template into Fabric.js when template data changes
  useEffect(() => {
    if (templateData && fabricEditorRef.current && templateData.elements) {
      fabricEditorRef.current.loadTemplate(templateData.elements);
    }
  }, [templateData]); // Depend on full templateData object

  if (!brandData || !templateData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your design workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Modern Header */}
      <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left Section */}
            <div className="flex items-center space-x-6">
              <button
                onClick={() => router.push('/dashboard')}
                className="group flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                <span className="text-sm font-medium">Back</span>
              </button>
              <div className="h-6 w-px bg-white/20"></div>
              <div>
                <h1 className="text-lg font-semibold text-white">{templateData.name}</h1>
                <p className="text-xs text-gray-400">{templateData.width}×{templateData.height}px</p>
              </div>
            </div>
            
            {/* Center Actions */}
            <div className="hidden md:flex items-center space-x-3">
              <button
                onClick={() => setShowMagicFill(true)}
                className="group relative bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2.5 rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 flex items-center gap-2 shadow-lg shadow-purple-500/25 transition-all duration-200 hover:scale-105"
              >
                <Wand2 className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
                <span>AI Magic Fill</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
              </button>
              
              <button
                onClick={() => setShowFontPanel(true)}
                className="bg-white/10 backdrop-blur-sm text-white px-4 py-2.5 rounded-xl font-medium hover:bg-white/20 flex items-center gap-2 transition-all duration-200 border border-white/10"
              >
                <Type className="w-4 h-4" />
                <span>Fonts</span>
              </button>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-3">
              <div className="hidden lg:flex items-center space-x-2">
                <button
                  onClick={handleResize}
                  className="bg-blue-500/20 text-blue-400 px-3 py-2 rounded-lg hover:bg-blue-500/30 flex items-center gap-2 transition-all duration-200 border border-blue-500/30"
                >
                  <Maximize className="w-4 h-4" />
                  <span className="text-sm">16:9</span>
                </button>
                
                <button
                  onClick={handleExport}
                  className="bg-emerald-500/20 text-emerald-400 px-3 py-2 rounded-lg hover:bg-emerald-500/30 flex items-center gap-2 transition-all duration-200 border border-emerald-500/30"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm">Export</span>
                </button>
              </div>
              
              <button className="lg:hidden bg-white/10 p-2 rounded-lg hover:bg-white/20 transition-all duration-200">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Modern Main Content */}
      <div className="flex h-[calc(100vh-64px)]">
        {/* Enhanced Sidebar */}
        <div className="w-80 bg-white/5 backdrop-blur-xl border-r border-white/10 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Palette className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Brand Identity</h3>
                  <p className="text-sm text-gray-400">Colors & Style</p>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Brand Colors
                </label>
                <div className="flex gap-3">
                  <div className="group cursor-pointer">
                    <div
                      className="w-12 h-12 rounded-xl border-2 border-white/20 group-hover:border-white/40 transition-all duration-200 shadow-lg"
                      style={{ backgroundColor: brandData.primaryColor }}
                    ></div>
                    <p className="text-xs text-center mt-2 text-gray-400">Primary</p>
                  </div>
                  <div className="group cursor-pointer">
                    <div
                      className="w-12 h-12 rounded-xl border-2 border-white/20 group-hover:border-white/40 transition-all duration-200 shadow-lg"
                      style={{ backgroundColor: brandData.secondaryColor }}
                    ></div>
                    <p className="text-xs text-center mt-2 text-gray-400">Secondary</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Preview */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Type className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Content</h3>
                  <p className="text-sm text-gray-400">AI Generated Copy</p>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-3">
                <div>
                  <span className="text-xs font-medium text-blue-400 uppercase tracking-wider">Headline</span>
                  <p className="text-white font-medium text-sm mt-1 leading-relaxed">{aiContent.headline}</p>
                </div>
                <div className="h-px bg-white/10"></div>
                <div>
                  <span className="text-xs font-medium text-purple-400 uppercase tracking-wider">Body Text</span>
                  <p className="text-gray-300 text-sm mt-1 leading-relaxed">{aiContent.bodyText}</p>
                </div>
                <div className="h-px bg-white/10"></div>
                <div>
                  <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Call to Action</span>
                  <p className="text-white font-medium text-sm mt-1">{aiContent.callToAction}</p>
                </div>
              </div>

              <button
                onClick={() => setShowMagicFill(true)}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-purple-500/25"
              >
                <Wand2 className="w-4 h-4" />
                Regenerate Content
              </button>
            </div>

            {/* Canvas Controls */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Canvas</h3>
                  <p className="text-sm text-gray-400">Background & Style</p>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Background Color
                </label>
                <div className="grid grid-cols-5 gap-2">
                  <button
                    onClick={() => fabricEditorRef.current?.addBackground('#ffffff')}
                    className="w-10 h-10 rounded-lg border-2 border-white/20 bg-white hover:border-white/40 transition-all duration-200 shadow-sm"
                    title="White"
                  />
                  <button
                    onClick={() => fabricEditorRef.current?.addBackground('#f8fafc')}
                    className="w-10 h-10 rounded-lg border-2 border-white/20 bg-slate-50 hover:border-white/40 transition-all duration-200 shadow-sm"
                    title="Light Gray"
                  />
                  <button
                    onClick={() => fabricEditorRef.current?.addBackground('#e2e8f0')}
                    className="w-10 h-10 rounded-lg border-2 border-white/20 bg-slate-200 hover:border-white/40 transition-all duration-200 shadow-sm"
                    title="Gray"
                  />
                  <button
                    onClick={() => fabricEditorRef.current?.addBackground('#000000')}
                    className="w-10 h-10 rounded-lg border-2 border-white/20 bg-black hover:border-white/40 transition-all duration-200 shadow-sm"
                    title="Black"
                  />
                  <button
                    onClick={() => fabricEditorRef.current?.addBackground(brandData?.primaryColor || '#3B82F6')}
                    className="w-10 h-10 rounded-lg border-2 border-white/20 hover:border-white/40 transition-all duration-200 shadow-sm"
                    style={{ backgroundColor: brandData?.primaryColor || '#3B82F6' }}
                    title="Brand Color"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Element Properties */}
          {selectedFabricObject && (
            <div className="border-t border-white/10 p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Element Properties</h3>
                    <p className="text-sm text-gray-400 capitalize">
                      {selectedFabricObject.type === 'textbox' ? 'Text Element' : 'Selected Element'}
                    </p>
                  </div>
                </div>

                {selectedFabricObject.type === 'textbox' && (
                  <div className="space-y-4">
                    {/* Content Input */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Text Content
                      </label>
                      <textarea
                        value={(selectedFabricObject as fabric.Textbox).text || ''}
                        onChange={(e) => {
                          if (fabricEditorRef.current) {
                            fabricEditorRef.current.updateSelectedObject({ text: e.target.value });
                          }
                        }}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        rows={3}
                        placeholder="Enter your text here..."
                      />
                    </div>
                    
                    {/* Position Controls */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Position
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">X Position</label>
                          <input
                            type="number"
                            value={Math.round(selectedFabricObject.left || 0)}
                            onChange={(e) => {
                              if (fabricEditorRef.current) {
                                fabricEditorRef.current.updateSelectedObject({ left: parseInt(e.target.value) || 0 });
                              }
                            }}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Y Position</label>
                          <input
                            type="number"
                            value={Math.round(selectedFabricObject.top || 0)}
                            onChange={(e) => {
                              if (fabricEditorRef.current) {
                                fabricEditorRef.current.updateSelectedObject({ top: parseInt(e.target.value) || 0 });
                              }
                            }}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Typography Controls */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-4">
                      <label className="block text-sm font-medium text-gray-300">
                        Typography
                      </label>
                      
                      <div>
                        <label className="block text-xs text-gray-400 mb-2">Font Size</label>
                        <div className="relative">
                          <input
                            type="number"
                            step="1"
                            value={Math.round((selectedFabricObject as fabric.Textbox).fontSize || 16)}
                            onChange={(e) => {
                              const newFontSize = parseInt(e.target.value) || 16;
                              if (fabricEditorRef.current) {
                                fabricEditorRef.current.updateSelectedObject({ fontSize: newFontSize });
                                const activeObj = fabricEditorRef.current.canvas?.getActiveObject();
                                if (activeObj) {
                                  setSelectedFabricObject(null);
                                  setTimeout(() => setSelectedFabricObject(activeObj), 0);
                                }
                              }
                            }}
                            className="w-full px-3 py-2 pr-8 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            min="8"
                            max="200"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">px</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs text-gray-400 mb-2">Font Family</label>
                        <select
                          value={(selectedFabricObject as fabric.Textbox).fontFamily || 'Arial'}
                          onChange={(e) => {
                            if (fabricEditorRef.current) {
                              fabricEditorRef.current.updateSelectedObject({ fontFamily: e.target.value });
                            }
                          }}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        >
                          {uploadedFonts.map((font) => (
                            <option key={font} value={font} style={{ fontFamily: font, backgroundColor: '#1e293b' }}>
                              {font}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    {/* Color Controls */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Text Color
                      </label>
                      <div className="flex gap-3 items-center">
                        <div className="relative">
                          <input
                            type="color"
                            value={(selectedFabricObject as fabric.Textbox).fill as string || '#000000'}
                            onChange={(e) => {
                              if (fabricEditorRef.current) {
                                fabricEditorRef.current.updateSelectedObject({ fill: e.target.value });
                                const activeObj = fabricEditorRef.current.canvas?.getActiveObject();
                                if (activeObj) {
                                  setSelectedFabricObject(null);
                                  setTimeout(() => setSelectedFabricObject(activeObj), 0);
                                }
                              }
                            }}
                            className="w-12 h-12 rounded-lg border-2 border-white/20 cursor-pointer hover:border-white/40 transition-all duration-200"
                          />
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              if (fabricEditorRef.current) {
                                fabricEditorRef.current.updateSelectedObject({ fill: '#000000' });
                                const activeObj = fabricEditorRef.current.canvas?.getActiveObject();
                                if (activeObj) {
                                  setSelectedFabricObject(null);
                                  setTimeout(() => setSelectedFabricObject(activeObj), 0);
                                }
                              }
                            }}
                            className="w-8 h-8 rounded-lg border-2 border-white/20 bg-black hover:border-white/40 transition-all duration-200 shadow-sm"
                            title="Black"
                          />
                          <button
                            onClick={() => {
                              if (fabricEditorRef.current) {
                                fabricEditorRef.current.updateSelectedObject({ fill: '#ffffff' });
                                const activeObj = fabricEditorRef.current.canvas?.getActiveObject();
                                if (activeObj) {
                                  setSelectedFabricObject(null);
                                  setTimeout(() => setSelectedFabricObject(activeObj), 0);
                                }
                              }
                            }}
                            className="w-8 h-8 rounded-lg border-2 border-white/20 bg-white hover:border-white/40 transition-all duration-200 shadow-sm"
                            title="White"
                          />
                          <button
                            onClick={() => {
                              if (fabricEditorRef.current && brandData?.primaryColor) {
                                fabricEditorRef.current.updateSelectedObject({ fill: brandData.primaryColor });
                                const activeObj = fabricEditorRef.current.canvas?.getActiveObject();
                                if (activeObj) {
                                  setSelectedFabricObject(null);
                                  setTimeout(() => setSelectedFabricObject(activeObj), 0);
                                }
                              }
                            }}
                            className="w-8 h-8 rounded-lg border-2 border-white/20 hover:border-white/40 transition-all duration-200 shadow-sm"
                            style={{ backgroundColor: brandData?.primaryColor || '#3B82F6' }}
                            title="Brand Primary"
                          />
                          <button
                            onClick={() => {
                              if (fabricEditorRef.current && brandData?.secondaryColor) {
                                fabricEditorRef.current.updateSelectedObject({ fill: brandData.secondaryColor });
                                const activeObj = fabricEditorRef.current.canvas?.getActiveObject();
                                if (activeObj) {
                                  setSelectedFabricObject(null);
                                  setTimeout(() => setSelectedFabricObject(activeObj), 0);
                                }
                              }
                            }}
                            className="w-8 h-8 rounded-lg border-2 border-white/20 hover:border-white/40 transition-all duration-200 shadow-sm"
                            style={{ backgroundColor: brandData?.secondaryColor || '#6B7280' }}
                            title="Brand Secondary"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Font Family
                      </label>
                      <select
                        value={(selectedFabricObject as fabric.Textbox).fontFamily || 'Arial'}
                        onChange={(e) => {
                          if (fabricEditorRef.current) {
                            fabricEditorRef.current.updateSelectedObject({ fontFamily: e.target.value });
                          }
                        }}
                        className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                      >
                        {uploadedFonts.map((font) => (
                          <option key={font} value={font} style={{ fontFamily: font }}>
                            {font}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Text Color
                      </label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={(selectedFabricObject as fabric.Textbox).fill as string || '#000000'}
                          onChange={(e) => {
                            if (fabricEditorRef.current) {
                              fabricEditorRef.current.updateSelectedObject({ fill: e.target.value });
                              // Force re-render
                              const activeObj = fabricEditorRef.current.canvas?.getActiveObject();
                              if (activeObj) {
                                setSelectedFabricObject(null);
                                setTimeout(() => setSelectedFabricObject(activeObj), 0);
                              }
                            }
                          }}
                          className="w-12 h-8 rounded border border-gray-600 cursor-pointer"
                        />
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              if (fabricEditorRef.current) {
                                fabricEditorRef.current.updateSelectedObject({ fill: '#000000' });
                                const activeObj = fabricEditorRef.current.canvas?.getActiveObject();
                                if (activeObj) {
                                  setSelectedFabricObject(null);
                                  setTimeout(() => setSelectedFabricObject(activeObj), 0);
                                }
                              }
                            }}
                            className="w-6 h-6 rounded border border-gray-600 bg-black"
                            title="Black"
                          />
                          <button
                            onClick={() => {
                              if (fabricEditorRef.current) {
                                fabricEditorRef.current.updateSelectedObject({ fill: '#ffffff' });
                                const activeObj = fabricEditorRef.current.canvas?.getActiveObject();
                              }
                            }}
                            className="w-8 h-8 rounded-lg border-2 border-white/20 hover:border-white/40 transition-all duration-200 shadow-sm"
                            style={{ backgroundColor: brandData?.secondaryColor || '#6B7280' }}
                            title="Brand Secondary"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modern Canvas Area */}
        <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl p-6">
              {(() => {
                const dimensions = getCanvasDimensions();
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
                );
              })()}
              
              {/* Canvas Overlay Controls */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button className="bg-black/50 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-black/70 transition-all duration-200">
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button className="bg-black/50 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-black/70 transition-all duration-200">
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button className="bg-black/50 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-black/70 transition-all duration-200">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Magic Fill Modal */}
      {showMagicFill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-purple-400" />
              AI Magic Fill
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Describe what you want to promote
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white resize-none"
                  rows={3}
                  placeholder="e.g., A new product launch for eco-friendly water bottles..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowMagicFill(false)}
                  className="flex-1 px-4 py-2 border border-gray-600 rounded-lg font-medium hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAIGenerate}
                  disabled={isGeneratingAI || !aiPrompt.trim()}
                  className="flex-1 bg-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Font Management
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Upload Custom Font
                </label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept=".woff,.woff2,.ttf,.otf"
                    onChange={handleFontUpload}
                    className="hidden"
                    id="font-upload"
                  />
                  <label
                    htmlFor="font-upload"
                    className="cursor-pointer text-gray-400 hover:text-white"
                  >
                    <div className="space-y-2">
                      <div className="text-2xl">📝</div>
                      <div className="text-sm">
                        Click to upload font file
                      </div>
                      <div className="text-xs text-gray-500">
                        Supports .woff, .woff2, .ttf, .otf
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Available Fonts ({uploadedFonts.length})
                </label>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {uploadedFonts.map((font) => (
                    <div
                      key={font}
                      className="p-2 bg-gray-700 rounded text-sm"
                      style={{ fontFamily: font }}
                    >
                      {font}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowFontPanel(false)}
                  className="flex-1 px-4 py-2 border border-gray-600 rounded-lg font-medium hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
