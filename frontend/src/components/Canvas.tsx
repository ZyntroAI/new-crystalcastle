import { useEffect, useRef, useState } from 'react';
import { useCanvasStore } from '../stores/canvasStore';
import { Point, DrawElement, ComponentType } from '../types/canvas';

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentElement, setCurrentElement] = useState<DrawElement | null>(null);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  const [textInput, setTextInput] = useState<{ x: number; y: number; show: boolean }>({ x: 0, y: 0, show: false });
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const textInputRef = useRef<HTMLDivElement>(null);

  const { 
    currentTool, 
    elements, 
    addElement,
    updateElement,
    currentColor, 
    strokeWidth,
    selectedElementId,
    setSelectedElement,
    deleteElement
  } = useCanvasStore();

  // Handle keyboard events for delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId) {
        e.preventDefault();
        deleteElement(selectedElementId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, deleteElement]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all elements
    elements.forEach((element) => {
      drawElement(ctx, element);
      
      // Draw selection indicator
      if (element.id === selectedElementId) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        const padding = 5;
        
        // Handle different element types for selection box
        if (element.type === 'pen' && element.points && element.points.length > 0) {
          const xs = element.points.map(p => p.x);
          const ys = element.points.map(p => p.y);
          const minX = Math.min(...xs);
          const maxX = Math.max(...xs);
          const minY = Math.min(...ys);
          const maxY = Math.max(...ys);
          ctx.strokeRect(minX - padding, minY - padding, maxX - minX + padding * 2, maxY - minY + padding * 2);
        } else if (element.type === 'line' && element.points && element.points.length === 2) {
          const [p1, p2] = element.points;
          const minX = Math.min(p1.x, p2.x);
          const maxX = Math.max(p1.x, p2.x);
          const minY = Math.min(p1.y, p2.y);
          const maxY = Math.max(p1.y, p2.y);
          ctx.strokeRect(minX - padding, minY - padding, maxX - minX + padding * 2, maxY - minY + padding * 2);
        } else if (element.type === 'circle' && element.x !== undefined && element.y !== undefined && element.width) {
          const radius = Math.abs(element.width / 2);
          ctx.strokeRect(
            element.x - radius - padding,
            element.y - radius - padding,
            radius * 2 + padding * 2,
            radius * 2 + padding * 2
          );
        } else if (element.x !== undefined && element.y !== undefined) {
          ctx.strokeRect(
            element.x - padding,
            element.y - padding,
            (element.width || 0) + padding * 2,
            (element.height || 0) + padding * 2
          );
        }
        
        ctx.setLineDash([]);
      }
    });

    // Draw current element being created
    if (currentElement) {
      drawElement(ctx, currentElement);
    }
  }, [elements, currentElement, selectedElementId]);

  const drawElement = (ctx: CanvasRenderingContext2D, element: DrawElement) => {
    ctx.strokeStyle = element.color;
    ctx.lineWidth = element.strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Add roughness for sketch effect
    ctx.setLineDash([]);

    switch (element.type) {
      case 'pen':
        if (element.points && element.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(element.points[0].x, element.points[0].y);
          element.points.forEach((point) => {
            ctx.lineTo(point.x, point.y);
          });
          ctx.stroke();
        }
        break;

      case 'rectangle':
        if (element.x !== undefined && element.y !== undefined && element.width && element.height) {
          ctx.strokeRect(element.x, element.y, element.width, element.height);
        }
        break;

      case 'circle':
        if (element.x !== undefined && element.y !== undefined && element.width) {
          ctx.beginPath();
          ctx.arc(element.x, element.y, Math.abs(element.width / 2), 0, Math.PI * 2);
          ctx.stroke();
        }
        break;

      case 'line':
        if (element.points && element.points.length === 2) {
          ctx.beginPath();
          ctx.moveTo(element.points[0].x, element.points[0].y);
          ctx.lineTo(element.points[1].x, element.points[1].y);
          ctx.stroke();
        }
        break;

      case 'text':
        if (element.x !== undefined && element.y !== undefined && element.text) {
          ctx.fillStyle = element.color;
          ctx.font = `${element.strokeWidth * 8}px Inter`;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          ctx.fillText(element.text, element.x, element.y);
        }
        break;

      case 'button':
        if (element.x !== undefined && element.y !== undefined && element.width && element.height) {
          ctx.strokeRect(element.x, element.y, element.width, element.height);
          ctx.fillStyle = element.color;
          ctx.font = '14px Inter';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(
            element.text || 'Button', 
            element.x + element.width / 2, 
            element.y + element.height / 2
          );
        }
        break;

      case 'input':
        if (element.x !== undefined && element.y !== undefined && element.width && element.height) {
          ctx.strokeRect(element.x, element.y, element.width, element.height);
          ctx.fillStyle = '#999';
          ctx.font = '12px Inter';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText('Input field', element.x + 10, element.y + element.height / 2);
        }
        break;

      case 'checkbox':
        if (element.x !== undefined && element.y !== undefined && element.width && element.height) {
          ctx.strokeRect(element.x, element.y, element.width, element.height);
        }
        break;

      case 'card':
        if (element.x !== undefined && element.y !== undefined && element.width && element.height) {
          ctx.strokeRect(element.x, element.y, element.width, element.height);
          ctx.fillStyle = element.color;
          ctx.font = 'bold 16px Inter';
          ctx.textAlign = 'center';
          ctx.fillText('Card', element.x + element.width / 2, element.y + 30);
        }
        break;

      case 'navbar':
        if (element.x !== undefined && element.y !== undefined && element.width && element.height) {
          ctx.strokeRect(element.x, element.y, element.width, element.height);
          ctx.fillStyle = element.color;
          ctx.font = '14px Inter';
          ctx.textAlign = 'left';
          ctx.fillText('Logo', element.x + 20, element.y + element.height / 2);
          ctx.textAlign = 'right';
          ctx.fillText('Menu', element.x + element.width - 20, element.y + element.height / 2);
        }
        break;

      case 'image':
        if (element.x !== undefined && element.y !== undefined && element.width && element.height) {
          ctx.strokeRect(element.x, element.y, element.width, element.height);
          ctx.fillStyle = '#ddd';
          ctx.fillRect(element.x, element.y, element.width, element.height);
          ctx.fillStyle = element.color;
          ctx.font = '12px Inter';
          ctx.textAlign = 'center';
          ctx.fillText('Image', element.x + element.width / 2, element.y + element.height / 2);
        }
        break;

      // 基础组件
      case 'radio':
        if (element.x !== undefined && element.y !== undefined && element.width) {
          ctx.beginPath();
          ctx.arc(element.x + element.width/2, element.y + element.width/2, element.width/2, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;

      case 'toggle':
        if (element.x !== undefined && element.y !== undefined && element.width && element.height) {
          const radius = element.height / 2;
          ctx.beginPath();
          ctx.moveTo(element.x + radius, element.y);
          ctx.lineTo(element.x + element.width - radius, element.y);
          ctx.arc(element.x + element.width - radius, element.y + radius, radius, -Math.PI/2, Math.PI/2);
          ctx.lineTo(element.x + radius, element.y + element.height);
          ctx.arc(element.x + radius, element.y + radius, radius, Math.PI/2, -Math.PI/2);
          ctx.closePath();
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(element.x + element.width - radius, element.y + radius, radius - 4, 0, Math.PI * 2);
          ctx.fillStyle = element.color;
          ctx.fill();
        }
        break;

      case 'dropdown':
        if (element.x !== undefined && element.y !== undefined && element.width && element.height) {
          ctx.strokeRect(element.x, element.y, element.width, element.height);
          ctx.fillStyle = '#999';
          ctx.font = '12px Inter';
          ctx.textAlign = 'left';
          ctx.fillText('Select...', element.x + 10, element.y + element.height / 2);
          // Draw arrow
          ctx.beginPath();
          ctx.moveTo(element.x + element.width - 20, element.y + element.height / 2 - 3);
          ctx.lineTo(element.x + element.width - 15, element.y + element.height / 2 + 3);
          ctx.lineTo(element.x + element.width - 10, element.y + element.height / 2 - 3);
          ctx.stroke();
        }
        break;

      case 'slider':
        if (element.x !== undefined && element.y !== undefined && element.width && element.height) {
          const centerY = element.y + element.height / 2;
          ctx.beginPath();
          ctx.moveTo(element.x, centerY);
          ctx.lineTo(element.x + element.width, centerY);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(element.x + element.width * 0.6, centerY, 8, 0, Math.PI * 2);
          ctx.fillStyle = element.color;
          ctx.fill();
          ctx.stroke();
        }
        break;

      case 'badge':
        if (element.x !== undefined && element.y !== undefined && element.width && element.height) {
          const radius = element.height / 2;
          ctx.beginPath();
          ctx.moveTo(element.x + radius, element.y);
          ctx.lineTo(element.x + element.width - radius, element.y);
          ctx.arc(element.x + element.width - radius, element.y + radius, radius, -Math.PI/2, Math.PI/2);
          ctx.lineTo(element.x + radius, element.y + element.height);
          ctx.arc(element.x + radius, element.y + radius, radius, Math.PI/2, -Math.PI/2);
          ctx.closePath();
          ctx.stroke();
          ctx.fillStyle = element.color;
          ctx.font = '11px Inter';
          ctx.textAlign = 'center';
          ctx.fillText('New', element.x + element.width / 2, element.y + element.height / 2);
        }
        break;

      case 'avatar':
        if (element.x !== undefined && element.y !== undefined && element.width) {
          ctx.beginPath();
          ctx.arc(element.x + element.width/2, element.y + element.width/2, element.width/2, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = '#ddd';
          ctx.fill();
        }
        break;

      case 'tag':
        if (element.x !== undefined && element.y !== undefined && element.width && element.height) {
          ctx.strokeRect(element.x, element.y, element.width, element.height);
          ctx.fillStyle = element.color;
          ctx.font = '11px Inter';
          ctx.textAlign = 'center';
          ctx.fillText('Tag', element.x + element.width / 2, element.y + element.height / 2);
        }
        break;

      // 导航组件
      case 'sidebar':
        if (element.x !== undefined && element.y !== undefined && element.width && element.height) {
          ctx.strokeRect(element.x, element.y, element.width, element.height);
          ctx.fillStyle = element.color;
          ctx.font = '12px Inter';
          ctx.textAlign = 'left';
          ['Home', 'About', 'Contact'].forEach((item, i) => {
            ctx.fillText('• ' + item, element.x + 10, element.y + 30 + i * 30);
          });
        }
        break;

      case 'tabbar':
        if (element.x !== undefined && element.y !== undefined && element.width && element.height) {
          ctx.strokeRect(element.x, element.y, element.width, element.height);
          const tabWidth = element.width / 3;
          ['Tab 1', 'Tab 2', 'Tab 3'].forEach((tab, i) => {
            if (i > 0) {
              ctx.beginPath();
              ctx.moveTo(element.x + i * tabWidth, element.y);
              ctx.lineTo(element.x + i * tabWidth, element.y + element.height);
              ctx.stroke();
            }
            ctx.fillStyle = element.color;
            ctx.font = '11px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(tab, element.x + (i + 0.5) * tabWidth, element.y + element.height / 2);
          });
        }
        break;

      case 'breadcrumb':
        if (element.x !== undefined && element.y !== undefined && element.width && element.height) {
          ctx.strokeRect(element.x, element.y, element.width, element.height);
          ctx.fillStyle = element.color;
          ctx.font = '11px Inter';
          ctx.textAlign = 'left';
          ctx.fillText('Home > Products > Item', element.x + 10, element.y + element.height / 2);
        }
        break;

      case 'footer':
        if (element.x !== undefined && element.y !== undefined && element.width && element.height) {
          ctx.strokeRect(element.x, element.y, element.width, element.height);
          ctx.fillStyle = element.color;
          ctx.font = '10px Inter';
          ctx.textAlign = 'center';
          ctx.fillText('© 2025 Company Name', element.x + element.width / 2, element.y + element.height / 2);
        }
        break;

      // 布局组件
      case 'container':
        if (element.x !== undefined && element.y !== undefined && element.width && element.height) {
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(element.x, element.y, element.width, element.height);
          ctx.setLineDash([]);
          ctx.fillStyle = element.color;
          ctx.font = '10px Inter';
          ctx.textAlign = 'center';
          ctx.fillText('Container', element.x + element.width / 2, element.y + 15);
        }
        break;

      case 'grid':
        if (element.x !== undefined && element.y !== undefined && element.width && element.height) {
          ctx.strokeRect(element.x, element.y, element.width, element.height);
          const cols = 3;
          const rows = 2;
          for (let i = 1; i < cols; i++) {
            ctx.beginPath();
            ctx.moveTo(element.x + (element.width / cols) * i, element.y);
            ctx.lineTo(element.x + (element.width / cols) * i, element.y + element.height);
            ctx.stroke();
          }
          for (let i = 1; i < rows; i++) {
            ctx.beginPath();
            ctx.moveTo(element.x, element.y + (element.height / rows) * i);
            ctx.lineTo(element.x + element.width, element.y + (element.height / rows) * i);
            ctx.stroke();
          }
        }
        break;

      case 'divider':
        if (element.x !== undefined && element.y !== undefined && element.width) {
          ctx.beginPath();
          ctx.moveTo(element.x, element.y);
          ctx.lineTo(element.x + element.width, element.y);
          ctx.stroke();
        }
        break;

      // 展示组件
      case 'video':
        if (element.x !== undefined && element.y !== undefined && element.width && element.height) {
          ctx.strokeRect(element.x, element.y, element.width, element.height);
          ctx.fillStyle = '#333';
          ctx.fillRect(element.x, element.y, element.width, element.height);
          // Play button
          ctx.beginPath();
          ctx.moveTo(element.x + element.width / 2 - 15, element.y + element.height / 2 - 20);
          ctx.lineTo(element.x + element.width / 2 + 15, element.y + element.height / 2);
          ctx.lineTo(element.x + element.width / 2 - 15, element.y + element.height / 2 + 20);
          ctx.closePath();
          ctx.fillStyle = '#fff';
          ctx.fill();
        }
        break;

      case 'progress':
        if (element.x !== undefined && element.y !== undefined && element.width && element.height) {
          ctx.strokeRect(element.x, element.y, element.width, element.height);
          ctx.fillStyle = element.color;
          ctx.fillRect(element.x, element.y, element.width * 0.7, element.height);
        }
        break;

      case 'chart':
        if (element.x !== undefined && element.y !== undefined && element.width && element.height) {
          ctx.strokeRect(element.x, element.y, element.width, element.height);
          const barWidth = element.width / 5;
          [0.6, 0.8, 0.4, 0.9, 0.5].forEach((height, i) => {
            ctx.fillStyle = element.color;
            const barHeight = element.height * height * 0.8;
            ctx.fillRect(
              element.x + i * barWidth + 5,
              element.y + element.height - barHeight - 10,
              barWidth - 10,
              barHeight
            );
          });
        }
        break;

      case 'table':
        if (element.x !== undefined && element.y !== undefined && element.width && element.height) {
          ctx.strokeRect(element.x, element.y, element.width, element.height);
          const cols = 3;
          const rows = 3;
          for (let i = 1; i < cols; i++) {
            ctx.beginPath();
            ctx.moveTo(element.x + (element.width / cols) * i, element.y);
            ctx.lineTo(element.x + (element.width / cols) * i, element.y + element.height);
            ctx.stroke();
          }
          for (let i = 1; i <= rows; i++) {
            ctx.beginPath();
            ctx.moveTo(element.x, element.y + (element.height / (rows + 1)) * i);
            ctx.lineTo(element.x + element.width, element.y + (element.height / (rows + 1)) * i);
            ctx.stroke();
          }
          ctx.fillStyle = '#eee';
          ctx.fillRect(element.x, element.y, element.width, element.height / (rows + 1));
        }
        break;

      case 'list':
        if (element.x !== undefined && element.y !== undefined && element.width && element.height) {
          ctx.strokeRect(element.x, element.y, element.width, element.height);
          const itemHeight = element.height / 4;
          for (let i = 1; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(element.x, element.y + itemHeight * i);
            ctx.lineTo(element.x + element.width, element.y + itemHeight * i);
            ctx.stroke();
          }
          ctx.fillStyle = element.color;
          ctx.font = '11px Inter';
          ctx.textAlign = 'left';
          ['Item 1', 'Item 2', 'Item 3', 'Item 4'].forEach((item, i) => {
            ctx.fillText(item, element.x + 10, element.y + itemHeight * (i + 0.5));
          });
        }
        break;

      // 反馈组件
      case 'alert':
        if (element.x !== undefined && element.y !== undefined && element.width && element.height) {
          ctx.strokeRect(element.x, element.y, element.width, element.height);
          ctx.fillStyle = '#fef3c7';
          ctx.fillRect(element.x, element.y, element.width, element.height);
          ctx.fillStyle = element.color;
          ctx.font = '12px Inter';
          ctx.textAlign = 'left';
          ctx.fillText('⚠ Alert message', element.x + 10, element.y + element.height / 2);
        }
        break;

      case 'modal':
        if (element.x !== undefined && element.y !== undefined && element.width && element.height) {
          ctx.strokeRect(element.x, element.y, element.width, element.height);
          ctx.fillStyle = '#fff';
          ctx.fillRect(element.x, element.y, element.width, element.height);
          ctx.fillStyle = element.color;
          ctx.font = 'bold 14px Inter';
          ctx.textAlign = 'center';
          ctx.fillText('Modal Title', element.x + element.width / 2, element.y + 30);
          ctx.strokeRect(element.x + 20, element.y + element.height - 50, element.width - 40, 30);
        }
        break;

      case 'tooltip':
        if (element.x !== undefined && element.y !== undefined && element.width && element.height) {
          ctx.fillStyle = '#333';
          ctx.fillRect(element.x, element.y, element.width, element.height);
          ctx.fillStyle = '#fff';
          ctx.font = '10px Inter';
          ctx.textAlign = 'center';
          ctx.fillText('Tooltip', element.x + element.width / 2, element.y + element.height / 2);
        }
        break;

      case 'loading':
        if (element.x !== undefined && element.y !== undefined && element.width) {
          ctx.beginPath();
          ctx.arc(element.x + element.width/2, element.y + element.width/2, element.width/2, 0, Math.PI * 1.5);
          ctx.stroke();
        }
        break;

      // 表单组件
      case 'textarea':
        if (element.x !== undefined && element.y !== undefined && element.width && element.height) {
          ctx.strokeRect(element.x, element.y, element.width, element.height);
          ctx.fillStyle = '#999';
          ctx.font = '11px Inter';
          ctx.textAlign = 'left';
          ctx.fillText('Enter text...', element.x + 10, element.y + 20);
        }
        break;

      case 'datepicker':
        if (element.x !== undefined && element.y !== undefined && element.width && element.height) {
          ctx.strokeRect(element.x, element.y, element.width, element.height);
          ctx.fillStyle = '#999';
          ctx.font = '12px Inter';
          ctx.textAlign = 'left';
          ctx.fillText('📅 Select date', element.x + 10, element.y + element.height / 2);
        }
        break;

      case 'upload':
        if (element.x !== undefined && element.y !== undefined && element.width && element.height) {
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(element.x, element.y, element.width, element.height);
          ctx.setLineDash([]);
          ctx.fillStyle = element.color;
          ctx.font = '12px Inter';
          ctx.textAlign = 'center';
          ctx.fillText('⬆ Upload file', element.x + element.width / 2, element.y + element.height / 2);
        }
        break;

      case 'searchbar':
        if (element.x !== undefined && element.y !== undefined && element.width && element.height) {
          ctx.strokeRect(element.x, element.y, element.width, element.height);
          ctx.fillStyle = '#999';
          ctx.font = '12px Inter';
          ctx.textAlign = 'left';
          ctx.fillText('🔍 Search...', element.x + 10, element.y + element.height / 2);
        }
        break;

      // 特殊组件
      case 'profile':
        if (element.x !== undefined && element.y !== undefined && element.width && element.height) {
          ctx.strokeRect(element.x, element.y, element.width, element.height);
          // Avatar
          ctx.beginPath();
          ctx.arc(element.x + element.width / 2, element.y + 40, 30, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = element.color;
          ctx.font = 'bold 14px Inter';
          ctx.textAlign = 'center';
          ctx.fillText('John Doe', element.x + element.width / 2, element.y + 90);
          ctx.font = '11px Inter';
          ctx.fillText('@johndoe', element.x + element.width / 2, element.y + 105);
        }
        break;

      case 'comment':
        if (element.x !== undefined && element.y !== undefined && element.width && element.height) {
          ctx.strokeRect(element.x, element.y, element.width, element.height);
          ctx.beginPath();
          ctx.arc(element.x + 20, element.y + 20, 12, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = element.color;
          ctx.font = 'bold 11px Inter';
          ctx.textAlign = 'left';
          ctx.fillText('Username', element.x + 40, element.y + 18);
          ctx.font = '10px Inter';
          ctx.fillText('This is a comment text...', element.x + 40, element.y + 35);
        }
        break;

      case 'rating':
        if (element.x !== undefined && element.y !== undefined && element.width && element.height) {
          ctx.strokeRect(element.x, element.y, element.width, element.height);
          ctx.fillStyle = element.color;
          ctx.font = '16px Inter';
          ctx.textAlign = 'center';
          ctx.fillText('★★★★☆', element.x + element.width / 2, element.y + element.height / 2);
        }
        break;

      case 'pricing':
        if (element.x !== undefined && element.y !== undefined && element.width && element.height) {
          ctx.strokeRect(element.x, element.y, element.width, element.height);
          ctx.fillStyle = element.color;
          ctx.font = 'bold 14px Inter';
          ctx.textAlign = 'center';
          ctx.fillText('Pro Plan', element.x + element.width / 2, element.y + 30);
          ctx.font = 'bold 24px Inter';
          ctx.fillText('$29', element.x + element.width / 2, element.y + 65);
          ctx.font = '10px Inter';
          ctx.fillText('/month', element.x + element.width / 2, element.y + 80);
          ctx.strokeRect(element.x + 20, element.y + element.height - 50, element.width - 40, 30);
          ctx.font = '11px Inter';
          ctx.fillText('Subscribe', element.x + element.width / 2, element.y + element.height - 32);
        }
        break;
    }
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const findElementAtPosition = (pos: Point): DrawElement | null => {
    // Iterate in reverse to check top elements first
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i];
      
      // Handle pen type (check if click is near any point in the path)
      if (element.type === 'pen' && element.points) {
        const threshold = 10;
        for (const point of element.points) {
          const distance = Math.sqrt(Math.pow(pos.x - point.x, 2) + Math.pow(pos.y - point.y, 2));
          if (distance < threshold) {
            return element;
          }
        }
      }
      
      // Handle line type (check if click is near the line)
      if (element.type === 'line' && element.points && element.points.length === 2) {
        const [p1, p2] = element.points;
        const threshold = 10;
        const distance = pointToLineDistance(pos, p1, p2);
        if (distance < threshold) {
          return element;
        }
      }
      
      // Handle circle type
      if (element.type === 'circle' && element.x !== undefined && element.y !== undefined && element.width) {
        const radius = Math.abs(element.width / 2);
        const distance = Math.sqrt(Math.pow(pos.x - element.x, 2) + Math.pow(pos.y - element.y, 2));
        if (distance <= radius) {
          return element;
        }
      }
      
      // Handle text type - estimate bounding box based on text content
      if (element.type === 'text' && element.x !== undefined && element.y !== undefined && element.text) {
        const fontSize = Math.max(16, (element.strokeWidth || 2) * 8);
        const estimatedWidth = element.text.length * fontSize * 0.6; // Rough estimate
        const estimatedHeight = fontSize * 1.3;
        
        if (pos.x >= element.x && pos.x <= element.x + estimatedWidth &&
            pos.y >= element.y && pos.y <= element.y + estimatedHeight) {
          return element;
        }
      }
      
      // Handle rectangular elements (rectangles, buttons, inputs, etc.)
      if (element.x !== undefined && element.y !== undefined && 
          element.width !== undefined && element.height !== undefined) {
        if (pos.x >= element.x && pos.x <= element.x + element.width &&
            pos.y >= element.y && pos.y <= element.y + element.height) {
          return element;
        }
      }
    }
    return null;
  };

  const pointToLineDistance = (point: Point, lineStart: Point, lineEnd: Point): number => {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    const lengthSquared = dx * dx + dy * dy;
    
    if (lengthSquared === 0) {
      return Math.sqrt(Math.pow(point.x - lineStart.x, 2) + Math.pow(point.y - lineStart.y, 2));
    }
    
    let t = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / lengthSquared;
    t = Math.max(0, Math.min(1, t));
    
    const closestX = lineStart.x + t * dx;
    const closestY = lineStart.y + t * dy;
    
    return Math.sqrt(Math.pow(point.x - closestX, 2) + Math.pow(point.y - closestY, 2));
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool !== 'select') return;
    
    const pos = getMousePos(e);
    const clickedElement = findElementAtPosition(pos);
    
    if (clickedElement && clickedElement.type === 'text') {
      // Open edit mode for existing text
      setEditingTextId(clickedElement.id);
      setTextInput({ 
        x: clickedElement.x || 0, 
        y: clickedElement.y || 0, 
        show: true 
      });
      setTimeout(() => {
        if (textInputRef.current) {
          textInputRef.current.innerText = clickedElement.text || '';
          textInputRef.current.focus();
          // Select all text
          const range = document.createRange();
          range.selectNodeContents(textInputRef.current);
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      }, 0);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);

    // Handle text mode
    if (currentTool === 'text') {
      setEditingTextId(null);
      setTextInput({ x: pos.x, y: pos.y, show: true });
      setTimeout(() => {
        if (textInputRef.current) {
          textInputRef.current.innerText = '';
          textInputRef.current.focus();
        }
      }, 0);
      return;
    }

    // Handle select mode
    if (currentTool === 'select') {
      const clickedElement = findElementAtPosition(pos);
      if (clickedElement) {
        setSelectedElement(clickedElement.id);
        setIsDragging(true);
        
        // Calculate drag offset based on element type
        if (clickedElement.type === 'pen' && clickedElement.points && clickedElement.points.length > 0) {
          setDragOffset({
            x: pos.x - clickedElement.points[0].x,
            y: pos.y - clickedElement.points[0].y,
          });
        } else if (clickedElement.type === 'line' && clickedElement.points && clickedElement.points.length === 2) {
          setDragOffset({
            x: pos.x - clickedElement.points[0].x,
            y: pos.y - clickedElement.points[0].y,
          });
        } else {
          setDragOffset({
            x: pos.x - (clickedElement.x || 0),
            y: pos.y - (clickedElement.y || 0),
          });
        }
      } else {
        setSelectedElement(null);
      }
      return;
    }

    setIsDrawing(true);
    setStartPoint(pos);

    if (currentTool === 'pen') {
      setCurrentElement({
        id: Date.now().toString(),
        type: 'pen',
        points: [pos],
        color: currentColor,
        strokeWidth,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);

    // Handle dragging in select mode
    if (currentTool === 'select' && isDragging && selectedElementId) {
      const element = elements.find(el => el.id === selectedElementId);
      if (!element) return;
      
      const newX = pos.x - dragOffset.x;
      const newY = pos.y - dragOffset.y;
      
      // Handle pen type - move all points
      if (element.type === 'pen' && element.points) {
        const dx = newX - (element.points[0]?.x || 0);
        const dy = newY - (element.points[0]?.y || 0);
        const newPoints = element.points.map(p => ({
          x: p.x + dx,
          y: p.y + dy,
        }));
        updateElement(selectedElementId, { points: newPoints });
      }
      // Handle line type - move both points
      else if (element.type === 'line' && element.points && element.points.length === 2) {
        const dx = newX - (element.points[0]?.x || 0);
        const dy = newY - (element.points[0]?.y || 0);
        const newPoints = element.points.map(p => ({
          x: p.x + dx,
          y: p.y + dy,
        }));
        updateElement(selectedElementId, { points: newPoints });
      }
      // Handle other elements with x, y coordinates
      else {
        updateElement(selectedElementId, { x: newX, y: newY });
      }
      return;
    }

    if (!isDrawing || !startPoint) return;

    if (currentTool === 'pen' && currentElement) {
      setCurrentElement({
        ...currentElement,
        points: [...(currentElement.points || []), pos],
      });
    } else if (currentTool === 'rectangle') {
      setCurrentElement({
        id: Date.now().toString(),
        type: 'rectangle',
        x: Math.min(startPoint.x, pos.x),
        y: Math.min(startPoint.y, pos.y),
        width: Math.abs(pos.x - startPoint.x),
        height: Math.abs(pos.y - startPoint.y),
        color: currentColor,
        strokeWidth,
      });
    } else if (currentTool === 'circle') {
      const radius = Math.sqrt(
        Math.pow(pos.x - startPoint.x, 2) + Math.pow(pos.y - startPoint.y, 2)
      );
      setCurrentElement({
        id: Date.now().toString(),
        type: 'circle',
        x: startPoint.x,
        y: startPoint.y,
        width: radius * 2,
        color: currentColor,
        strokeWidth,
      });
    } else if (currentTool === 'line') {
      setCurrentElement({
        id: Date.now().toString(),
        type: 'line',
        points: [startPoint, pos],
        color: currentColor,
        strokeWidth,
      });
    }
  };

  const handleMouseUp = () => {
    if (currentElement) {
      addElement(currentElement);
      setCurrentElement(null);
    }
    setIsDrawing(false);
    setIsDragging(false);
    setStartPoint(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const componentType = e.dataTransfer.getData('componentType') as ComponentType;
    if (!componentType) return;

    const pos = getMousePos(e as any);
    const component = createComponent(componentType, pos.x, pos.y);
    addElement(component);
  };

  const createComponent = (type: ComponentType, x: number, y: number): DrawElement => {
    const baseProps = {
      id: Date.now().toString(),
      type,
      x,
      y,
      color: currentColor,
      strokeWidth: 2,
    };

    switch (type) {
      // 基础组件
      case 'button':
        return { ...baseProps, width: 120, height: 40, text: 'Button' };
      case 'input':
        return { ...baseProps, width: 200, height: 40, text: '' };
      case 'checkbox':
        return { ...baseProps, width: 20, height: 20 };
      case 'radio':
        return { ...baseProps, width: 20, height: 20 };
      case 'toggle':
        return { ...baseProps, width: 50, height: 24 };
      case 'dropdown':
        return { ...baseProps, width: 200, height: 40 };
      case 'slider':
        return { ...baseProps, width: 200, height: 20 };
      case 'badge':
        return { ...baseProps, width: 60, height: 24 };
      case 'avatar':
        return { ...baseProps, width: 50, height: 50 };
      case 'tag':
        return { ...baseProps, width: 80, height: 28 };
      
      // 导航组件
      case 'navbar':
        return { ...baseProps, width: 600, height: 60 };
      case 'sidebar':
        return { ...baseProps, width: 200, height: 400 };
      case 'tabbar':
        return { ...baseProps, width: 400, height: 50 };
      case 'breadcrumb':
        return { ...baseProps, width: 300, height: 30 };
      case 'footer':
        return { ...baseProps, width: 600, height: 80 };
      
      // 布局组件
      case 'card':
        return { ...baseProps, width: 300, height: 200 };
      case 'container':
        return { ...baseProps, width: 400, height: 300 };
      case 'grid':
        return { ...baseProps, width: 400, height: 250 };
      case 'divider':
        return { ...baseProps, width: 300, height: 2 };
      
      // 展示组件
      case 'image':
        return { ...baseProps, width: 200, height: 150 };
      case 'video':
        return { ...baseProps, width: 300, height: 200 };
      case 'progress':
        return { ...baseProps, width: 250, height: 20 };
      case 'chart':
        return { ...baseProps, width: 350, height: 250 };
      case 'table':
        return { ...baseProps, width: 400, height: 250 };
      case 'list':
        return { ...baseProps, width: 250, height: 200 };
      
      // 反馈组件
      case 'alert':
        return { ...baseProps, width: 350, height: 50 };
      case 'modal':
        return { ...baseProps, width: 400, height: 250 };
      case 'tooltip':
        return { ...baseProps, width: 100, height: 30 };
      case 'loading':
        return { ...baseProps, width: 40, height: 40 };
      
      // 表单组件
      case 'textarea':
        return { ...baseProps, width: 300, height: 120 };
      case 'datepicker':
        return { ...baseProps, width: 200, height: 40 };
      case 'upload':
        return { ...baseProps, width: 300, height: 150 };
      case 'searchbar':
        return { ...baseProps, width: 300, height: 40 };
      
      // 特殊组件
      case 'profile':
        return { ...baseProps, width: 300, height: 150 };
      case 'comment':
        return { ...baseProps, width: 350, height: 80 };
      case 'rating':
        return { ...baseProps, width: 150, height: 40 };
      case 'pricing':
        return { ...baseProps, width: 280, height: 350 };
      
      default:
        return baseProps;
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
  };

  const handleTextInputKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveTextInput();
    } else if (e.key === 'Escape') {
      cancelTextInput();
    }
  };

  const saveTextInput = () => {
    if (textInputRef.current) {
      const text = textInputRef.current.innerText.trim();
      if (text) {
        if (editingTextId) {
          // Update existing text element
          updateElement(editingTextId, { text });
        } else {
          // Create new text element
          addElement({
            id: Date.now().toString(),
            type: 'text',
            x: textInput.x,
            y: textInput.y,
            text,
            color: currentColor,
            strokeWidth,
          });
        }
      } else if (editingTextId) {
        // If text is empty and we were editing, delete the element
        deleteElement(editingTextId);
      }
    }
    setTextInput({ x: 0, y: 0, show: false });
    setEditingTextId(null);
  };

  const cancelTextInput = () => {
    setTextInput({ x: 0, y: 0, show: false });
    setEditingTextId(null);
  };

  const handleTextBlur = () => {
    // Save on blur
    saveTextInput();
  };

  return (
    <div className="flex-1 bg-background canvas-grid overflow-hidden relative">
      <canvas
        ref={canvasRef}
        className={`w-full h-full relative z-0 ${
          currentTool === 'select' 
            ? (isDragging ? 'cursor-grabbing' : 'cursor-default')
            : currentTool === 'text'
            ? 'cursor-text'
            : 'cursor-crosshair'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDoubleClick={handleDoubleClick}
      />
      {textInput.show && (
        <div
          ref={textInputRef}
          contentEditable
          suppressContentEditableWarning
          className="absolute border-2 border-primary bg-background px-4 py-2 outline-none rounded-md shadow-xl focus:ring-2 focus:ring-primary/50 min-w-[200px] max-w-[500px]"
          style={{
            left: `${textInput.x}px`,
            top: `${textInput.y}px`,
            fontSize: `${Math.max(16, strokeWidth * 8)}px`,
            color: currentColor,
            fontFamily: 'Inter',
            zIndex: 10000,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
          onKeyDown={handleTextInputKeyDown}
          onBlur={handleTextBlur}
          autoFocus
        >
        </div>
      )}
    </div>
  );
}
