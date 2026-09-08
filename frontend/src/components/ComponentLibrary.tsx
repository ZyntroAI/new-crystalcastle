import { 
  RectangleHorizontal, Square, CheckSquare, CreditCard, Menu, Image,
  Circle, ToggleLeft, ChevronDown, SlidersHorizontal, Hash, User,
  Tag, LayoutList, Columns3, Minus, LayoutGrid, Video, Activity,
  BarChart3, Table, List, AlertCircle, MessageSquare, Loader2,
  FileText, Calendar, Upload, Search, UserCircle2, Star, DollarSign,
  Navigation, Footprints, Navigation2Off, Folder
} from 'lucide-react';
import { ComponentType } from '../types/canvas';
import { useCanvasStore } from '../stores/canvasStore';
import { useLanguageStore } from '../stores/languageStore';
import { useTranslation } from '../lib/translations';
import { useState } from 'react';

interface ComponentItem {
  type: ComponentType;
  icon: React.ReactNode;
  labelKey: string;
}

interface ComponentCategory {
  nameKey: string;
  items: ComponentItem[];
}

export default function ComponentLibrary() {
  const { currentColor } = useCanvasStore();
  const { currentLanguage } = useLanguageStore();
  const t = useTranslation(currentLanguage);
  
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['basicComponents', 'navigationComponents'])
  );

  const componentCategories: ComponentCategory[] = [
    {
      nameKey: 'basicComponents',
      items: [
        { type: 'button', icon: <RectangleHorizontal className="w-4 h-4" />, labelKey: 'button' },
        { type: 'input', icon: <Square className="w-4 h-4" />, labelKey: 'input' },
        { type: 'checkbox', icon: <CheckSquare className="w-4 h-4" />, labelKey: 'checkbox' },
        { type: 'radio', icon: <Circle className="w-4 h-4" />, labelKey: 'radio' },
        { type: 'toggle', icon: <ToggleLeft className="w-4 h-4" />, labelKey: 'toggle' },
        { type: 'dropdown', icon: <ChevronDown className="w-4 h-4" />, labelKey: 'dropdown' },
        { type: 'slider', icon: <SlidersHorizontal className="w-4 h-4" />, labelKey: 'slider' },
        { type: 'badge', icon: <Hash className="w-4 h-4" />, labelKey: 'badge' },
        { type: 'avatar', icon: <User className="w-4 h-4" />, labelKey: 'avatar' },
        { type: 'tag', icon: <Tag className="w-4 h-4" />, labelKey: 'tag' },
      ]
    },
    {
      nameKey: 'navigationComponents',
      items: [
        { type: 'navbar', icon: <Menu className="w-4 h-4" />, labelKey: 'navbar' },
        { type: 'sidebar', icon: <LayoutList className="w-4 h-4" />, labelKey: 'sidebar' },
        { type: 'tabbar', icon: <Navigation className="w-4 h-4" />, labelKey: 'tabbar' },
        { type: 'breadcrumb', icon: <Navigation2Off className="w-4 h-4" />, labelKey: 'breadcrumb' },
        { type: 'footer', icon: <Footprints className="w-4 h-4" />, labelKey: 'footer' },
      ]
    },
    {
      nameKey: 'layoutComponents',
      items: [
        { type: 'card', icon: <CreditCard className="w-4 h-4" />, labelKey: 'card' },
        { type: 'container', icon: <Folder className="w-4 h-4" />, labelKey: 'container' },
        { type: 'grid', icon: <LayoutGrid className="w-4 h-4" />, labelKey: 'grid' },
        { type: 'divider', icon: <Minus className="w-4 h-4" />, labelKey: 'divider' },
      ]
    },
    {
      nameKey: 'displayComponents',
      items: [
        { type: 'image', icon: <Image className="w-4 h-4" />, labelKey: 'image' },
        { type: 'video', icon: <Video className="w-4 h-4" />, labelKey: 'video' },
        { type: 'progress', icon: <Activity className="w-4 h-4" />, labelKey: 'progress' },
        { type: 'chart', icon: <BarChart3 className="w-4 h-4" />, labelKey: 'chart' },
        { type: 'table', icon: <Table className="w-4 h-4" />, labelKey: 'table' },
        { type: 'list', icon: <List className="w-4 h-4" />, labelKey: 'list' },
      ]
    },
    {
      nameKey: 'feedbackComponents',
      items: [
        { type: 'alert', icon: <AlertCircle className="w-4 h-4" />, labelKey: 'alert' },
        { type: 'modal', icon: <Columns3 className="w-4 h-4" />, labelKey: 'modal' },
        { type: 'tooltip', icon: <MessageSquare className="w-4 h-4" />, labelKey: 'tooltip' },
        { type: 'loading', icon: <Loader2 className="w-4 h-4" />, labelKey: 'loading' },
      ]
    },
    {
      nameKey: 'formComponents',
      items: [
        { type: 'textarea', icon: <FileText className="w-4 h-4" />, labelKey: 'textarea' },
        { type: 'datepicker', icon: <Calendar className="w-4 h-4" />, labelKey: 'datepicker' },
        { type: 'upload', icon: <Upload className="w-4 h-4" />, labelKey: 'upload' },
        { type: 'searchbar', icon: <Search className="w-4 h-4" />, labelKey: 'searchbar' },
      ]
    },
    {
      nameKey: 'specialComponents',
      items: [
        { type: 'profile', icon: <UserCircle2 className="w-4 h-4" />, labelKey: 'profile' },
        { type: 'comment', icon: <MessageSquare className="w-4 h-4" />, labelKey: 'comment' },
        { type: 'rating', icon: <Star className="w-4 h-4" />, labelKey: 'rating' },
        { type: 'pricing', icon: <DollarSign className="w-4 h-4" />, labelKey: 'pricing' },
      ]
    }
  ];

  const handleComponentDrag = (type: ComponentType) => {
    return (e: React.DragEvent) => {
      e.dataTransfer.setData('componentType', type);
    };
  };

  const toggleCategory = (categoryKey: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryKey)) {
        newSet.delete(categoryKey);
      } else {
        newSet.add(categoryKey);
      }
      return newSet;
    });
  };

  return (
    <div className="w-72 bg-card border-l border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">{t('componentLibrary')}</h3>
        <p className="text-xs text-muted-foreground mt-1">{t('dragToCanvas')}</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {componentCategories.map((category) => (
          <div key={category.nameKey} className="border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleCategory(category.nameKey)}
              className="w-full px-3 py-2 bg-secondary hover:bg-accent flex items-center justify-between text-sm font-medium text-foreground transition-colors"
            >
              <span>{t(category.nameKey as any)}</span>
              <ChevronDown 
                className={`w-4 h-4 transition-transform ${
                  expandedCategories.has(category.nameKey) ? 'rotate-180' : ''
                }`}
              />
            </button>
            
            {expandedCategories.has(category.nameKey) && (
              <div className="grid grid-cols-2 gap-2 p-2 bg-card">
                {category.items.map((comp) => (
                  <div
                    key={comp.type}
                    draggable
                    onDragStart={handleComponentDrag(comp.type)}
                    className="flex flex-col items-center justify-center p-3 bg-secondary rounded-md cursor-move hover:bg-accent hover:shadow-sm transition-all group"
                  >
                    <div className="text-muted-foreground group-hover:text-foreground mb-1.5 transition-colors">
                      {comp.icon}
                    </div>
                    <span className="text-xs text-foreground font-medium text-center leading-tight">
                      {t(comp.labelKey as any)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-border bg-secondary/50">
        <h4 className="text-xs font-semibold mb-2 text-muted-foreground uppercase">{t('quickTips')}</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• {t('tip1')}</li>
          <li>• {t('tip2')}</li>
          <li>• {t('tip3')}</li>
        </ul>
      </div>
    </div>
  );
}
