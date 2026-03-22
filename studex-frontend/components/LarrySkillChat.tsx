'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader } from 'lucide-react';
import Button from './ui/Button';
import Input from './ui/Input';
import Card from './ui/Card';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface LarrySkillChatProps {
  context?: string;
  onAdviceReceived?: (advice: string) => void;
}

export default function LarrySkillChat({ context, onAdviceReceived }: LarrySkillChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "Hey! I'm your Larry Skill Marketing AI assistant. I'll help you create viral content using the proven Upload-Post methodology. What would you like to focus on today? (Hook ideas, slide content, caption writing, or campaign strategy?)",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/claude/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.concat(userMessage).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: context,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to get response');

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      onAdviceReceived?.(data.content);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content:
            "Sorry, I encountered an error. Make sure ANTHROPIC_API_KEY is configured. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-full max-h-[600px] bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 bg-white rounded-t-lg">
        <h3 className="font-semibold text-slate-900">AI Marketing Advisor</h3>
        <p className="text-xs text-slate-500">Powered by Claude</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white text-slate-900 border border-slate-200 rounded-bl-none'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              <p
                className={`text-xs mt-1 ${
                  msg.role === 'user' ? 'text-blue-100' : 'text-slate-500'
                }`}
              >
                {msg.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-slate-900 border border-slate-200 px-4 py-2 rounded-lg rounded-bl-none flex items-center gap-2">
              <Loader size={16} className="animate-spin" />
              <span className="text-sm">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="px-4 py-3 border-t border-slate-200 bg-white rounded-b-lg"
      >
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Ask for hook ideas, captions, strategy..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 text-sm"
          />
          <Button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-3 py-2"
          >
            <Send size={18} />
          </Button>
        </div>
      </form>
    </Card>
  );
}
