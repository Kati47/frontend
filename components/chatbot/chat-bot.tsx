"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, X, MessageSquare, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type Message = {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hello! How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isOpen])

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")

    // Simulate bot response after a short delay
    setTimeout(() => {
      const botResponses = [
        "I'll look into that for you.",
        "Thanks for your message! Our team will get back to you soon.",
        "That's a great question. Let me find the answer for you.",
        "I understand. Is there anything else you'd like to know?",
        "We have several options available for that. Would you like more details?",
      ]

      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)]

      const botMessage: Message = {
        id: Date.now().toString(),
        content: randomResponse,
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
    }, 1000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <Card className="flex flex-col w-80 sm:w-96 h-96 shadow-lg border border-primary/20">
          <div className="flex items-center justify-between p-3 border-b bg-primary text-primary-foreground">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <h3 className="font-medium">Chat Support</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 rounded-full text-primary-foreground hover:text-primary-foreground/80 hover:bg-primary-foreground/10"
            >
              <X size={18} />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex max-w-[80%] rounded-lg p-3",
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground ml-auto"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button onClick={handleSendMessage} size="icon" disabled={!inputValue.trim()}>
              <Send size={18} />
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </Card>
      ) : (
        <Button onClick={() => setIsOpen(true)} size="icon" className="h-12 w-12 rounded-full shadow-lg">
          <MessageSquare size={24} />
          <span className="sr-only">Open chat</span>
        </Button>
      )}
    </div>
  )
}

