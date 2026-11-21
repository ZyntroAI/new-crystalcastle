// components/copilot-message.jsx
// Drop-in chat message bubble for the Copilot tab.
// Peer deps:  npm i react-markdown remark-gfm   (lucide-react + ui/button + sonner assumed)
// Usage:
//   <CopilotMessage role="assistant" content="Hello **world**" streaming onRetry={...} />
//   <CopilotMessage role="user" content="..." onEdit={(v) => ...} />
//   <CopilotMessage role="assistant" content="..." toolCall={{ name:"run_python", args:{x:1}, status:"done", result:"42" }} />

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import {
  Bot,
  User,
  Copy,
  Check,
  RefreshCw,
  Pencil,
  Send,
  X,
  Terminal,
  ChevronDown,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Code block with copy button (used as markdown <code> renderer)     */
/* ------------------------------------------------------------------ */
function CodeBlock({ inline, className, children, ...props }) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const text = String(children ?? "").replace(/\n$/, "");
  const isBlock = !inline && (match || text.includes("\n"));

  if (!isBlock) {
    return (
      <code
        className={cn(
          "rounded bg-muted px-1.5 py-0.5 text-[0.85em] font-mono",
          className
        )}
        {...props}
      >
        {children}
      </code>
    );
  }

  const lang = match?.[1] ?? "text";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <div className="relative my-3 overflow-hidden rounded-lg border bg-zinc-950 text-zinc-100">
      <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-1.5">
        <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
          {lang}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-zinc-400 hover:text-zinc-100"
          onClick={copy}
        >
          {copied ? (
            <Check className="mr-1 h-3.5 w-3.5 text-green-400" />
          ) : (
            <Copy className="mr-1 h-3.5 w-3.5" />
          )}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre className="overflow-x-auto p-3 text-[13px] leading-relaxed">
        <code className="font-mono" {...props}>
          {children}
        </code>
      </pre>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tool-call card (agent function calls from agent_local.py)          */
/* ------------------------------------------------------------------ */
function ToolCallCard({ tool }) {
  const [open, setOpen] = useState(false);
  if (!tool) return null;
  const { name, args, status, result } = tool;
  const argsStr =
    typeof args === "string" ? args : JSON.stringify(args ?? {}, null, 2);

  return (
    <div className="my-2 overflow-hidden rounded-lg border bg-muted/40 text-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-muted/60"
      >
        <Terminal className="h-4 w-4 text-muted-foreground" />
        <span className="font-mono text-xs font-medium">{name}</span>
        {status === "running" && (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
        )}
        {status === "done" && <span className="h-2 w-2 rounded-full bg-green-500" />}
        {status === "error" && (
          <AlertCircle className="h-3.5 w-3.5 text-red-500" />
        )}
        <span className="ml-auto text-muted-foreground">
          {open ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </span>
      </button>
      {open && (
        <div className="space-y-2 border-t px-3 py-2">
          <div>
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Arguments
            </div>
            <pre className="overflow-x-auto rounded bg-background p-2 font-mono text-xs">
              {argsStr}
            </pre>
          </div>
          {result !== undefined && (
            <div>
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Result
              </div>
              <pre className="max-h-40 overflow-auto rounded bg-background p-2 font-mono text-xs">
                {typeof result === "string"
                  ? result
                  : JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main message component                                             */
/* ------------------------------------------------------------------ */
export default function CopilotMessage({
  role = "assistant",
  content = "",
  streaming = false,
  model,
  timestamp,
  avatar,
  onRetry,
  onEdit,
  toolCall,
  className,
}) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(content);

  const isUser = role === "user";
  const isSystem = role === "system";

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Message copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Copy failed");
    }
  };

  const saveEdit = () => {
    onEdit?.(draft);
    setEditing(false);
  };

  if (isSystem) {
    return (
      <div className="flex justify-center py-1">
        <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
          {content}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group flex w-full gap-3 py-4",
        isUser ? "flex-row-reverse" : "flex-row",
        className
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full border",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground"
        )}
      >
        {avatar ??
          (isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />)}
      </div>

      {/* Bubble + actions */}
      <div
        className={cn(
          "flex max-w-[80%] flex-col gap-1",
          isUser ? "items-end" : "items-start"
        )}
      >
        {/* Meta row */}
        <div
          className={cn(
            "flex items-center gap-2 px-1 text-xs text-muted-foreground",
            isUser ? "flex-row-reverse" : "flex-row"
          )}
        >
          <span className="font-medium">{isUser ? "You" : model ?? "Assistant"}</span>
          {timestamp && <span className="opacity-60">{timestamp}</span>}
        </div>

        {/* Content */}
        {editing ? (
          <div className="w-full min-w-[260px] space-y-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={Math.min(8, Math.max(2, draft.split("\n").length))}
              className="w-full rounded-lg border bg-background p-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditing(false);
                  setDraft(content);
                }}
              >
                <X className="mr-1 h-3.5 w-3.5" /> Cancel
              </Button>
              <Button size="sm" onClick={saveEdit}>
                <Send className="mr-1 h-3.5 w-3.5" /> Save
              </Button>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
              isUser
                ? "rounded-tr-sm bg-primary text-primary-foreground"
                : "rounded-tl-sm bg-muted text-foreground"
            )}
          >
            {toolCall && <ToolCallCard tool={toolCall} />}
            <div
              className={cn(
                "prose prose-sm max-w-none dark:prose-invert",
                "[&_ol]:list-decimal [&_ul]:list-disc [&_ol]:pl-5 [&_ul]:pl-5 [&_p]:my-1.5 [&_h1]:text-lg [&_h2]:text-base [&_h3]:text-sm [&_h1_h2_h3]:my-2 [&_h1_h2_h3]:font-semibold [&_a]:text-primary [&_a]:underline",
                isUser && "prose-invert [&_code]:bg-primary-foreground/20"
              )}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{ code: CodeBlock }}
              >
                {content}
              </ReactMarkdown>
              {streaming && !isUser && (
                <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-current align-middle" />
              )}
            </div>
          </div>
        )}

        {/* Hover actions */}
        {!editing && (
          <div
            className={cn(
              "flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100",
              isUser ? "flex-row-reverse" : "flex-row"
            )}
          >
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground"
              onClick={copyMessage}
            >
              {copied ? (
                <Check className="mr-1 h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="mr-1 h-3.5 w-3.5" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>

            {!isUser && onRetry && !streaming && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground"
                onClick={onRetry}
              >
                <RefreshCw className="mr-1 h-3.5 w-3.5" />
                Regenerate
              </Button>
            )}

            {isUser && onEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground"
                onClick={() => setEditing(true)}
              >
                <Pencil className="mr-1 h-3.5 w-3.5" />
                Edit
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
