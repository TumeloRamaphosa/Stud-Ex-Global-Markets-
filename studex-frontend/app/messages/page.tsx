'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import {
  MessageSquare,
  Send,
  Search,
  Plus,
  Paperclip,
  Smile,
  Phone,
  Video,
  Info,
} from 'lucide-react';

const conversations = [
  {
    id: 1,
    name: 'Alice Johnson',
    role: 'Investor',
    avatar: 'AJ',
    lastMessage: 'That sounds great! When can we...',
    time: '2m ago',
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: 'Bob Smith',
    role: 'Entrepreneur',
    avatar: 'BS',
    lastMessage: 'Thanks for the feedback on the pitch',
    time: '15m ago',
    unread: 0,
    online: true,
  },
  {
    id: 3,
    name: 'Carol Davis',
    role: 'Investor',
    avatar: 'CD',
    lastMessage: 'Let me check with my partners',
    time: '1h ago',
    unread: 1,
    online: false,
  },
  {
    id: 4,
    name: 'Dave Wilson',
    role: 'Entrepreneur',
    avatar: 'DW',
    lastMessage: 'Perfect! Let\'s schedule a call',
    time: '3h ago',
    unread: 0,
    online: false,
  },
];

const messages = [
  {
    id: 1,
    sender: 'other',
    text: 'Hi! I reviewed your business proposal and I\'m very interested.',
    time: '10:30 AM',
  },
  {
    id: 2,
    sender: 'you',
    text: 'Great! I\'m excited to discuss the details with you.',
    time: '10:35 AM',
  },
  {
    id: 3,
    sender: 'other',
    text: 'That sounds great! When can we schedule a call?',
    time: '10:40 AM',
  },
  {
    id: 4,
    sender: 'you',
    text: 'I\'m free tomorrow at 2 PM or Thursday at 10 AM. What works best for you?',
    time: '10:42 AM',
  },
];

export default function MessagesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(conversations[0].id);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const currentConversation = conversations.find((c) => c.id === selectedConversation);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim()) {
      console.log('Send message:', messageInput);
      setMessageInput('');
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-dark text-white">
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <main className="flex-1 overflow-hidden flex flex-col">
          <div className="flex h-full gap-4 p-4 sm:p-6">
            {/* Conversations List */}
            <div className="w-full md:w-80 flex flex-col border border-primary-700/20 rounded-2xl bg-dark-900/50 backdrop-blur-md overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-primary-700/20">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <MessageSquare size={24} />
                    Messages
                  </h2>
                  <Button variant="ghost" size="sm" icon={<Plus size={18} />} />
                </div>

                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={<Search size={18} />}
                  containerClassName="mb-0"
                />
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={`w-full p-4 border-b border-primary-700/10 text-left transition-colors hover:bg-dark-800/50 ${
                      selectedConversation === conv.id ? 'bg-primary-900/20 border-l-2 border-l-primary-500' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <div className="h-12 w-12 rounded-full bg-primary-600 flex items-center justify-center font-bold">
                          {conv.avatar}
                        </div>
                        {conv.online && (
                          <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-dark-900"></div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold">{conv.name}</p>
                          {conv.unread > 0 && (
                            <span className="text-xs bg-primary-600 px-2 py-1 rounded-full">
                              {conv.unread}
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-400 truncate">{conv.lastMessage}</p>
                        <p className="text-xs text-gray-500 mt-1">{conv.time}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Window */}
            {currentConversation && (
              <div className="hidden md:flex flex-1 flex-col border border-primary-700/20 rounded-2xl bg-dark-900/50 backdrop-blur-md overflow-hidden">
                {/* Chat Header */}
                <div className="flex items-center justify-between border-b border-primary-700/20 p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center font-bold">
                      {currentConversation.avatar}
                    </div>
                    <div>
                      <p className="font-semibold">{currentConversation.name}</p>
                      <p className="text-xs text-gray-400">{currentConversation.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" icon={<Phone size={18} />} />
                    <Button variant="ghost" size="sm" icon={<Video size={18} />} />
                    <Button variant="ghost" size="sm" icon={<Info size={18} />} />
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'you' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.sender === 'you'
                            ? 'bg-primary-600 text-white'
                            : 'bg-dark-800 border border-primary-700/30 text-gray-300'
                        }`}
                      >
                        <p>{msg.text}</p>
                        <p className="text-xs mt-1 opacity-70">{msg.time}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="border-t border-primary-700/20 p-4">
                  <div className="flex items-end gap-2">
                    <Button variant="ghost" size="sm" icon={<Paperclip size={18} />} />
                    <input
                      type="text"
                      placeholder="Type your message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      className="flex-1 rounded-lg border border-primary-700/30 bg-dark-800/50 px-4 py-2.5 text-white placeholder-gray-500 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    <Button variant="ghost" size="sm" icon={<Smile size={18} />} />
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      icon={<Send size={18} />}
                      disabled={!messageInput.trim()}
                    />
                  </div>
                </form>
              </div>
            )}

            {/* Mobile Chat View */}
            {currentConversation && (
              <div className="md:hidden absolute inset-0 z-50 flex flex-col bg-gradient-dark">
                {/* Chat Header */}
                <div className="flex items-center justify-between border-b border-primary-700/20 p-4">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSelectedConversation(null)} className="text-gray-400 hover:text-white">
                      ← Back
                    </button>
                    <div>
                      <p className="font-semibold">{currentConversation.name}</p>
                      <p className="text-xs text-gray-400">{currentConversation.role}</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'you' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.sender === 'you'
                            ? 'bg-primary-600 text-white'
                            : 'bg-dark-800 border border-primary-700/30 text-gray-300'
                        }`}
                      >
                        <p>{msg.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="border-t border-primary-700/20 p-4">
                  <div className="flex items-end gap-2">
                    <input
                      type="text"
                      placeholder="Type message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      className="flex-1 rounded-lg border border-primary-700/30 bg-dark-800/50 px-4 py-2.5 text-white placeholder-gray-500"
                    />
                    <Button type="submit" variant="primary" size="sm" icon={<Send size={18} />} />
                  </div>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
