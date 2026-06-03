'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { api } from '@/lib/api';
import type { Message } from '@/lib/api';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
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

interface Conversation {
  id: string;
  participant_ids: string[];
  last_message?: string;
  last_message_at?: any;
  [key: string]: any;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  useEffect(() => {
    if (!user) return;

    async function fetchConversations() {
      try {
        setLoadingConversations(true);
        const data = await api.messages.getConversations();
        setConversations(data as Conversation[]);
        // Auto-select the first conversation if none selected
        if (data.length > 0 && !selectedConversation) {
          setSelectedConversation((data[0] as Conversation).id);
        }
      } catch (err) {
        console.error('Failed to fetch conversations:', err);
      } finally {
        setLoadingConversations(false);
      }
    }

    fetchConversations();
  }, [user]);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (!selectedConversation || !user) return;

    let unsubscribe: (() => void) | undefined;

    async function loadMessages() {
      try {
        setLoadingMessages(true);
        const data = await api.messages.getMessages(selectedConversation!);
        setMessages(data);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      } finally {
        setLoadingMessages(false);
      }
    }

    loadMessages();

    // Subscribe to real-time updates
    try {
      unsubscribe = api.messages.onMessagesSnapshot(selectedConversation, (newMessages) => {
        setMessages(newMessages);
      });
    } catch (err) {
      console.error('Failed to subscribe to messages:', err);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [selectedConversation, user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConversation || sending) return;

    try {
      setSending(true);
      await api.messages.sendMessage(selectedConversation, messageInput.trim());
      setMessageInput('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const name = conv.display_name || conv.name || conv.id || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const currentConversation = conversations.find((c) => c.id === selectedConversation);

  const getConversationName = (conv: Conversation) => {
    return conv.display_name || conv.name || conv.title || 'Conversation';
  };

  const getConversationAvatar = (conv: Conversation) => {
    const name = getConversationName(conv);
    return name
      .split(' ')
      .map((w: string) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const formatMessageTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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
                {loadingConversations && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <LoadingSpinner size="sm" />
                    <p className="text-gray-500 text-sm mt-2">Loading conversations...</p>
                  </div>
                )}

                {!loadingConversations && filteredConversations.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 px-4">
                    <MessageSquare size={32} className="text-gray-600 mb-2" />
                    <p className="text-gray-500 text-sm text-center">No messages yet</p>
                  </div>
                )}

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
                          {getConversationAvatar(conv)}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold">{getConversationName(conv)}</p>
                        </div>

                        <p className="text-sm text-gray-400 truncate">{conv.last_message || 'No messages'}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {conv.last_message_at ? formatTime(conv.last_message_at) : ''}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Window */}
            {currentConversation ? (
              <div className="hidden md:flex flex-1 flex-col border border-primary-700/20 rounded-2xl bg-dark-900/50 backdrop-blur-md overflow-hidden">
                {/* Chat Header */}
                <div className="flex items-center justify-between border-b border-primary-700/20 p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center font-bold">
                      {getConversationAvatar(currentConversation)}
                    </div>
                    <div>
                      <p className="font-semibold">{getConversationName(currentConversation)}</p>
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
                  {loadingMessages && (
                    <div className="flex flex-col items-center justify-center py-12">
                      <LoadingSpinner size="md" />
                      <p className="text-gray-500 text-sm mt-2">Loading messages...</p>
                    </div>
                  )}

                  {!loadingMessages && messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12">
                      <MessageSquare size={32} className="text-gray-600 mb-2" />
                      <p className="text-gray-500 text-sm">No messages yet. Start the conversation!</p>
                    </div>
                  )}

                  {messages.map((msg) => {
                    const isYou = msg.sender_id === user?.uid;
                    return (
                      <div key={msg.id} className={`flex ${isYou ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            isYou
                              ? 'bg-primary-600 text-white'
                              : 'bg-dark-800 border border-primary-700/30 text-gray-300'
                          }`}
                        >
                          {!isYou && msg.sender_name && (
                            <p className="text-xs font-semibold text-primary-400 mb-1">{msg.sender_name}</p>
                          )}
                          <p>{msg.text}</p>
                          <p className="text-xs mt-1 opacity-70">{formatMessageTime(msg.created_at)}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="border-t border-primary-700/20 p-4">
                  <div className="flex items-end gap-2">
                    <Button variant="ghost" size="sm" icon={<Paperclip size={18} />} type="button" />
                    <input
                      type="text"
                      placeholder="Type your message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      className="flex-1 rounded-lg border border-primary-700/30 bg-dark-800/50 px-4 py-2.5 text-white placeholder-gray-500 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    <Button variant="ghost" size="sm" icon={<Smile size={18} />} type="button" />
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      icon={<Send size={18} />}
                      disabled={!messageInput.trim() || sending}
                    />
                  </div>
                </form>
              </div>
            ) : (
              <div className="hidden md:flex flex-1 flex-col items-center justify-center border border-primary-700/20 rounded-2xl bg-dark-900/50 backdrop-blur-md">
                <MessageSquare size={48} className="text-gray-600 mb-4" />
                <p className="text-gray-400">Select a conversation to start messaging</p>
              </div>
            )}

            {/* Mobile Chat View */}
            {currentConversation && selectedConversation && (
              <div className="md:hidden absolute inset-0 z-50 flex flex-col bg-gradient-dark">
                {/* Chat Header */}
                <div className="flex items-center justify-between border-b border-primary-700/20 p-4">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSelectedConversation(null)} className="text-gray-400 hover:text-white">
                      &larr; Back
                    </button>
                    <div>
                      <p className="font-semibold">{getConversationName(currentConversation)}</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {loadingMessages && (
                    <div className="flex justify-center py-12">
                      <LoadingSpinner size="md" />
                    </div>
                  )}

                  {!loadingMessages && messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12">
                      <MessageSquare size={32} className="text-gray-600 mb-2" />
                      <p className="text-gray-500 text-sm">No messages yet</p>
                    </div>
                  )}

                  {messages.map((msg) => {
                    const isYou = msg.sender_id === user?.uid;
                    return (
                      <div key={msg.id} className={`flex ${isYou ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            isYou
                              ? 'bg-primary-600 text-white'
                              : 'bg-dark-800 border border-primary-700/30 text-gray-300'
                          }`}
                        >
                          <p>{msg.text}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
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
                    <Button type="submit" variant="primary" size="sm" icon={<Send size={18} />} disabled={!messageInput.trim() || sending} />
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
