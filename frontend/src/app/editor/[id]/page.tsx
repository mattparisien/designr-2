'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Wand2, RotateCcw, Download, Maximize, Sparkles, Type, Palette, Settings, Eye, ZoomIn, ZoomOut, MoreHorizontal, Upload } from 'lucide-react';
import { ApiClient } from '../../../lib/api';
import FabricEditor, { FabricEditorRef } from '../../../components/FabricEditor';
import * as fabric from 'fabric';

interface BrandData {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  vibe: string;
  voice?: string;
  personality?: string;
  targetAudience?: string;
  toneGuidelines?: string;
  keyValues?: string;
  communicationStyle?: string;
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
    bodyText: 'Compelling copy that converts your audience'
  });
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showMagicFill, setShowMagicFill] = useState(false);
  const [selectedFabricObject, setSelectedFabricObject] = useState<fabric.Object | null>(null);
  const [uploadedFonts, setUploadedFonts] = useState<string[]>(['Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana']);
  const [showFontPanel, setShowFontPanel] = useState(false);
  const [resizeSearchTerm, setResizeSearchTerm] = useState('');
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
      // Get current template content to provide context
      const currentContent = templateData ? fabricEditorRef.current?.exportTemplate() || templateData.elements : [];
      
      // Call the enhanced AI API with current content context and comprehensive brand information
      const response = await apiClient.magicFill({
        prompt: aiPrompt,
        vibe: brandData?.vibe || 'professional',
        brandContext: {
          name: brandData?.name || 'Generic brand',
          voice: brandData?.voice || 'Professional and engaging',
          personality: brandData?.personality || 'Friendly and approachable',
          targetAudience: brandData?.targetAudience || 'General audience',
          toneGuidelines: brandData?.toneGuidelines || 'Use clear, concise language that resonates with the audience',
          keyValues: brandData?.keyValues || 'Quality, innovation, customer satisfaction',
          communicationStyle: brandData?.communicationStyle || 'Direct and informative'
        },
        currentContent: currentContent
      });

      if (response.success && response.content) {
        setAiContent(response.content);
        
        // Update template with AI content and enhanced brand styling
        if (templateData && fabricEditorRef.current) {
          const updatedElements = templateData.elements.map((element, index) => {
            if (element.type === 'text') {
              let newElement = { ...element };
              
              if (index === 0) {
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
                newElement = { 
                  ...element, 
                  content: response.content.bodyText,
                  style: {
                    ...element.style,
                    color: brandData?.secondaryColor || element.style?.color
                  }
                };
              }
              
              return newElement;
            }
            return element;
          });
          
          setTemplateData({ ...templateData, elements: updatedElements });
          fabricEditorRef.current.loadTemplate(updatedElements);
        }
      } else {
        // Fallback to mock response if API fails
        const mockResponse = {
          headline: 'Revolutionary Solution Awaits',
          bodyText: 'Transform your business with our innovative approach'
        };
        setAiContent(mockResponse);
      }
      
      setShowMagicFill(false);
    } catch (error) {
      console.error('AI generation error:', error);
      setShowMagicFill(false);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Font management functions
  const handleFontUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ['.woff', '.woff2', '.ttf', '.otf'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!validTypes.includes(fileExtension)) {
      alert('Please upload a valid font file (.woff, .woff2, .ttf, .otf)');
      return;
    }

    try {
      const fontUrl = URL.createObjectURL(file);
      const fontName = file.name.split('.')[0];
      
      if (fabricEditorRef.current) {
        const success = await fabricEditorRef.current.loadFont(fontName, fontUrl);
        if (success) {
          setUploadedFonts(prev => [...prev, fontName]);
          alert(`Font "${fontName}" uploaded successfully!`);
        } else {
          alert('Failed to load font. Please try again.');
        }
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
    if (!templateData || !fabricEditorRef.current) return;
    
    const updatedElements = fabricEditorRef.current.exportTemplate();
    setTemplateData({ ...templateData, elements: updatedElements });
  }, [templateData]);

  // Enhanced social media format presets organized by categories
  const socialMediaFormats = {
    // Instagram
    'instagram-square': { width: 1080, height: 1080, name: 'Instagram Square Post', category: 'Instagram' },
    'instagram-portrait': { width: 1080, height: 1350, name: 'Instagram Portrait Post', category: 'Instagram' },
    'instagram-landscape': { width: 1080, height: 566, name: 'Instagram Landscape Post', category: 'Instagram' },
    'instagram-story': { width: 1080, height: 1920, name: 'Instagram Story', category: 'Instagram' },
    'instagram-reel': { width: 1080, height: 1920, name: 'Instagram Reel', category: 'Instagram' },
    'instagram-igtv-cover': { width: 420, height: 654, name: 'Instagram IGTV Cover', category: 'Instagram' },
    'instagram-highlight-cover': { width: 161, height: 161, name: 'Instagram Highlight Cover', category: 'Instagram' },
    
    // TikTok
    'tiktok-video': { width: 1080, height: 1920, name: 'TikTok Video', category: 'TikTok' },
    'tiktok-profile': { width: 200, height: 200, name: 'TikTok Profile Picture', category: 'TikTok' },
    
    // YouTube
    'youtube-thumbnail': { width: 1280, height: 720, name: 'YouTube Thumbnail', category: 'YouTube' },
    'youtube-shorts': { width: 1080, height: 1920, name: 'YouTube Shorts', category: 'YouTube' },
    'youtube-channel-art': { width: 2560, height: 1440, name: 'YouTube Channel Art', category: 'YouTube' },
    'youtube-profile': { width: 800, height: 800, name: 'YouTube Profile Picture', category: 'YouTube' },
    'youtube-end-screen': { width: 1280, height: 720, name: 'YouTube End Screen', category: 'YouTube' },
    
    // Facebook
    'facebook-post': { width: 1200, height: 630, name: 'Facebook Post', category: 'Facebook' },
    'facebook-story': { width: 1080, height: 1920, name: 'Facebook Story', category: 'Facebook' },
    'facebook-cover': { width: 1200, height: 315, name: 'Facebook Cover Photo', category: 'Facebook' },
    'facebook-profile': { width: 170, height: 170, name: 'Facebook Profile Picture', category: 'Facebook' },
    'facebook-event-cover': { width: 1920, height: 1080, name: 'Facebook Event Cover', category: 'Facebook' },
    'facebook-ad': { width: 1200, height: 628, name: 'Facebook Ad', category: 'Facebook' },
    
    // Twitter / X
    'twitter-post': { width: 1200, height: 675, name: 'Twitter/X Post', category: 'Twitter' },
    'twitter-header': { width: 1500, height: 500, name: 'Twitter/X Header', category: 'Twitter' },
    'twitter-profile': { width: 400, height: 400, name: 'Twitter/X Profile Picture', category: 'Twitter' },
    'twitter-card': { width: 1200, height: 628, name: 'Twitter/X Card', category: 'Twitter' },
    
    // LinkedIn
    'linkedin-post': { width: 1200, height: 627, name: 'LinkedIn Post', category: 'LinkedIn' },
    'linkedin-story': { width: 1080, height: 1920, name: 'LinkedIn Story', category: 'LinkedIn' },
    'linkedin-cover': { width: 1584, height: 396, name: 'LinkedIn Cover Photo', category: 'LinkedIn' },
    'linkedin-profile': { width: 400, height: 400, name: 'LinkedIn Profile Picture', category: 'LinkedIn' },
    'linkedin-company-logo': { width: 300, height: 300, name: 'LinkedIn Company Logo', category: 'LinkedIn' },
    'linkedin-ad': { width: 1200, height: 627, name: 'LinkedIn Ad', category: 'LinkedIn' },
    
    // Pinterest
    'pinterest-pin': { width: 1000, height: 1500, name: 'Pinterest Pin (2:3)', category: 'Pinterest' },
    'pinterest-square': { width: 1000, height: 1000, name: 'Pinterest Square Pin', category: 'Pinterest' },
    'pinterest-long': { width: 1000, height: 2100, name: 'Pinterest Long Pin', category: 'Pinterest' },
    'pinterest-board-cover': { width: 222, height: 150, name: 'Pinterest Board Cover', category: 'Pinterest' },
    
    // Snapchat
    'snapchat-ad': { width: 1080, height: 1920, name: 'Snapchat Ad', category: 'Snapchat' },
    'snapchat-geofilter': { width: 1080, height: 1920, name: 'Snapchat Geofilter', category: 'Snapchat' },
    
    // WhatsApp
    'whatsapp-story': { width: 1080, height: 1920, name: 'WhatsApp Story', category: 'WhatsApp' },
    'whatsapp-profile': { width: 500, height: 500, name: 'WhatsApp Profile Picture', category: 'WhatsApp' },
    
    // Discord
    'discord-banner': { width: 960, height: 540, name: 'Discord Server Banner', category: 'Discord' },
    'discord-profile': { width: 128, height: 128, name: 'Discord Profile Picture', category: 'Discord' },
    
    // Twitch
    'twitch-banner': { width: 1200, height: 380, name: 'Twitch Banner', category: 'Twitch' },
    'twitch-profile': { width: 256, height: 256, name: 'Twitch Profile Picture', category: 'Twitch' },
    'twitch-overlay': { width: 1920, height: 1080, name: 'Twitch Overlay', category: 'Twitch' },
    
    // Email Marketing
    'email-header': { width: 600, height: 200, name: 'Email Header', category: 'Email' },
    'email-signature': { width: 320, height: 70, name: 'Email Signature', category: 'Email' },
    'email-newsletter': { width: 600, height: 1200, name: 'Email Newsletter', category: 'Email' },
    
    // Web & Digital
    'web-banner': { width: 1920, height: 1080, name: 'Web Banner (16:9)', category: 'Web' },
    'web-hero': { width: 1920, height: 600, name: 'Web Hero Image', category: 'Web' },
    'blog-featured': { width: 1200, height: 630, name: 'Blog Featured Image', category: 'Web' },
    'og-image': { width: 1200, height: 630, name: 'Open Graph Image', category: 'Web' },
    'favicon': { width: 512, height: 512, name: 'Favicon', category: 'Web' },
    
    // Print Materials
    'a4-portrait': { width: 2480, height: 3508, name: 'A4 Portrait', category: 'Print' },
    'a4-landscape': { width: 3508, height: 2480, name: 'A4 Landscape', category: 'Print' },
    'letter-portrait': { width: 2550, height: 3300, name: 'Letter Portrait', category: 'Print' },
    'letter-landscape': { width: 3300, height: 2550, name: 'Letter Landscape', category: 'Print' },
    'business-card': { width: 1050, height: 600, name: 'Business Card', category: 'Print' },
    'postcard': { width: 1875, height: 1275, name: 'Postcard (6x4")', category: 'Print' },
    'flyer-a5': { width: 1748, height: 2480, name: 'Flyer A5', category: 'Print' },
    'poster-a3': { width: 3508, height: 4961, name: 'Poster A3', category: 'Print' },
    'booklet-cover': { width: 1275, height: 1650, name: 'Booklet Cover', category: 'Print' },
    
    // Presentations
    'presentation-16-9': { width: 1920, height: 1080, name: 'Presentation 16:9', category: 'Presentation' },
    'presentation-4-3': { width: 1024, height: 768, name: 'Presentation 4:3', category: 'Presentation' },
    'presentation-wide': { width: 1920, height: 1200, name: 'Presentation Wide', category: 'Presentation' },
    
    // Mobile & Desktop
    'mobile-wallpaper': { width: 1080, height: 1920, name: 'Mobile Wallpaper', category: 'Wallpaper' },
    'desktop-wallpaper': { width: 1920, height: 1080, name: 'Desktop Wallpaper', category: 'Wallpaper' },
    'tablet-wallpaper': { width: 2048, height: 2732, name: 'Tablet Wallpaper', category: 'Wallpaper' },
    'iphone-wallpaper': { width: 1179, height: 2556, name: 'iPhone Wallpaper', category: 'Wallpaper' },
    'android-wallpaper': { width: 1080, height: 1920, name: 'Android Wallpaper', category: 'Wallpaper' },
    
    // Advertising
    'google-ad-banner': { width: 728, height: 90, name: 'Google Ad Banner', category: 'Advertising' },
    'google-ad-square': { width: 300, height: 250, name: 'Google Ad Square', category: 'Advertising' },
    'google-ad-large': { width: 336, height: 280, name: 'Google Ad Large Rectangle', category: 'Advertising' },
    'display-ad-wide': { width: 970, height: 250, name: 'Display Ad Wide', category: 'Advertising' },
    'display-ad-skyscraper': { width: 160, height: 600, name: 'Display Ad Skyscraper', category: 'Advertising' },
    
    // Event & Tickets
    'event-ticket': { width: 2126, height: 1063, name: 'Event Ticket', category: 'Event' },
    'event-banner': { width: 1920, height: 1080, name: 'Event Banner', category: 'Event' },
    'conference-badge': { width: 354, height: 472, name: 'Conference Badge', category: 'Event' },
    
    // Miscellaneous
    'square-1-1': { width: 1080, height: 1080, name: 'Square (1:1)', category: 'Standard' },
    'landscape-16-9': { width: 1920, height: 1080, name: 'Landscape (16:9)', category: 'Standard' },
    'portrait-9-16': { width: 1080, height: 1920, name: 'Portrait (9:16)', category: 'Standard' },
    'wide-21-9': { width: 2560, height: 1080, name: 'Ultra Wide (21:9)', category: 'Standard' },
    'cinema-2-35-1': { width: 2350, height: 1000, name: 'Cinema (2.35:1)', category: 'Standard' },
  };

  const [showResizePanel, setShowResizePanel] = useState(false);

  const handleResize = (formatKey?: string) => {
    if (!templateData || !fabricEditorRef.current) return;

    let newWidth, newHeight, formatName;
    
    if (formatKey && socialMediaFormats[formatKey as keyof typeof socialMediaFormats]) {
      const format = socialMediaFormats[formatKey as keyof typeof socialMediaFormats];
      newWidth = format.width;
      newHeight = format.height;
      formatName = format.name;
    } else {
      // Default to 16:9 if no format specified
      newWidth = 1920;
      newHeight = 1080;
      formatName = '16:9 Landscape';
    }

    const scaleX = newWidth / templateData.width;
    const scaleY = newHeight / templateData.height;

    const resizedElements = templateData.elements.map(element => ({
      ...element,
      x: element.x * scaleX,
      y: element.y * scaleY,
      width: element.width * scaleX,
      height: element.height * scaleY
    }));

    const updatedTemplate = {
      ...templateData,
      width: newWidth,
      height: newHeight,
      elements: resizedElements
    };

    setTemplateData(updatedTemplate);
    
    // Calculate new canvas display dimensions
    const maxWidth = 500;
    const maxHeight = 500;
    const aspectRatio = newWidth / newHeight;
    
    let canvasWidth = maxWidth;
    let canvasHeight = maxWidth / aspectRatio;
    
    if (canvasHeight > maxHeight) {
      canvasHeight = maxHeight;
      canvasWidth = maxHeight * aspectRatio;
    }
    
    // Use the enhanced resizeCanvas method
    fabricEditorRef.current.resizeCanvas(
      Math.round(canvasWidth),
      Math.round(canvasHeight),
      newWidth,
      newHeight
    );

    setShowResizePanel(false);
    
    // Show success message
    console.log(`Resized to ${formatName}: ${newWidth}×${newHeight}px`);
  };

  const handleCustomResize = (width: number, height: number) => {
    if (!templateData || !fabricEditorRef.current) return;

    const scaleX = width / templateData.width;
    const scaleY = height / templateData.height;

    const resizedElements = templateData.elements.map(element => ({
      ...element,
      x: element.x * scaleX,
      y: element.y * scaleY,
      width: element.width * scaleX,
      height: element.height * scaleY
    }));

    const updatedTemplate = {
      ...templateData,
      width: width,
      height: height,
      elements: resizedElements
    };

    setTemplateData(updatedTemplate);
    
    // Calculate new canvas display dimensions
    const maxWidth = 500;
    const maxHeight = 500;
    const aspectRatio = width / height;
    
    let canvasWidth = maxWidth;
    let canvasHeight = maxWidth / aspectRatio;
    
    if (canvasHeight > maxHeight) {
      canvasHeight = maxHeight;
      canvasWidth = maxHeight * aspectRatio;
    }
    
    // Use the enhanced resizeCanvas method
    fabricEditorRef.current.resizeCanvas(
      Math.round(canvasWidth),
      Math.round(canvasHeight),
      width,
      height
    );

    setShowResizePanel(false);
    
    // Show success message
    console.log(`Resized to custom size: ${width}×${height}px`);
  };

  const handleExport = () => {
    if (fabricEditorRef.current && fabricEditorRef.current.canvas) {
      const dataURL = fabricEditorRef.current.canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 2
      });
      
      const link = document.createElement('a');
      link.download = `${templateData?.name || 'design'}.png`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getCanvasDimensions = () => {
    if (!templateData) return { width: 400, height: 400 };
    
    const maxWidth = 500;
    const maxHeight = 500;
    const aspectRatio = templateData.width / templateData.height;
    
    let canvasWidth = maxWidth;
    let canvasHeight = maxWidth / aspectRatio;
    
    if (canvasHeight > maxHeight) {
      canvasHeight = maxHeight;
      canvasWidth = maxHeight * aspectRatio;
    }
    
    return {
      width: Math.round(canvasWidth),
      height: Math.round(canvasHeight)
    };
  };

  useEffect(() => {
    if (templateData && fabricEditorRef.current && templateData.elements) {
      fabricEditorRef.current.loadTemplate(templateData.elements);
    }
  }, [templateData]);

  // Close resize panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showResizePanel) {
        const target = event.target as Element;
        if (!target.closest('.resize-dropdown')) {
          setShowResizePanel(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showResizePanel]);

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
                <div className="relative resize-dropdown">
                  <button
                    onClick={() => setShowResizePanel(!showResizePanel)}
                    className="bg-blue-500/20 text-blue-400 px-3 py-2 rounded-lg hover:bg-blue-500/30 flex items-center gap-2 transition-all duration-200 border border-blue-500/30"
                  >
                    <Maximize className="w-4 h-4" />
                    <span className="text-sm">Resize</span>
                  </button>
                  
                  {/* Enhanced Resize Dropdown with Categories and Search */}
                  {showResizePanel && (
                    <div className="absolute top-12 right-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl w-80 z-50">
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-medium text-white">Resize Canvas</h3>
                          <span className="text-xs text-gray-400">
                            {templateData ? `${templateData.width}×${templateData.height}` : ''}
                          </span>
                        </div>
                        
                        {/* Search Input with Quick Suggestions */}
                        <div className="mb-4">
                          <input
                            type="text"
                            placeholder="Search formats... (try: story, post, thumbnail, etc.)"
                            value={resizeSearchTerm}
                            onChange={(e) => setResizeSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          />
                          {resizeSearchTerm === '' && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {['story', 'post', 'thumbnail', 'reel', 'pin'].map((suggestion) => (
                                <button
                                  key={suggestion}
                                  onClick={() => setResizeSearchTerm(suggestion)}
                                  className="px-2 py-1 text-xs bg-white/5 text-gray-400 rounded border border-white/10 hover:bg-white/10 hover:text-white transition-all duration-200"
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                          {/* Group formats by category and filter by search term */}
                          {Object.entries(
                            Object.entries(socialMediaFormats)
                              .filter(([key, format]) => 
                                resizeSearchTerm === '' || 
                                format.name.toLowerCase().includes(resizeSearchTerm.toLowerCase()) ||
                                format.category.toLowerCase().includes(resizeSearchTerm.toLowerCase()) ||
                                key.toLowerCase().includes(resizeSearchTerm.toLowerCase())
                              )
                              .reduce((groups: Record<string, Array<[string, { width: number; height: number; name: string; category: string }]>>, [key, format]) => {
                                const category = format.category;
                                if (!groups[category]) groups[category] = [];
                                groups[category].push([key, format]);
                                return groups;
                              }, {})
                          ).map(([category, formats]) => (
                            <div key={category} className="space-y-1">
                              <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider px-2 py-1">
                                {category} ({formats.length})
                              </h4>
                              <div className="space-y-1">
                                {formats.map(([key, format]) => {
                                  const isCurrentSize = templateData && 
                                    templateData.width === format.width && 
                                    templateData.height === format.height;
                                  
                                  return (
                                    <button
                                      key={key}
                                      onClick={() => handleResize(key)}
                                      className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                                        isCurrentSize 
                                          ? 'bg-blue-500/20 border border-blue-500/30' 
                                          : 'hover:bg-white/10'
                                      }`}
                                    >
                                      <div className="flex justify-between items-start">
                                        <div className="flex-1 min-w-0">
                                          <span className={`text-sm font-medium block truncate ${
                                            isCurrentSize ? 'text-blue-300' : 'text-white group-hover:text-blue-300'
                                          }`}>
                                            {format.name}
                                          </span>
                                          <span className="text-xs text-gray-400 block mt-0.5">
                                            {format.width}×{format.height}px • {(format.width/format.height).toFixed(2)} ratio
                                          </span>
                                        </div>
                                        {isCurrentSize && (
                                          <span className="text-xs text-blue-400 bg-blue-500/20 px-2 py-1 rounded-full ml-2 flex-shrink-0">
                                            Current
                                          </span>
                                        )}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                          
                          {/* Show "No results" message when search has no matches */}
                          {resizeSearchTerm && Object.keys(
                            Object.entries(socialMediaFormats)
                              .filter(([key, format]) => 
                                format.name.toLowerCase().includes(resizeSearchTerm.toLowerCase()) ||
                                format.category.toLowerCase().includes(resizeSearchTerm.toLowerCase()) ||
                                key.toLowerCase().includes(resizeSearchTerm.toLowerCase())
                              )
                              .reduce((groups: Record<string, Array<[string, { width: number; height: number; name: string; category: string }]>>, [key, format]) => {
                                const category = format.category;
                                if (!groups[category]) groups[category] = [];
                                groups[category].push([key, format]);
                                return groups;
                              }, {})
                          ).length === 0 && (
                            <div className="text-center py-8">
                              <span className="text-gray-400 text-sm">No formats found matching &ldquo;{resizeSearchTerm}&rdquo;</span>
                            </div>
                          )}
                          
                          {/* Custom Size Option */}
                          <div className="border-t border-white/10 pt-4 mt-4">
                            <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider px-2 py-1 mb-2">
                              Custom
                            </h4>
                            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs text-gray-400 mb-1">Width</label>
                                  <input
                                    type="number"
                                    placeholder="1920"
                                    className="w-full px-2 py-1.5 bg-white/10 border border-white/20 rounded text-white text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                    id="custom-width"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-400 mb-1">Height</label>
                                  <input
                                    type="number"
                                    placeholder="1080"
                                    className="w-full px-2 py-1.5 bg-white/10 border border-white/20 rounded text-white text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                    id="custom-height"
                                  />
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  const width = parseInt((document.getElementById('custom-width') as HTMLInputElement)?.value || '1920');
                                  const height = parseInt((document.getElementById('custom-height') as HTMLInputElement)?.value || '1080');
                                  if (width > 0 && height > 0) {
                                    handleCustomResize(width, height);
                                  }
                                }}
                                className="w-full mt-3 bg-blue-500/20 text-blue-400 py-2 rounded-lg hover:bg-blue-500/30 transition-all duration-200 text-sm font-medium border border-blue-500/30"
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

            {/* Enhanced Element Properties */}
            {selectedFabricObject && (
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
            )}
          </div>
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

      {/* Enhanced Magic Fill Modal */}
      {showMagicFill && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 w-full max-w-md shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Wand2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">AI Magic Fill</h3>
              <p className="text-gray-400 text-sm">Describe your content and let AI create amazing copy</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  What do you want to promote?
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white resize-none placeholder-gray-400 transition-all duration-200"
                  rows={4}
                  placeholder="e.g., A new product launch for eco-friendly water bottles that helps reduce plastic waste..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowMagicFill(false)}
                  className="flex-1 px-6 py-3 border border-white/20 rounded-xl font-medium hover:bg-white/10 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAIGenerate}
                  disabled={isGeneratingAI || !aiPrompt.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200"
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

      {/* Enhanced Font Management Modal */}
      {showFontPanel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 w-full max-w-md shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Type className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Font Management</h3>
              <p className="text-gray-400 text-sm">Upload and manage your custom fonts</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Upload Custom Font
                </label>
                <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-white/40 transition-all duration-200">
                  <input
                    type="file"
                    accept=".woff,.woff2,.ttf,.otf"
                    onChange={handleFontUpload}
                    className="hidden"
                    id="font-upload"
                  />
                  <label
                    htmlFor="font-upload"
                    className="cursor-pointer text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    <div className="space-y-3">
                      <Upload className="w-8 h-8 mx-auto text-gray-400" />
                      <div className="text-sm font-medium">
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
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Available Fonts ({uploadedFonts.length})
                </label>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {uploadedFonts.map((font) => (
                    <div
                      key={font}
                      className="p-3 bg-white/5 rounded-lg text-sm border border-white/10 hover:bg-white/10 transition-all duration-200"
                      style={{ fontFamily: font }}
                    >
                      {font}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowFontPanel(false)}
                className="w-full px-6 py-3 bg-white/10 border border-white/20 rounded-xl font-medium hover:bg-white/20 transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
