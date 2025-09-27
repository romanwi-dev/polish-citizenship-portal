import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Palette, 
  Copy, 
  Download, 
  Upload, 
  RefreshCw, 
  Check,
  Eye,
  EyeOff,
  Sparkles,
  Image as ImageIcon,
  Settings,
  Save
} from 'lucide-react';
import {
  generatePalette,
  applyPaletteToCSS,
  loadSavedPalette,
  resetPalette,
  extractColorsFromImage,
  getContrastRatio,
  hexToRgb,
  type ColorPalette,
  type PaletteMode
} from '@/utils/colorPalette';

export function ColorPaletteGenerator() {
  const [baseColor, setBaseColor] = useState('#8B5CF6');
  const [mode, setMode] = useState<PaletteMode>('complementary');
  const [palette, setPalette] = useState<ColorPalette | null>(null);
  const [imageColors, setImageColors] = useState<string[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load saved palette on mount
    const saved = loadSavedPalette();
    if (saved) {
      setPalette(saved);
      setBaseColor(saved.primary);
    } else {
      // Generate initial palette
      const newPalette = generatePalette(baseColor, mode);
      setPalette(newPalette);
    }
  }, []);

  const handleGeneratePalette = () => {
    const newPalette = generatePalette(baseColor, mode);
    setPalette(newPalette);
    
    if (isPreviewMode) {
      applyPaletteToCSS(newPalette);
    }
    
    toast({
      title: "Palette Generated",
      description: `Created a ${mode} color palette`,
    });
  };

  const handleApplyPalette = () => {
    if (palette) {
      applyPaletteToCSS(palette);
      setIsPreviewMode(true);
      toast({
        title: "Palette Applied",
        description: "Your custom palette has been applied to the application",
      });
    }
  };

  const handleResetPalette = () => {
    resetPalette();
    setIsPreviewMode(false);
    toast({
      title: "Palette Reset",
      description: "Reverted to the default color scheme",
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const imageUrl = e.target?.result as string;
        const colors = await extractColorsFromImage(imageUrl, 6);
        setImageColors(colors);
        
        if (colors.length > 0) {
          setBaseColor(colors[0]);
          const newPalette = generatePalette(colors[0], mode);
          setPalette(newPalette);
          
          toast({
            title: "Colors Extracted",
            description: `Found ${colors.length} dominant colors in the image`,
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to extract colors from image",
          variant: "destructive",
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const copyToClipboard = async (color: string, name: string) => {
    try {
      await navigator.clipboard.writeText(color);
      setCopiedColor(color);
      setTimeout(() => setCopiedColor(null), 2000);
      toast({
        title: "Copied",
        description: `${name}: ${color}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy color",
        variant: "destructive",
      });
    }
  };

  const exportPalette = () => {
    if (!palette) return;

    const paletteData = {
      ...palette,
      generated: new Date().toISOString(),
      mode: mode,
    };

    const blob = new Blob([JSON.stringify(paletteData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `palette-${mode}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exported",
      description: "Palette saved as JSON file",
    });
  };

  const exportAsCSS = () => {
    if (!palette) return;

    const cssVars = Object.entries(palette)
      .map(([key, value]) => `  --color-${key}: ${value};`)
      .join('\n');

    const cssContent = `:root {\n${cssVars}\n}`;

    const blob = new Blob([cssContent], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `palette-${mode}-${Date.now()}.css`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exported",
      description: "Palette saved as CSS file",
    });
  };

  const ColorCard = ({ name, color }: { name: string; color: string }) => {
    const rgb = hexToRgb(color);
    const whiteContrast = getContrastRatio(rgb, { r: 255, g: 255, b: 255 });
    const blackContrast = getContrastRatio(rgb, { r: 0, g: 0, b: 0 });
    const textColor = whiteContrast > blackContrast ? '#ffffff' : '#000000';

    return (
      <div
        className="relative group rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105"
        style={{ backgroundColor: color }}
        onClick={() => copyToClipboard(color, name)}
      >
        <div className="p-4 h-24 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span 
              className="text-sm font-medium capitalize"
              style={{ color: textColor }}
            >
              {name}
            </span>
            {copiedColor === color ? (
              <Check className="w-4 h-4" style={{ color: textColor }} />
            ) : (
              <Copy className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" 
                    style={{ color: textColor }} />
            )}
          </div>
          <span 
            className="text-xs font-mono"
            style={{ color: textColor }}
          >
            {color}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Adaptive Color Palette Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="generator" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="generator">
                <Sparkles className="w-4 h-4 mr-2" />
                Generator
              </TabsTrigger>
              <TabsTrigger value="image">
                <ImageIcon className="w-4 h-4 mr-2" />
                From Image
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generator" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="base-color">Base Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="base-color"
                      type="color"
                      value={baseColor}
                      onChange={(e) => setBaseColor(e.target.value)}
                      className="w-20 h-10 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={baseColor}
                      onChange={(e) => setBaseColor(e.target.value)}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="palette-mode">Palette Mode</Label>
                  <Select value={mode} onValueChange={(value) => setMode(value as PaletteMode)}>
                    <SelectTrigger id="palette-mode" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="complementary">Complementary</SelectItem>
                      <SelectItem value="analogous">Analogous</SelectItem>
                      <SelectItem value="triadic">Triadic</SelectItem>
                      <SelectItem value="tetradic">Tetradic</SelectItem>
                      <SelectItem value="monochromatic">Monochromatic</SelectItem>
                      <SelectItem value="split-complementary">Split Complementary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleGeneratePalette} className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generate Palette
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="image" className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">
                  Upload an image to extract its color palette
                </p>
                <Button onClick={() => fileInputRef.current?.click()}>
                  Choose Image
                </Button>
              </div>

              {imageColors.length > 0 && (
                <div className="space-y-2">
                  <Label>Extracted Colors</Label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {imageColors.map((color, index) => (
                      <div
                        key={index}
                        className="h-16 rounded cursor-pointer hover:scale-105 transition-transform"
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          setBaseColor(color);
                          toast({
                            title: "Color Selected",
                            description: `Set ${color} as base color`,
                          });
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Live Preview</h3>
                    <p className="text-sm text-gray-500">
                      Apply palette changes in real-time
                    </p>
                  </div>
                  <Button
                    variant={isPreviewMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                  >
                    {isPreviewMode ? (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Preview On
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-4 h-4 mr-2" />
                        Preview Off
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleApplyPalette} className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    Apply & Save Palette
                  </Button>
                  <Button onClick={handleResetPalette} variant="outline" className="flex-1">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset to Default
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button onClick={exportPalette} variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Export JSON
                  </Button>
                  <Button onClick={exportAsCSS} variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSS
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {palette && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Palette</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ColorCard name="primary" color={palette.primary} />
              <ColorCard name="secondary" color={palette.secondary} />
              <ColorCard name="tertiary" color={palette.tertiary} />
              <ColorCard name="accent" color={palette.accent} />
              <ColorCard name="background" color={palette.background} />
              <ColorCard name="surface" color={palette.surface} />
              <ColorCard name="border" color={palette.border} />
              <ColorCard name="text" color={palette.text} />
              <ColorCard name="error" color={palette.error} />
              <ColorCard name="warning" color={palette.warning} />
              <ColorCard name="success" color={palette.success} />
              <ColorCard name="info" color={palette.info} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}