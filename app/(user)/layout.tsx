import type React from "react"
import UserHeader from "@/components/layout/user-header"
import UserFooter from "@/components/layout/user-footer"
import { ChatBot } from "@/components/chatbot/chat-bot"

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <UserHeader />
      <main className="flex-1">{children}</main>
      <UserFooter />
      <ChatBot />
    </div>
  )
}

