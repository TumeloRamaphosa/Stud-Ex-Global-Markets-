'use client';

import { useState } from 'react';
import { Sparkles, CheckCircle, Circle, Loader, RefreshCw } from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';

interface Suggestion {
  id: string;
  text: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  done: boolean;
}

interface AISuggestionsProps {
  niche: string;
  theme: string;
  onSuggestionSelect?: (suggestion: string) => void;
}

export default function AISuggestions({ niche, theme, onSuggestionSelect }: AISuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [todoItems, setTodoItems] = useState<Suggestion[]>([]);

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/claude/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `You are a marketing strategist. Based on the niche "${niche}" and the current theme/season "${theme}", generate 8 specific, actionable marketing suggestions. Format each as a JSON array of objects with fields: "text" (the suggestion), "priority" ("high", "medium", or "low"), "category" (one of: "Content", "Strategy", "Timing", "Platform", "Engagement", "Analytics"). Return ONLY the JSON array, no markdown.`,
            },
          ],
          context: `Niche: ${niche}, Theme: ${theme}`,
        }),
      });

      const data = await response.json();

      try {
        const jsonMatch = data.content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const withIds = parsed.map((s: any, idx: number) => ({
            ...s,
            id: `sug_${Date.now()}_${idx}`,
            done: false,
          }));
          setSuggestions(withIds);
        }
      } catch {
        // Fallback suggestions if JSON parse fails
        setSuggestions([
          { id: '1', text: `Create ${theme}-themed hook for ${niche}`, priority: 'high', category: 'Content', done: false },
          { id: '2', text: `Post at peak engagement times for ${theme} season`, priority: 'high', category: 'Timing', done: false },
          { id: '3', text: `Use ${theme} hashtags trending on TikTok`, priority: 'medium', category: 'Platform', done: false },
          { id: '4', text: `Create carousel comparing before/after with ${theme} twist`, priority: 'medium', category: 'Content', done: false },
          { id: '5', text: `Run A/B test on ${theme} vs evergreen hooks`, priority: 'low', category: 'Strategy', done: false },
          { id: '6', text: `Analyze competitor ${theme} campaigns`, priority: 'medium', category: 'Analytics', done: false },
        ]);
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      setSuggestions([
        { id: '1', text: `Create ${theme}-themed content for ${niche}`, priority: 'high', category: 'Content', done: false },
        { id: '2', text: `Schedule posts for peak ${theme} engagement`, priority: 'high', category: 'Timing', done: false },
        { id: '3', text: `Use trending ${theme} hashtags`, priority: 'medium', category: 'Platform', done: false },
        { id: '4', text: `Analyze ${theme} competitor campaigns`, priority: 'medium', category: 'Analytics', done: false },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const addToTodo = (suggestion: Suggestion) => {
    if (!todoItems.find((t) => t.id === suggestion.id)) {
      setTodoItems((prev) => [...prev, { ...suggestion, done: false }]);
    }
  };

  const toggleTodo = (id: string) => {
    setTodoItems((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const removeTodo = (id: string) => {
    setTodoItems((prev) => prev.filter((t) => t.id !== id));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Content: 'bg-blue-100 text-blue-700',
      Strategy: 'bg-purple-100 text-purple-700',
      Timing: 'bg-orange-100 text-orange-700',
      Platform: 'bg-cyan-100 text-cyan-700',
      Engagement: 'bg-pink-100 text-pink-700',
      Analytics: 'bg-emerald-100 text-emerald-700',
    };
    return colors[category] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* AI Suggestions */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="text-amber-500" size={20} />
            AI-Powered Suggestions
          </h3>
          <Button
            onClick={generateSuggestions}
            disabled={loading}
            className="text-sm bg-gradient-to-r from-amber-500 to-orange-500"
          >
            {loading ? <Loader size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            {loading ? 'Generating...' : 'Generate'}
          </Button>
        </div>

        {suggestions.length === 0 && !loading && (
          <div className="text-center py-8 text-slate-500">
            <Sparkles size={32} className="mx-auto mb-3 text-amber-400" />
            <p>Click "Generate" to get AI-powered suggestions</p>
            <p className="text-xs mt-1">Based on your niche and current theme</p>
          </div>
        )}

        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="p-3 rounded-lg border border-slate-200 hover:border-amber-300 hover:shadow-sm transition-all cursor-pointer group"
              onClick={() => {
                addToTodo(suggestion);
                onSuggestionSelect?.(suggestion.text);
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-slate-900 flex-1">{suggestion.text}</p>
                <button className="opacity-0 group-hover:opacity-100 text-xs text-amber-600 font-semibold whitespace-nowrap transition-opacity">
                  + Add
                </button>
              </div>
              <div className="flex gap-2 mt-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPriorityColor(suggestion.priority)}`}>
                  {suggestion.priority}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getCategoryColor(suggestion.category)}`}>
                  {suggestion.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* AI To-Do List */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <CheckCircle className="text-green-500" size={20} />
            AI Action Plan
          </h3>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
            {todoItems.filter((t) => t.done).length}/{todoItems.length} done
          </span>
        </div>

        {todoItems.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <CheckCircle size={32} className="mx-auto mb-3 text-green-400" />
            <p>Click suggestions to add them to your action plan</p>
            <p className="text-xs mt-1">Track your progress as you complete each task</p>
          </div>
        )}

        {/* Progress bar */}
        {todoItems.length > 0 && (
          <div className="mb-4">
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${(todoItems.filter((t) => t.done).length / todoItems.length) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {todoItems.map((item) => (
            <div
              key={item.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                item.done
                  ? 'bg-green-50 border-green-200 opacity-60'
                  : 'bg-white border-slate-200 hover:border-green-300'
              }`}
            >
              <button
                onClick={() => toggleTodo(item.id)}
                className="mt-0.5 flex-shrink-0"
              >
                {item.done ? (
                  <CheckCircle size={20} className="text-green-600" />
                ) : (
                  <Circle size={20} className="text-slate-400 hover:text-green-500" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm ${
                    item.done ? 'line-through text-slate-500' : 'text-slate-900'
                  }`}
                >
                  {item.text}
                </p>
                <div className="flex gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(item.priority)}`}>
                    {item.priority}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </span>
                </div>
              </div>

              <button
                onClick={() => removeTodo(item.id)}
                className="text-slate-400 hover:text-red-500 text-xs flex-shrink-0"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
