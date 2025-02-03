"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Send, MessageSquare, Image, FileText, BarChart3, Clock, Settings, LogOut, TrendingUp, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"
import { v4 as uuidv4 } from 'uuid'
import { createClient } from '@/utils/supabase/client'
import { Button } from "@/components/ui/button"
import { redirect } from 'next/navigation'
import { signOutAction } from "@/app/actions"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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
  timestamp: string
  messages: Message[]
}

interface DatabaseSession {
  session_id: string
  title: string
  timestamp: string
  content: string
  sender: string
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
  const [messages, setMessages] = useState<Message[]>([{
    id: uuidv4(),
    content: "Hello! I'm FinovaAI, your financial companion. How can I assist you today? Feel free to ask about investments, market analysis, or any other financial topics!",
    sender: 'assistant',
    timestamp: new Date().toISOString()
  }])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        console.error('Error getting user:', error)
        return
      }
      if (user) {
        setUserId(user.id)
      }
    }
    getCurrentUser()
  }, [])

  // Load chat sessions
  const loadChatSessions = async () => {
    if (!userId) return

    try {
      const { data: sessions, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
      
      if (error) {
        console.error('Error loading chat sessions:', error)
        return
      }

      if (!sessions) return

      // Group messages by session_id and use the first message's title
      const groupedSessions = sessions.reduce((acc: Record<string, ChatSession>, curr: DatabaseSession) => {
        if (!acc[curr.session_id]) {
          acc[curr.session_id] = {
            id: curr.session_id,
            title: curr.title,
            timestamp: curr.timestamp,
            created_at: curr.timestamp,
            messages: []
          }
        }
        acc[curr.session_id].messages.push({
          id: uuidv4(),
          content: curr.content,
          sender: curr.sender === 'Machine' ? 'assistant' : 'user',
          timestamp: curr.timestamp
        })
        return acc
      }, {})

      // Convert to array and sort by latest message
      const sessionArray = Object.values(groupedSessions) as ChatSession[]
      sessionArray.sort((a: ChatSession, b: ChatSession) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )

      setChatSessions(sessionArray)
    } catch (error) {
      console.error('Error loading chat sessions:', error)
    }
  }

  // Load chat sessions on mount
  useEffect(() => {
    loadChatSessions()
  }, [userId])

  // Load messages when session changes
  useEffect(() => {
    const loadMessages = async () => {
      if (!currentSessionId) {
        // Keep the default welcome message when no session is selected
        setMessages([{
          id: uuidv4(),
          content: "Hello! I'm FinovaAI, your financial companion. How can I assist you today? Feel free to ask about investments, market analysis, or any other financial topics!",
          sender: 'assistant',
          timestamp: new Date().toISOString()
        }])
        return
      }
      
      const { data: messages, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('session_id', currentSessionId)
        .order('timestamp', { ascending: true })

      if (error) {
        console.error('Error loading messages:', error)
        return
      }

      if (!messages) return

      // Convert messages to the correct format
      const formattedMessages = messages.map(msg => ({
        id: uuidv4(),
        content: msg.content,
        sender: msg.sender === 'assistant' ? 'assistant' : 'user',
        timestamp: msg.timestamp
      }))

      setMessages(formattedMessages)
    }

    loadMessages()
  }, [currentSessionId])

  const handleSelectSession = async (sessionId: string) => {
    setCurrentSessionId(sessionId)
  }

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const startNewChat = async () => {
    setCurrentSessionId(null)
    setMessages([{
      id: uuidv4(),
      content: "Hello! I'm FinovaAI, your financial companion. How can I assist you today? Feel free to ask about investments, market analysis, or any other financial topics!",
      sender: 'assistant',
      timestamp: new Date().toISOString()
    }])
  }

  const handleSendMessage = async (messageToSend?: string) => {
    const message = messageToSend || inputMessage;
    if (!message.trim() || isLoading || !userId) return
    
    setIsLoading(true)
    const messageId = uuidv4()
    const timestamp = new Date().toISOString()

    // Create a new session if none exists
    const sessionId = currentSessionId || uuidv4()
    if (!currentSessionId) {
      setCurrentSessionId(sessionId)
    }

    // Add user message to UI
    const userMessage: Message = {
      id: messageId,
      content: message,
      sender: 'user',
      timestamp: new Date().toISOString()
    }

    setMessages(prevMessages => [...prevMessages, userMessage])
    setInputMessage("")

    try {
      // Save user message to database first
      const { error: userSaveError } = await supabase
        .from('chat_sessions')
        .insert([{
          session_id: sessionId,
          content: message,
          sender: 'user',
          timestamp: timestamp,
          title: message.slice(0, 50),
          user_id: userId
        }])

      // Get AI response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          sessionId,
          userId
        })
      })

      const data = await response.json()
      
      // Add AI response to UI
      const aiMessage: Message = {
        id: uuidv4(),
        content: data.response,
        sender: 'assistant',
        timestamp: new Date().toISOString()
      }

      setMessages(prevMessages => [...prevMessages, aiMessage])

      // Save AI response to database
      const { error: aiSaveError } = await supabase
        .from('chat_sessions')
        .insert([{
          session_id: sessionId,
          content: data.response,
          sender: 'assistant',
          timestamp: new Date().toISOString(),
          title: message.slice(0, 50),
          user_id: userId
        }])

      // Reload chat sessions to update the list
      await loadChatSessions()
    } catch (error) {
      console.error('Chat error:', error)
      // Add a friendly error message to the chat
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: uuidv4(),
          content: "I apologize, but I'm having trouble responding right now. Please try again in a moment.",
          sender: 'assistant',
          timestamp: new Date().toISOString()
        }
      ])
    } finally {
      setIsLoading(false)
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (isLoading) return;
    
    handleSendMessage(suggestion);
  };

  // AI Typing Indicator component
  const TypingIndicator = () => (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className="flex items-center space-x-2 p-4"
    >
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
      </div>
      <span className="text-sm text-gray-400">FinovaAI is typing...</span>
    </motion.div>
  )

  // If we're server-side or not yet initialized, show a loading state
  if (!supabase) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-4 flex flex-col">
        <button
          onClick={startNewChat}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded flex items-center justify-center mb-4"
        >
          <MessageSquare className="h-5 w-5 mr-2" />
          New Chat
        </button>

        <div className="text-sm text-gray-400 mb-2">Recent Chats</div>
        <div className="flex-1 overflow-y-auto">
          {chatSessions.map((session) => (
            <button
              key={session.id}
              onClick={() => handleSelectSession(session.id)}
              className={`w-full text-left p-2 hover:bg-gray-800 rounded ${
                currentSessionId === session.id ? 'bg-gray-800' : ''
              }`}
            >
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span className="truncate">{session.title || 'New Chat'}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-auto">
          <form action={signOutAction}>
            <button
              type="submit"
              className="w-full flex items-center p-2 hover:bg-gray-800 rounded text-red-400"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sign Out
            </button>
          </form>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {messages.length === 0 ? (
          // Welcome screen with just the initial message
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-950">
            <h2 className="text-xl text-gray-300 mb-4">Welcome to FinovaAI</h2>
          </div>
        ) : (
          // Chat messages
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-950">
            <motion.div
              variants={staggerChildren}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  variants={fadeInUp}
                  className={cn(
                    "flex items-start space-x-2 p-4 rounded-lg",
                    message.sender === 'user' 
                      ? "bg-blue-600 text-white ml-auto max-w-[80%]" 
                      : "bg-gray-800 text-gray-100 max-w-[80%]"
                  )}
                >
                  <div className="flex-1 overflow-hidden prose prose-invert max-w-none">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({children}) => <p className="mb-2 text-gray-100">{children}</p>,
                        a: ({children, href}) => (
                          <a href={href} className="text-blue-400 hover:underline">
                            {children}
                          </a>
                        ),
                        ul: ({children}) => <ul className="list-disc list-inside mb-4">{children}</ul>,
                        ol: ({children}) => <ol className="list-decimal list-inside mb-4">{children}</ol>,
                        li: ({children}) => <li className="mb-1">{children}</li>,
                        h1: ({children}) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
                        h2: ({children}) => <h2 className="text-xl font-bold mb-3">{children}</h2>,
                        h3: ({children}) => <h3 className="text-lg font-bold mb-2">{children}</h3>,
                        pre: ({children}) => (
                          <pre className="bg-gray-800 p-4 rounded-lg overflow-x-auto mb-4">
                            {children}
                          </pre>
                        ),
                        code: ({children}) => (
                          <code className="bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono">
                            {children}
                          </code>
                        ),
                        blockquote: ({children}) => (
                          <blockquote className="border-l-4 border-gray-600 pl-4 italic my-4">
                            {children}
                          </blockquote>
                        ),
                        hr: () => <hr className="border-gray-600 my-8" />,
                        strong: ({children}) => <strong className="font-bold">{children}</strong>,
                        em: ({children}) => <em className="italic">{children}</em>,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-gray-800 p-4 bg-gray-900">
          {/* Suggestion Buttons */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            <button
              onClick={() => handleSuggestionClick("Write python code to return the fibonacci sequence.")}
              className={`flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-full text-sm text-gray-300 whitespace-nowrap transition-colors ${
                isLoading ? 'opacity-50 pointer-events-none' : ''
              }`}
              disabled={isLoading}
            >
              <TrendingUp className="w-4 h-4" />
              Write python code to return the fibonacci sequence.
            </button>
            <button
              onClick={() => handleSuggestionClick("How is the stock market today?")}
              className={`flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-full text-sm text-gray-300 whitespace-nowrap transition-colors ${
                isLoading ? 'opacity-50 pointer-events-none' : ''
              }`}
              disabled={isLoading}
            >
              <DollarSign className="w-4 h-4" />
              How is the stock market today?
            </button>
            <button
              onClick={() => handleSuggestionClick("Write python code to calculate the x-day moving average for a given stock")}
              className={`flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-full text-sm text-gray-300 whitespace-nowrap transition-colors ${
                isLoading ? 'opacity-50 pointer-events-none' : ''
              }`}
              disabled={isLoading}
            >
              <DollarSign className="w-4 h-4" />
              Write python code to calculate the x-day moving average for a given stock.
            </button>
            <button
              onClick={() => handleSuggestionClick("Should I invest in Meta?")}
              className={`flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-full text-sm text-gray-300 whitespace-nowrap transition-colors ${
                isLoading ? 'opacity-50 pointer-events-none' : ''
              }`}
              disabled={isLoading}
            >
              <TrendingUp className="w-4 h-4" />
              Should I invest in Meta?
            </button>
          </div>
          
          {/* Message Input Form */}
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage() }} className="flex items-center">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Message FinovaAI..."
              className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className={`rounded-lg p-2 ${
                isLoading || !inputMessage.trim()
                  ? 'bg-gray-700 text-gray-400'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isLoading ? (
                <Clock className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
