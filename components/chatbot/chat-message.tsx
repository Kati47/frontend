import { cn } from "@/lib/utils"
import { Bot, User } from "lucide-react"

type ChatMessageProps = {
  content: string
  isUser: boolean
  timestamp?: Date
}

export function ChatMessage({ content, isUser, timestamp }: ChatMessageProps) {
  return (
    <div className={cn("flex items-start gap-2 w-full", isUser ? "flex-row-reverse" : "")}>
      <div className={cn(
        "flex items-center justify-center w-8 h-8 rounded-full shrink-0",
        isUser ? "bg-primary/10" : "bg-secondary/10"
      )}>
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>
      
      <div
        className={cn(
          "flex max-w-[80%] rounded-lg p-3",
          isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-card border border-border/30 text-card-foreground"
        )}
      >
        <div className="space-y-1">
          <p className="text-sm">{content}</p>
          {timestamp && (
            <p className="text-xs opacity-70">
              {new Intl.DateTimeFormat("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              }).format(timestamp)}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}