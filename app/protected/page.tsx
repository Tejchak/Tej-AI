"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Send, MessageSquare, Image, FileText, BarChart3, Clock, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { v4 as uuidv4 } from 'uuid'
import { createClient } from '@/utils/supabase/client'
import { Button } from "@/components/ui/button"
import { redirect } from 'next/navigation'
import { signOutAction } from "@/app/actions"

interface Message {
  id: string
  content: string
  sender: string
  timestamp: string
}

interface ChatSession {
  id: string
  title: string
  created_at: string
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const supabase = createClient()

  // Set isClient to true when component mounts
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return; // Don't run on server-side

    const initializeChat = async () => {
      try {
        // Check authentication first
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          redirect('/sign-in')
          return
        }

        // Create a new session
        const response = await fetch('/api/chat/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          console.error('Failed to create session:', await response.text())
          return
        }
        
        const data = await response.json()
        if (!data.sessionId) {
          console.error('No session ID returned')
          return
        }

        setCurrentSessionId(data.sessionId)
        
        // Load existing messages
        const { data: messages } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('session_id', data.sessionId)
          .order('timestamp', { ascending: true })

        if (messages) {
          // Format timestamps before setting state
          const formattedMessages = messages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp).toISOString()
          }))
          setMessages(formattedMessages)
        }
      } catch (error) {
        console.error('Failed to initialize chat:', error)
      }
    }

    initializeChat()
  }, [isClient]) // Only run when isClient changes

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || !currentSessionId || isLoading) return

    setIsLoading(true)
    const messageText = inputMessage.trim()
    setInputMessage("")

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: messageText,
          sessionId: currentSessionId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()
      
      // Add the new messages to the state with properly formatted timestamps
      const newMessages = [
        {
          id: uuidv4(),
          content: messageText,
          sender: 'user',
          timestamp: new Date().toISOString()
        },
        {
          id: uuidv4(),
          content: data.message,
          sender: 'assistant',
          timestamp: new Date().toISOString()
        }
      ]

      setMessages(prev => [...prev, ...newMessages])
    } catch (error) {
      console.error('Error sending message:', error)
      setInputMessage(messageText) // Restore the message if it failed
    } finally {
      setIsLoading(false)
    }
  }

  // If we're server-side or not yet initialized, show a loading state
  if (!isClient) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  }

  return (
    <div className="flex h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900 via-slate-900 to-black">
      {/* Sidebar */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="w-64 bg-slate-900/50 border-r border-blue-900/20 flex flex-col backdrop-blur-xl"
      >
        {/* New Chat Button */}
        <div className="p-4">
          <Button
            onClick={() => {}}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2 px-4 flex items-center justify-center gap-2 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            New Chat
          </Button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-2">
            <h2 className="text-blue-100 text-sm font-semibold mb-2">Recent Chats</h2>
            {chatSessions.map((chat) => (
              <button
                key={chat.id}
                onClick={() => selectSession(chat.id)}
                className={cn(
                  "w-full text-left p-2 rounded-lg hover:bg-blue-800/20 text-blue-100 text-sm mb-1 transition-colors",
                  currentSessionId === chat.id && "bg-blue-800/30"
                )}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="truncate">{chat.title}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Settings/Sign Out Section */}
        <div className="p-4 border-t border-blue-900/20 flex flex-col gap-2">
          <button 
            className="w-full text-blue-100 hover:bg-blue-800/20 rounded-lg py-2 px-4 flex items-center gap-2 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <form action={signOutAction}>
            <button
              type="submit"
              className="w-full text-red-300 hover:bg-red-500/10 rounded-lg py-2 px-4 flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </form>
        </div>
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Messages */}
        <motion.div 
          className="flex-1 overflow-y-auto p-4 scroll-smooth"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "mb-4 p-4 rounded-lg max-w-3xl",
                message.sender === "user"
                  ? "ml-auto bg-blue-600 text-white"
                  : "bg-slate-800/50 text-blue-100 backdrop-blur-sm"
              )}
            >
              {message.content}
              <span className="text-xs opacity-70">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-blue-100">
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="text-center p-4 bg-slate-800/50 rounded-lg backdrop-blur-sm">
                  <Image className="w-6 h-6 mx-auto mb-2" />
                  <p>Create and edit images</p>
                </div>
                <div className="text-center p-4 bg-slate-800/50 rounded-lg backdrop-blur-sm">
                  <FileText className="w-6 h-6 mx-auto mb-2" />
                  <p>Write and format text</p>
                </div>
                <div className="text-center p-4 bg-slate-800/50 rounded-lg backdrop-blur-sm">
                  <BarChart3 className="w-6 h-6 mx-auto mb-2" />
                  <p>Analyze data</p>
                </div>
                <div className="text-center p-4 bg-slate-800/50 rounded-lg backdrop-blur-sm">
                  <MessageSquare className="w-6 h-6 mx-auto mb-2" />
                  <p>Answer questions</p>
                </div>
              </div>
              <p className="text-xl font-semibold">How can I help you today?</p>
            </div>
          )}
        </motion.div>

        {/* Input Area */}
        <motion.div 
          className="p-4 border-t border-blue-900/20"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage(e as unknown as React.FormEvent)
                }
              }}
              placeholder="Message ChatGPT..."
              className="w-full bg-slate-800/50 text-blue-100 rounded-lg pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
              disabled={isLoading || !currentSessionId}
            />
            <Button
              type="submit"
              disabled={isLoading || !currentSessionId}
              onClick={(e) => {
                e.preventDefault()
                handleSendMessage(e as unknown as React.FormEvent)
              }}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-400 hover:text-blue-300",
                (isLoading || !currentSessionId) && "opacity-50 cursor-not-allowed"
              )}
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
