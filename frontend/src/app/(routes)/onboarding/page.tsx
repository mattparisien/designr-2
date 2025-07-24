'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Palette, Sparkles, ArrowRight } from 'lucide-react';

const vibes = [
  { id: 'playful', name: 'Playful', description: 'Fun and energetic', color: 'bg-pink-500' },
  { id: 'elegant', name: 'Elegant', description: 'Sophisticated and refined', color: 'bg-purple-500' },
  { id: 'bold', name: 'Bold', description: 'Strong and confident', color: 'bg-red-500' },
  { id: 'minimal', name: 'Minimal', description: 'Clean and simple', color: 'bg-gray-500' },
  { id: 'professional', name: 'Professional', description: 'Business and corporate', color: 'bg-blue-500' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [brandData, setBrandData] = useState({
    name: '',
    logo: null as File | null,
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    vibe: ''
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBrandData(prev => ({ ...prev, logo: file }));
    }
  };

  const handleVibeSelect = (vibeId: string) => {
    setBrandData(prev => ({ ...prev, vibe: vibeId }));
  };

  const handleComplete = async () => {
    try {
      // In a real app, you would save the brand data to your backend
      console.log('Brand data:', brandData);
      
      // For now, store in localStorage
      localStorage.setItem('brandData', JSON.stringify(brandData));
      
      // Navigate to template gallery
      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving brand:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to DesignTool</h1>
          <p className="text-gray-600">Let's create your brand identity in 3 simple steps</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                i <= step ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {i}
              </div>
              {i < 3 && (
                <div className={`w-12 h-1 mx-2 ${
                  i < step ? 'bg-blue-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <Upload className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Tell us about your brand</h2>
              <p className="text-gray-600">Upload your logo or enter your brand name</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={brandData.name}
                  onChange={(e) => setBrandData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your brand name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label htmlFor="logo-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {brandData.logo ? brandData.logo.name : 'Click to upload your logo'}
                    </p>
                  </label>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!brandData.name.trim()}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Next Step <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <Palette className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Choose your colors</h2>
              <p className="text-gray-600">Pick two colors that represent your brand</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={brandData.primaryColor}
                    onChange={(e) => setBrandData(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brandData.primaryColor}
                    onChange={(e) => setBrandData(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={brandData.secondaryColor}
                    onChange={(e) => setBrandData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brandData.secondaryColor}
                    onChange={(e) => setBrandData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(3)}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 flex items-center justify-center gap-2"
            >
              Next Step <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <Sparkles className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">What's your vibe?</h2>
              <p className="text-gray-600">Choose the style that matches your brand personality</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {vibes.map((vibe) => (
                <button
                  key={vibe.id}
                  onClick={() => handleVibeSelect(vibe.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    brandData.vibe === vibe.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-8 h-8 ${vibe.color} rounded-lg mb-3`}></div>
                  <h3 className="font-semibold text-gray-900 mb-1">{vibe.name}</h3>
                  <p className="text-sm text-gray-600">{vibe.description}</p>
                </button>
              ))}
            </div>

            <button
              onClick={handleComplete}
              disabled={!brandData.vibe}
              className="w-full bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Create My Brand <Sparkles className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Back Button */}
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="w-full mt-4 text-gray-600 py-2 font-medium hover:text-gray-800"
          >
            Back
          </button>
        )}
      </div>
    </div>
  );
}
