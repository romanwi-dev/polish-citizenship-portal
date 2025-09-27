/* ================================================
   DESIGN SETTINGS PANEL - Live Theme Editor
   ================================================ */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Palette, 
  Type, 
  Layout, 
  Download, 
  Upload, 
  RotateCcw,
  Sun,
  Moon,
  Monitor,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';

const DesignSettings = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('colors');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initialize from localStorage or system preference to prevent FOUC
    const saved = localStorage.getItem('themePreference');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [settings, setSettings] = useState({
    // Colors
    accent: '#5aa2ff',
    accent2: '#60d2b6',
    hacAccent: '#ffd166',
    okColor: '#2ecc71',
    warnColor: '#f1c40f',
    errColor: '#e74c3c',
    
    // Typography
    baseSize: 15,
    titleSize: 16.5,
    kpiSize: 16,
    
    // Spacing
    gridGap: 16,
    cardPadding: 14,
    borderRadius: 16,
    buttonRadius: 12,
    
    // Shadows & Effects
    shadowIntensity: 0.22,
    blurIntensity: 16,
    
    // Animation
    timingFast: 140,
    timingMed: 220,
    timingSlow: 360
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('designSystemSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Add keyboard event handling for accessibility
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Focus trap would be implemented here for full accessibility
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen]);

  // Apply settings to CSS custom properties
  useEffect(() => {
    const root = document.documentElement;
    
    // Colors
    root.style.setProperty('--accent', settings.accent);
    root.style.setProperty('--accent-2', settings.accent2);
    root.style.setProperty('--hac-accent', settings.hacAccent);
    root.style.setProperty('--ok', settings.okColor);
    root.style.setProperty('--warn', settings.warnColor);
    root.style.setProperty('--err', settings.errColor);
    
    // Typography
    root.style.setProperty('--base', `${settings.baseSize}px`);
    root.style.setProperty('--title', `${settings.titleSize}px`);
    root.style.setProperty('--kpi', `${settings.kpiSize}px`);
    
    // Spacing
    root.style.setProperty('--grid-gap', `${settings.gridGap}px`);
    root.style.setProperty('--card-padding', `${settings.cardPadding}px 16px`);
    root.style.setProperty('--radius-card', `${settings.borderRadius}px`);
    root.style.setProperty('--radius-btn', `${settings.buttonRadius}px`);
    
    // Effects
    root.style.setProperty('--shadow', `0 6px 24px rgba(0, 0, 0, ${settings.shadowIntensity})`);
    
    // Animation
    root.style.setProperty('--timing-fast', `${settings.timingFast}ms`);
    root.style.setProperty('--timing-med', `${settings.timingMed}ms`);
    root.style.setProperty('--timing-slow', `${settings.timingSlow}ms`);
  }, [settings]);

  // Theme toggle handled by unified theme system
  // This effect is no longer needed as the unified theme system handles DOM manipulation

  const saveSettings = () => {
    localStorage.setItem('designSystemSettings', JSON.stringify(settings));
    alert('Design settings saved successfully!');
  };

  const resetSettings = () => {
    if (window.confirm('Reset all design settings to default values?')) {
      const defaultSettings = {
        accent: '#5aa2ff',
        accent2: '#60d2b6',
        hacAccent: '#ffd166',
        okColor: '#2ecc71',
        warnColor: '#f1c40f',
        errColor: '#e74c3c',
        baseSize: 15,
        titleSize: 16.5,
        kpiSize: 16,
        gridGap: 16,
        cardPadding: 14,
        borderRadius: 16,
        buttonRadius: 12,
        shadowIntensity: 0.22,
        blurIntensity: 16,
        timingFast: 140,
        timingMed: 220,
        timingSlow: 360
      };
      setSettings(defaultSettings);
    }
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'design-system-settings.json';
    link.click();
  };

  const importSettings = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          setSettings(imported);
        } catch (error) {
          alert('Invalid settings file');
        }
      };
      reader.readAsText(file);
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const ColorPicker = ({ label, value, onChange }) => (
    <div className="field">
      <label className="label">{label}</label>
      <div className="flex gap-2 items-center">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-10 rounded-lg border border-border cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input flex-1"
          placeholder="#000000"
        />
      </div>
    </div>
  );

  const NumberSlider = ({ label, value, onChange, min, max, step = 1, unit = "" }) => (
    <div className="field">
      <label className="label">{label}</label>
      <div className="flex gap-2 items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="flex-1"
        />
        <span className="text-sm w-12 text-right text-muted">
          {value}{unit}
        </span>
      </div>
    </div>
  );

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-50 btn btn-primary btn-icon shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        data-testid="button-design-settings"
      >
        <Settings className="icon" />
      </motion.button>

      {/* Design Settings Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            aria-label="Close design settings panel"
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-96 h-full bg-glass border-r border-border backdrop-blur-xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="design-settings-title"
            >
              {/* Header */}
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 id="design-settings-title" className="glass-title">Design Settings</h2>
                  <button
                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                    className="btn btn-ghost btn-sm"
                    data-testid="button-preview-mode"
                  >
                    {isPreviewMode ? <EyeOff className="icon-sm" /> : <Eye className="icon-sm" />}
                    {isPreviewMode ? 'Exit Preview' : 'Preview'}
                  </button>
                </div>
                
                {/* Theme Toggle */}
                <div className="flex items-center gap-2 p-2 glass-card-light rounded-lg">
                  <button
                    onClick={() => setIsDarkMode(true)}
                    className={`btn btn-sm ${isDarkMode ? 'btn-primary' : 'btn-ghost'}`}
                    aria-pressed={isDarkMode}
                    aria-label="Switch to dark theme"
                  >
                    <Moon className="icon-sm" />
                    Dark
                  </button>
                  <button
                    onClick={() => setIsDarkMode(false)}
                    className={`btn btn-sm ${!isDarkMode ? 'btn-primary' : 'btn-ghost'}`}
                    aria-pressed={!isDarkMode}
                    aria-label="Switch to light theme"
                  >
                    <Sun className="icon-sm" />
                    Light
                  </button>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="tabs">
                <div className="tab-list px-6">
                  {[
                    { id: 'colors', label: 'Colors', icon: Palette },
                    { id: 'typography', label: 'Typography', icon: Type },
                    { id: 'layout', label: 'Layout', icon: Layout },
                    { id: 'effects', label: 'Effects', icon: Settings }
                  ].map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                      >
                        <Icon className="icon-sm" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'colors' && (
                  <div className="space-y-4">
                    <ColorPicker
                      label="Primary Accent"
                      value={settings.accent}
                      onChange={(value) => updateSetting('accent', value)}
                    />
                    <ColorPicker
                      label="Secondary Accent"
                      value={settings.accent2}
                      onChange={(value) => updateSetting('accent2', value)}
                    />
                    <ColorPicker
                      label="HAC Accent"
                      value={settings.hacAccent}
                      onChange={(value) => updateSetting('hacAccent', value)}
                    />
                    <ColorPicker
                      label="Success Color"
                      value={settings.okColor}
                      onChange={(value) => updateSetting('okColor', value)}
                    />
                    <ColorPicker
                      label="Warning Color"
                      value={settings.warnColor}
                      onChange={(value) => updateSetting('warnColor', value)}
                    />
                    <ColorPicker
                      label="Error Color"
                      value={settings.errColor}
                      onChange={(value) => updateSetting('errColor', value)}
                    />
                  </div>
                )}

                {activeTab === 'typography' && (
                  <div className="space-y-4">
                    <NumberSlider
                      label="Base Font Size"
                      value={settings.baseSize}
                      onChange={(value) => updateSetting('baseSize', value)}
                      min={12}
                      max={20}
                      unit="px"
                    />
                    <NumberSlider
                      label="Title Font Size"
                      value={settings.titleSize}
                      onChange={(value) => updateSetting('titleSize', value)}
                      min={14}
                      max={24}
                      unit="px"
                      step={0.5}
                    />
                    <NumberSlider
                      label="KPI Font Size"
                      value={settings.kpiSize}
                      onChange={(value) => updateSetting('kpiSize', value)}
                      min={14}
                      max={24}
                      unit="px"
                    />
                  </div>
                )}

                {activeTab === 'layout' && (
                  <div className="space-y-4">
                    <NumberSlider
                      label="Grid Gap"
                      value={settings.gridGap}
                      onChange={(value) => updateSetting('gridGap', value)}
                      min={8}
                      max={32}
                      unit="px"
                    />
                    <NumberSlider
                      label="Card Padding"
                      value={settings.cardPadding}
                      onChange={(value) => updateSetting('cardPadding', value)}
                      min={8}
                      max={24}
                      unit="px"
                    />
                    <NumberSlider
                      label="Border Radius"
                      value={settings.borderRadius}
                      onChange={(value) => updateSetting('borderRadius', value)}
                      min={4}
                      max={32}
                      unit="px"
                    />
                    <NumberSlider
                      label="Button Radius"
                      value={settings.buttonRadius}
                      onChange={(value) => updateSetting('buttonRadius', value)}
                      min={4}
                      max={24}
                      unit="px"
                    />
                  </div>
                )}

                {activeTab === 'effects' && (
                  <div className="space-y-4">
                    <NumberSlider
                      label="Shadow Intensity"
                      value={settings.shadowIntensity}
                      onChange={(value) => updateSetting('shadowIntensity', value)}
                      min={0}
                      max={0.5}
                      step={0.01}
                    />
                    <NumberSlider
                      label="Animation Speed (Fast)"
                      value={settings.timingFast}
                      onChange={(value) => updateSetting('timingFast', value)}
                      min={50}
                      max={300}
                      unit="ms"
                      step={10}
                    />
                    <NumberSlider
                      label="Animation Speed (Medium)"
                      value={settings.timingMed}
                      onChange={(value) => updateSetting('timingMed', value)}
                      min={100}
                      max={500}
                      unit="ms"
                      step={10}
                    />
                    <NumberSlider
                      label="Animation Speed (Slow)"
                      value={settings.timingSlow}
                      onChange={(value) => updateSetting('timingSlow', value)}
                      min={200}
                      max={800}
                      unit="ms"
                      step={10}
                    />
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-border mt-auto">
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={saveSettings}
                    className="btn btn-primary flex-1"
                    data-testid="button-save-settings"
                  >
                    <Save className="icon-sm" />
                    Save
                  </button>
                  <button
                    onClick={resetSettings}
                    className="btn btn-outline"
                    data-testid="button-reset-settings"
                  >
                    <RotateCcw className="icon-sm" />
                  </button>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={exportSettings}
                    className="btn btn-ghost flex-1"
                    data-testid="button-export-settings"
                  >
                    <Download className="icon-sm" />
                    Export
                  </button>
                  <label className="btn btn-ghost flex-1 cursor-pointer">
                    <Upload className="icon-sm" />
                    Import
                    <input
                      type="file"
                      accept=".json"
                      onChange={importSettings}
                      className="hidden"
                      data-testid="input-import-settings"
                    />
                  </label>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DesignSettings;