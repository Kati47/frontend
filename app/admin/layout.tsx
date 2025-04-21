import type React from "react"
import AdminSidebar from "@/components/layout/admin-sidebar"
import AdminHeader from "@/components/layout/admin-header"
import { ChatBot } from "@/components/chatbot/chat-bot"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="flex-1 p-6">{children}</main>
        <ChatBot />
      </div>
    </div>
  )
}

