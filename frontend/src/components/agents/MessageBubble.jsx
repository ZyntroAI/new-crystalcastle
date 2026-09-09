import React from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import ToolCallDisplay from "./ToolCallDisplay";

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[85%]", isUser ? "items-end" : "items-start")}>
        {message.content && (
          isUser ? (
            <div className="rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground">
              {message.content}
            </div>
          ) : (
            <div className="rounded-2xl rounded-bl-md border border-border bg-card px-4 py-2.5 text-sm leading-relaxed [&_p:first-child]:mt-0 [&_p:last-child]:mb-0">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )
        )}
        {message.tool_calls?.map((toolCall, idx) => (
          <ToolCallDisplay key={idx} toolCall={toolCall} />
        ))}
      </div>
    </div>
  );
}
