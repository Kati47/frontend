import { cn } from "@/lib/utils"

type ChatMessageProps = {
  content: string
  isUser: boolean
  timestamp?: Date
}

export function ChatMessage({ content, isUser, timestamp }: ChatMessageProps) {
  return (
    <div
      className={cn(
        "flex max-w-[80%] rounded-lg p-3",
        isUser ? "bg-primary text-primary-foreground ml-auto" : "bg-muted text-muted-foreground",
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
  )
}

