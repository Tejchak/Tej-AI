'use client'

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SendIcon, UserIcon, BotIcon, MenuIcon, XIcon, PlusIcon } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import LogoutButton from '@/components/LogoutButton';
import Link from 'next/link';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;

    const newMessage: Message = {
      id: uuidv4(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          sessionId: 'your-session-id', // Replace with actual session ID
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      const aiResponse: Message = {
        id: uuidv4(),
        content: data.message,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prevMessages => [...prevMessages, aiResponse]);
    } catch (error) {
      console.error('Error calling chat API:', error);
      setMessages(prevMessages => [...prevMessages, {
        id: uuidv4(),
        content: `Error: ${(error as Error).message}`,
        sender: 'ai',
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      <header className="p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Chat</h1>
        <LogoutButton />
      </header>

      <main className="flex-grow p-4">
        <div className="flex flex-col h-full">
          <div className="flex-grow overflow-y-auto">
            {messages.map(message => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-lg ${message.sender === 'user' ? 'bg-blue-600' : 'bg-gray-700'}`}>
                  <p>{message.content}</p>
                  <span className="text-xs">{message.timestamp.toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex items-center">
            <input
              type="text"
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-grow p-2 rounded"
            />
            <button onClick={handleSendMessage}>
              <SendIcon />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatPage; 