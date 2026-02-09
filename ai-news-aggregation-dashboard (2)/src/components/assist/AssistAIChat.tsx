import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Trash2, Copy, Check, Languages, FileText, Lightbulb, BookOpen } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { cn } from '@/utils/cn';
import type { AssistPersonal } from '@/types';
import { generateAIResponse } from '@/lib/gemini';

const quickActions = [
  { id: 'summarize', label: 'Podsumuj artykuł', shortLabel: 'Podsumuj', icon: FileText, prompt: 'Podsumuj ten artykuł: ' },
  { id: 'translate', label: 'Przetłumacz', shortLabel: 'Tłumacz', icon: Languages, prompt: 'Przetłumacz na polski: ' },
  { id: 'explain', label: 'Wyjaśnij', shortLabel: 'Wyjaśnij', icon: Lightbulb, prompt: 'Wyjaśnij mi prostymi słowami: ' },
  { id: 'compare', label: 'Porównaj', shortLabel: 'Porównaj', icon: BookOpen, prompt: 'Porównaj te narzędzia AI: ' },
];

export function AssistAIChat() {
  const { assist, addAssistChatMessage, clearAssistChat } = useStore();

  // Safe access default
  const safeAssist = assist || {
    chatMessages: [],
    knowledgeItems: []
  };

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [safeAssist.chatMessages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMessage = input.trim();
    addAssistChatMessage({ role: 'user', content: userMessage });
    setInput('');
    setIsTyping(true);

    try {
      const response = await generateAIResponse(userMessage);
      addAssistChatMessage({ role: 'assistant', content: response });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Wystąpił nieznany błąd';
      addAssistChatMessage({ role: 'assistant', content: `❌ ${errorMessage}` });
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const recentItems = safeAssist.knowledgeItems ? safeAssist.knowledgeItems.slice(0, 3) : [];

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col sm:h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 sm:pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">AI Asystent</h1>
          <p className="text-xs text-slate-500 sm:text-sm">Podsumuj, tłumacz i analizuj treści</p>
        </div>
        <button onClick={clearAssistChat} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 sm:gap-2 sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm">
          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden xs:inline">Wyczyść chat</span>
          <span className="xs:hidden">Wyczyść</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-3 sm:py-4">
        {(!safeAssist.chatMessages || safeAssist.chatMessages.length === 0) ? (
          <div className="flex h-full flex-col items-center justify-center px-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-200 sm:h-16 sm:w-16 sm:rounded-2xl">
              <Sparkles className="h-6 w-6 text-white sm:h-8 sm:w-8" />
            </div>
            <h2 className="mt-3 text-lg font-bold text-slate-900 sm:mt-4 sm:text-xl">Jak mogę Ci pomóc?</h2>
            <p className="mt-1 max-w-md text-center text-xs text-slate-500 sm:mt-2 sm:text-sm">Zapytaj mnie o podsumowanie, tłumaczenie lub wyjaśnienie</p>

            <div className="mt-4 grid w-full max-w-md grid-cols-2 gap-2 sm:mt-6 sm:gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button key={action.id} onClick={() => handleQuickAction(action.prompt)} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2.5 text-left hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100 sm:gap-3 sm:rounded-xl sm:p-4">
                    <div className="rounded-lg bg-violet-100 p-1.5 text-violet-600 sm:p-2">
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <span className="text-xs font-medium text-slate-700 sm:text-sm">
                      <span className="hidden sm:inline">{action.label}</span>
                      <span className="sm:hidden">{action.shortLabel}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {recentItems.length > 0 && (
              <div className="mt-6 w-full max-w-md sm:mt-8">
                <p className="mb-2 text-xs font-medium text-slate-500 sm:mb-3 sm:text-sm">Ostatnie elementy:</p>
                <div className="space-y-2">
                  {recentItems.map((item: AssistPersonal.KnowledgeItem) => (
                    <button key={item.id} onClick={() => setInput(`Podsumuj: ${item.title}`)} className="flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-white p-2.5 text-left hover:border-violet-200 sm:gap-3 sm:rounded-xl sm:p-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-slate-900 sm:text-sm">{item.title}</p>
                      </div>
                      <Sparkles className="h-4 w-4 shrink-0 text-violet-500" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3 px-1 sm:space-y-4">
            {safeAssist.chatMessages.map((message: AssistPersonal.ChatMessage) => (
              <div key={message.id} className={cn('flex gap-2 sm:gap-3', message.role === 'user' ? 'justify-end' : 'justify-start')}>
                {message.role === 'assistant' && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 sm:h-8 sm:w-8">
                    <Sparkles className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4" />
                  </div>
                )}
                <div className={cn('group relative max-w-[85%] rounded-xl px-3 py-2 sm:max-w-[70%] sm:rounded-2xl sm:px-4 sm:py-3', message.role === 'user' ? 'bg-gradient-to-r from-violet-500 to-indigo-600 text-white' : 'bg-slate-100 text-slate-900')}>
                  <div className="whitespace-pre-wrap text-xs sm:text-sm">{message.content}</div>
                  {message.role === 'assistant' && (
                    <button onClick={() => handleCopy(message.id, message.content)} className="absolute -right-1 -top-1 rounded-lg bg-white p-1 text-slate-400 opacity-0 shadow-lg hover:text-slate-600 group-hover:opacity-100 sm:-right-2 sm:-top-2 sm:p-1.5">
                      {copiedId === message.id ? <Check className="h-3 w-3 text-emerald-500 sm:h-3.5 sm:w-3.5" /> : <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
                    </button>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-200 sm:h-8 sm:w-8">
                    <User className="h-3.5 w-3.5 text-slate-600 sm:h-4 sm:w-4" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2 sm:gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 sm:h-8 sm:w-8">
                  <Sparkles className="h-3.5 w-3.5 animate-pulse text-white sm:h-4 sm:w-4" />
                </div>
                <div className="flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-2 sm:rounded-2xl sm:px-4 sm:py-3">
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 sm:h-2 sm:w-2" style={{ animationDelay: '0ms' }} />
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 sm:h-2 sm:w-2" style={{ animationDelay: '150ms' }} />
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 sm:h-2 sm:w-2" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 pt-3 sm:pt-4">
        <div className="flex gap-2 sm:gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Zapytaj o podsumowanie, tłumaczenie..."
            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-100 sm:rounded-xl sm:px-4 sm:py-3"
          />
          <button onClick={handleSend} disabled={!input.trim() || isTyping} className="flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-indigo-600 px-3 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-200 hover:shadow-xl disabled:opacity-50 sm:gap-2 sm:rounded-xl sm:px-5 sm:py-3">
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Wyślij</span>
          </button>
        </div>
        <div className="mt-1.5 flex items-center justify-center gap-1.5 text-xs text-slate-400 sm:mt-2 sm:gap-2">
          <Sparkles className="h-3 w-3" />
          <span>AI może popełniać błędy. Weryfikuj ważne informacje.</span>
        </div>
      </div>
    </div>
  );
}
