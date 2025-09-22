import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, Smartphone, Palette, Sparkles } from 'lucide-react';
import { PhonePreview } from './PhonePreview';
import { useToast } from '../hooks/use-toast';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API = `${API_BASE}/api`;

const WallpaperGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('');
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [selectedPhone, setSelectedPhone] = useState('iphone');
  const { toast } = useToast();

  const styles = [
    { value: '', label: 'Default' },
    { value: 'minimalist', label: 'Minimalist' },
    { value: 'abstract', label: 'Abstract' },
    { value: 'nature', label: 'Nature' },
    { value: 'cyberpunk', label: 'Cyberpunk' },
    { value: 'vintage', label: 'Vintage' },
    { value: 'neon', label: 'Neon' },
    { value: 'watercolor', label: 'Watercolor' },
    { value: 'geometric', label: 'Geometric' },
    { value: 'dark mode', label: 'Dark Mode' },
  ];

  const aspectRatios = [
    { value: '9:16', label: '9:16 (Phone)' },
    { value: '3:4', label: '3:4 (Tablet)' },
    { value: '16:9', label: '16:9 (Desktop)' },
    { value: '1:1', label: '1:1 (Square)' },
  ];

  const phoneTypes = [
    { value: 'iphone', label: 'iPhone' },
    { value: 'android', label: 'Android' },
    { value: 'pixel', label: 'Google Pixel' },
  ];

  const generateWallpaper = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt for your wallpaper.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API}/wallpaper/generate`, {
        prompt: prompt.trim(),
        aspect_ratio: aspectRatio,
        style: style,
      });

      if (response.data.success) {
        setGeneratedImage({
          url: response.data.image_url,
          prompt: response.data.prompt,
          aspectRatio: response.data.aspect_ratio,
        });
        toast({
          title: "Success!",
          description: "Your wallpaper has been generated successfully.",
        });
      } else {
        throw new Error(response.data.error || 'Failed to generate wallpaper');
      }
    } catch (error) {
      console.error('Error generating wallpaper:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || error.message || "Failed to generate wallpaper. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadWallpaper = async () => {
    if (!generatedImage?.url) return;

    try {
      const response = await fetch(generatedImage.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `wallpaper-${Date.now()}.webp`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Downloaded!",
        description: "Your wallpaper has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download wallpaper. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-2 bg-white/60 backdrop-blur-sm rounded-full shadow-lg mb-4">
            <Sparkles className="h-8 w-8 text-indigo-600 animate-pulse" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
            AI Wallpaper Generator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Create stunning phone wallpapers with AI and preview them on realistic phone mockups</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Generator Controls */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Palette className="h-5 w-5 text-indigo-600" />
                Wallpaper Settings
              </CardTitle>
              <CardDescription className="text-gray-600">
                Customize your AI-generated wallpaper
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="prompt">Wallpaper Prompt *</Label>
                <Textarea
                  id="prompt"
                  placeholder="Describe your ideal wallpaper... (e.g., 'Serene mountain landscape at sunset with purple sky')"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Style</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      {styles.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Aspect Ratio</Label>
                  <Select value={aspectRatio} onValueChange={setAspectRatio}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {aspectRatios.map((ratio) => (
                        <SelectItem key={ratio.value} value={ratio.value}>
                          {ratio.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={generateWallpaper}
                disabled={isLoading || !prompt.trim()}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Wallpaper
                  </>
                )}
              </Button>

              {generatedImage && (
                <Button
                  onClick={downloadWallpaper}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Wallpaper
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Phone Preview */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Smartphone className="h-5 w-5 text-indigo-600" />
                Preview
              </CardTitle>
              <CardDescription className="text-gray-600">
                See how your wallpaper looks on different phones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {phoneTypes.map((phone) => (
                    <Badge
                      key={phone.value}
                      variant={selectedPhone === phone.value ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setSelectedPhone(phone.value)}
                    >
                      {phone.label}
                    </Badge>
                  ))}
                </div>

                <div className="flex justify-center">
                  <PhonePreview
                    phoneType={selectedPhone}
                    wallpaperUrl={generatedImage?.url}
                    isLoading={isLoading}
                  />
                </div>

                {generatedImage && (
                  <div className="text-center text-sm text-gray-600 mt-4">
                    <p className="font-medium">Generated from:</p>
                    <p className="italic">"{generatedImage.prompt}"</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WallpaperGenerator;