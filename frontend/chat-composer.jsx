// components/chat-composer.jsx
// Drop-in chat input for the Copilot tab. Pairs with copilot-message.jsx.
// Assumes: lucide-react, ui/button, sonner, @/lib/utils (cn). No other deps.
// Usage:
//   <ChatComposer
//     onSend={(text, attachments) => sendToAgent(text, attachments)}
//     isGenerating={streaming}
//     onStop={() => stopGeneration()}
//     models={[{id:"llama-3.2", name:"Llama 3.2 8B"}, ...]}
//     selectedModel="llama-3.2"
//     onModelChange={(id) => setModel(id)}
//   />

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  SendHorizonal,
  Square,
  Paperclip,
  X,
  FileText,
  Image as ImageIcon,
  ChevronDown,
  Check,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAX_ATTACHMENTS = 8;
const MAX_FILE_MB = 50;

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(file) {
  return file.type?.startsWith("image/") ? (
    <ImageIcon className="h-3.5 w-3.5" />
  ) : (
    <FileText className="h-3.5 w-3.5" />
  );
}

export default function ChatComposer({
  onSend,
  isGenerating = false,
  onStop,
  models,
  selectedModel,
  onModelChange,
  placeholder = "Message Copilot…",
  disabled = false,
  maxHeight = 160,
  accept = "*/*",
  className,
}) {
  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const modelRef = useRef(null);

  const hasModels = Array.isArray(models) && models.length > 0;
  const canSend = !disabled && !isGenerating && (value.trim().length > 0 || attachments.length > 0);

  /* ---- auto-resize textarea ---- */
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, maxHeight)}px`;
    ta.style.overflowY = ta.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [value, maxHeight]);

  /* ---- close model dropdown on outside click ---- */
  useEffect(() => {
    if (!modelOpen) return;
    const onDown = (e) => {
      if (modelRef.current && !modelRef.current.contains(e.target)) setModelOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [modelOpen]);

  const addFiles = (fileList) => {
    const incoming = Array.from(fileList || []);
    if (!incoming.length) return;
    const room = MAX_ATTACHMENTS - attachments.length;
    if (room <= 0) {
      toast.error(`Max ${MAX_ATTACHMENTS} attachments`);
      return;
    }
    const accepted = [];
    for (const f of incoming.slice(0, room)) {
      if (f.size > MAX_FILE_MB * 1024 * 1024) {
        toast.error(`${f.name} exceeds ${MAX_FILE_MB} MB`);
        continue;
      }
      accepted.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        file: f,
        name: f.name,
        size: f.size,
        type: f.type,
      });
    }
    setAttachments((prev) => [...prev, ...accepted]);
  };

  const removeAttachment = (id) =>
    setAttachments((prev) => prev.filter((a) => a.id !== id));

  const submit = () => {
    if (!canSend) return;
    onSend?.(value.trim(), attachments.map((a) => a.file));
    setValue("");
    setAttachments([]);
    textareaRef.current?.focus();
  };

  const onKeyDown = (e) => {
    // Enter sends; Shift+Enter newline. Ignore during IME composition.
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  const selectedModelObj = hasModels
    ? models.find((m) => m.id === selectedModel) ?? models[0]
    : null;

  return (
    <div className={cn("w-full", className)}>
      {/* Attachment chips */}
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {attachments.map((a) => (
            <span
              key={a.id}
              className="inline-flex items-center gap-1.5 rounded-full border bg-muted px-2.5 py-1 text-xs"
            >
              {fileIcon(a)}
              <span className="max-w-[160px] truncate">{a.name}</span>
              <span className="text-muted-foreground">{formatSize(a.size)}</span>
              <button
                type="button"
                onClick={() => removeAttachment(a.id)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10"
                aria-label={`Remove ${a.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div
        className={cn(
          "flex items-end gap-2 rounded-2xl border bg-background p-2 transition-shadow",
          dragging && "border-primary ring-2 ring-primary/30",
          "focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
      >
        {/* Attach button */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 rounded-full text-muted-foreground"
          disabled={disabled || isGenerating}
          onClick={() => fileInputRef.current?.click()}
          title="Attach files (or drop them here)"
        >
          <Paperclip className="h-[18px] w-[18px]" />
        </Button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={dragging ? "Drop files to attach…" : placeholder}
          rows={1}
          disabled={disabled}
          className="max-h-40 flex-1 resize-none bg-transparent py-2 text-sm leading-relaxed outline-none placeholder:text-muted-foreground disabled:opacity-50"
        />

        {/* Model selector (inline dropdown) */}
        {hasModels && (
          <div ref={modelRef} className="relative shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 gap-1 rounded-full text-xs text-muted-foreground"
              onClick={() => setModelOpen((o) => !o)}
              disabled={disabled || isGenerating}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="max-w-[110px] truncate">
                {selectedModelObj?.name ?? "Model"}
              </span>
              <ChevronDown
                className={cn("h-3.5 w-3.5 transition-transform", modelOpen && "rotate-180")}
              />
            </Button>
            {modelOpen && (
              <div className="absolute bottom-11 right-0 z-50 w-52 overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-lg">
                <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Select model
                </div>
                {models.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      onModelChange?.(m.id);
                      setModelOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                  >
                    <span className="flex-1 truncate">{m.name}</span>
                    {m.id === selectedModelObj?.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Send / Stop */}
        {isGenerating ? (
          <Button
            type="button"
            size="icon"
            className="h-9 w-9 shrink-0 rounded-full"
            onClick={onStop}
            title="Stop generating"
          >
            <Square className="h-4 w-4 fill-current" />
          </Button>
        ) : (
          <Button
            type="button"
            size="icon"
            className="h-9 w-9 shrink-0 rounded-full"
            disabled={!canSend}
            onClick={submit}
            title="Send (Enter)"
          >
            <SendHorizonal className="h-4 w-4" />
          </Button>
        )}
      </div>

      <p className="mt-1.5 px-1 text-center text-[11px] text-muted-foreground">
        <kbd className="rounded border bg-muted px-1">Enter</kbd> to send ·{" "}
        <kbd className="rounded border bg-muted px-1">Shift+Enter</kbd> for new line ·
        drag files to attach
      </p>
    </div>
  );
}
