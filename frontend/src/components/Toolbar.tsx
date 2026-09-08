import { MousePointer2, Pen, Square, Circle, Minus, Type, Eraser } from 'lucide-react';
import { useCanvasStore } from '../stores/canvasStore';
import { useLanguageStore } from '../stores/languageStore';
import { useTranslation } from '../lib/translations';
import { ToolType } from '../types/canvas';
import { Button } from './ui/button';

export default function Toolbar() {
  const { currentTool, setCurrentTool } = useCanvasStore();
  const { currentLanguage } = useLanguageStore();
  const t = useTranslation(currentLanguage);

  const tools: { type: ToolType; icon: React.ReactNode; labelKey: keyof ReturnType<typeof useTranslation> }[] = [
    { type: 'select', icon: <MousePointer2 className="w-5 h-5" />, labelKey: 'select' },
    { type: 'pen', icon: <Pen className="w-5 h-5" />, labelKey: 'pen' },
    { type: 'rectangle', icon: <Square className="w-5 h-5" />, labelKey: 'rectangle' },
    { type: 'circle', icon: <Circle className="w-5 h-5" />, labelKey: 'circle' },
    { type: 'line', icon: <Minus className="w-5 h-5" />, labelKey: 'line' },
    { type: 'text', icon: <Type className="w-5 h-5" />, labelKey: 'text' },
    { type: 'eraser', icon: <Eraser className="w-5 h-5" />, labelKey: 'eraser' },
  ];

  return (
    <div className="w-16 bg-card border-r border-border flex flex-col items-center py-4 gap-2">
      {tools.map((tool) => (
        <Button
          key={tool.type}
          variant={currentTool === tool.type ? 'default' : 'ghost'}
          size="icon"
          onClick={() => setCurrentTool(tool.type)}
          title={t(tool.labelKey)}
          className="w-12 h-12"
        >
          {tool.icon}
        </Button>
      ))}
    </div>
  );
}
