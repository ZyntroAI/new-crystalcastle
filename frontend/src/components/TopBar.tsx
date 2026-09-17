import { Undo2, Redo2, Download, Trash2, Palette, X, Languages, LayoutTemplate } from 'lucide-react';
import { useState } from 'react';
import TemplatesModal from './TemplatesModal';
import { useCanvasStore } from '../stores/canvasStore';
import { useLanguageStore, Language } from '../stores/languageStore';
import { useTranslation } from '../lib/translations';
import { Button } from './ui/button';

const colorPresets = [
'#1a1a1a',
'#7c3aed',
'#ef4444',
'#f59e0b',
'#10b981',
'#3b82f6'];


const languages: {code: Language;label: string;flag: string;}[] = [
{ code: 'en', label: 'English', flag: '🇺🇸' },
{ code: 'zh', label: '中文', flag: '🇨🇳' },
{ code: 'pt', label: 'Português', flag: '🇧🇷' },
{ code: 'es', label: 'Español', flag: '🇪🇸' }];


export default function TopBar() {
  const [showTemplates, setShowTemplates] = useState(false);
  const { undo, redo, clear, currentColor, setColor, strokeWidth, setStrokeWidth, selectedElementId, deleteElement } = useCanvasStore();
  const { currentLanguage, setLanguage } = useLanguageStore();
  const t = useTranslation(currentLanguage);

  const handleExport = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'sketch-' + Date.now() + '.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <div className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-foreground">{t('appName')}</h1>
        <div className="h-6 w-px bg-border" />
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={undo} title={t('undo')}>
            <Undo2 className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={redo} title={t('redo')}>
            <Redo2 className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={clear} title={t('clear')}>
            <Trash2 className="w-5 h-5" />
          </Button>
          {selectedElementId &&
          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteElement(selectedElementId)}
            title={t('delete')}
            className="text-destructive hover:text-destructive hover:bg-destructive/10">

              <X className="w-5 h-5" />
            </Button>
          }
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 bg-secondary px-4 py-2 rounded-lg">
          <Palette className="w-4 h-4 text-muted-foreground" />
          <div className="flex items-center gap-2">
            {colorPresets.map((color) =>
            <button
              key={color}
              className={`w-6 h-6 rounded-full border-2 transition-all ${
              currentColor === color ? 'border-primary scale-110' : 'border-border'}`
              }
              style={{ backgroundColor: color }}
              onClick={() => setColor(color)}
              title={t('color')} />

            )}
          </div>
        </div>

        












        <div className="relative group">
          <Button variant="ghost" size="icon" title="Language">
            <Languages className="w-5 h-5" />
          </Button>
          <div className="absolute right-0 top-full mt-2 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 min-w-[150px]">
            {languages.map((lang) =>
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2 ${
              currentLanguage === lang.code ? 'bg-accent font-medium' : ''} first:rounded-t-lg last:rounded-b-lg`
              }>

                <span className="text-lg">{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            )}
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => setShowTemplates(true)}
          className="gap-2 border-primary/30 hover:border-primary hover:bg-primary/5"
        >
          <LayoutTemplate className="w-4 h-4" />
          {t('templates')}
        </Button>

        <Button onClick={handleExport} className="gap-2">
          <Download className="w-4 h-4" />
          {t('export')}
        </Button>
      </div>

      {showTemplates && (
        <TemplatesModal onClose={() => setShowTemplates(false)} />
      )}
    </div>);

}