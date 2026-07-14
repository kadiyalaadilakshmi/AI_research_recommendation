import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useChatWithAssistant, ChatMessage, Paper } from '@workspace/api-client-react';
import { usePaperStore } from '@/lib/paper-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Bot, 
  User, 
  Send, 
  Sparkles, 
  BookOpen, 
  Loader2, 
  Trash2, 
  PlusCircle,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Chat() {
  const [, setLocation] = useLocation();
  const { selectedPapers, removePaper } = usePaperStore();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    "Can you summarize the core findings of these papers?",
    "What are the common methodologies used?",
    "What research gaps remain unaddressed?"
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const chatMutation = useChatWithAssistant();

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, chatMutation.isPending]);

  const handleSend = (text: string = input) => {
    if (!text.trim()) return;
    
    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSuggestedQuestions([]);

    chatMutation.mutate({
      data: {
        message: text,
        history: messages,
        papers: selectedPapers.length > 0 ? selectedPapers : undefined
      }
    }, {
      onSuccess: (data) => {
        const aiMsg: ChatMessage = { role: 'assistant', content: data.response };
        setMessages(prev => [...prev, aiMsg]);
        if (data.suggestedQuestions && data.suggestedQuestions.length > 0) {
          setSuggestedQuestions(data.suggestedQuestions);
        }
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setSuggestedQuestions([
      "Can you summarize the core findings of these papers?",
      "What are the common methodologies used?",
      "What research gaps remain unaddressed?"
    ]);
  };

  // Simple Markdown renderer
  const renderMarkdown = (text: string) => {
    const segments = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`|\n\n|- .*)/g);
    
    return segments.map((seg, i) => {
      if (seg.startsWith('**') && seg.endsWith('**')) {
        return <strong key={i} className="font-bold text-foreground">{seg.slice(2, -2)}</strong>;
      }
      if (seg.startsWith('*') && seg.endsWith('*')) {
        return <em key={i}>{seg.slice(1, -1)}</em>;
      }
      if (seg.startsWith('`') && seg.endsWith('`')) {
        return <code key={i} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary">{seg.slice(1, -1)}</code>;
      }
      if (seg.startsWith('- ')) {
        return <li key={i} className="ml-4 list-disc">{seg.slice(2)}</li>;
      }
      if (seg === '\n\n') {
        return <React.Fragment key={i}><br /><br /></React.Fragment>;
      }
      return <span key={i}>{seg}</span>;
    });
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] w-full overflow-hidden">
      
      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 h-full min-w-0 bg-background relative">
        {/* Header */}
        <div className="h-16 border-b border-border/40 px-6 flex items-center justify-between shrink-0 bg-card/30 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-sm">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="font-semibold text-lg leading-none">Research AI Assistant</h2>
              <p className="text-xs text-muted-foreground mt-1">Context-aware scientific analysis</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={clearChat} className="text-muted-foreground hover:text-destructive" disabled={messages.length === 0}>
            <Trash2 size={16} className="mr-2" /> Clear
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4 md:p-6" viewportRef={scrollRef}>
          <div className="max-w-3xl mx-auto space-y-6 pb-6">
            
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 animate-in fade-in duration-700">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <Bot size={40} className="text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">How can I help with your research?</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Ask me to explain concepts, summarize selected papers, compare methodologies, or suggest future reading.
                  </p>
                </div>
                
                {selectedPapers.length > 0 && (
                  <Badge variant="secondary" className="px-4 py-1.5 text-sm bg-accent/10 text-accent border-accent/20">
                    <BookOpen size={14} className="mr-2" />
                    Currently analyzing {selectedPapers.length} paper{selectedPapers.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={cn("flex gap-4", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
                  msg.role === 'user' ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground shadow-md"
                )}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                
                <div className={cn(
                  "max-w-[85%] rounded-2xl px-5 py-3.5",
                  msg.role === 'user' 
                    ? "bg-muted text-foreground rounded-tr-sm" 
                    : "bg-card border border-border/50 shadow-sm rounded-tl-sm text-foreground/90 leading-relaxed"
                )}>
                  {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
                </div>
              </div>
            ))}

            {chatMutation.isPending && (
              <div className="flex gap-4 flex-row">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 bg-primary text-primary-foreground shadow-md">
                  <Bot size={16} />
                </div>
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm px-5 py-4 bg-card border border-border/50 shadow-sm flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-primary" />
                  <span className="text-muted-foreground text-sm font-medium">Analyzing...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 bg-background border-t border-border/40 shrink-0">
          <div className="max-w-3xl mx-auto space-y-3">
            
            {/* Suggested Questions */}
            {suggestedQuestions.length > 0 && messages.length === 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q)}
                    className="text-xs bg-muted/50 hover:bg-primary/10 hover:text-primary text-muted-foreground border border-border/50 px-3 py-1.5 rounded-full transition-colors truncate max-w-full"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div className="relative flex items-end gap-2 bg-card border border-border/50 rounded-xl p-2 shadow-sm focus-within:ring-1 focus-within:ring-primary/50 focus-within:border-primary/50 transition-all">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask about papers, concepts, or methodologies..."
                className="flex-1 max-h-32 min-h-[44px] bg-transparent border-none resize-none focus:outline-none p-2 text-base"
                rows={1}
                disabled={chatMutation.isPending}
              />
              <Button 
                onClick={() => handleSend()} 
                disabled={!input.trim() || chatMutation.isPending}
                size="icon"
                className="h-10 w-10 shrink-0 rounded-lg mb-1 mr-1"
              >
                <Send size={18} />
              </Button>
            </div>
            <div className="text-center text-[10px] text-muted-foreground">
              AI can make mistakes. Always verify claims against the original papers.
            </div>
          </div>
        </div>
      </div>

      {/* Context Sidebar (Desktop) */}
      <div className="hidden lg:flex flex-col w-80 border-l border-border/40 bg-card/30 shrink-0 h-full">
        <div className="p-4 border-b border-border/40 font-semibold flex items-center gap-2 text-sm bg-muted/10">
          <BookOpen size={16} className="text-primary" /> Active Context
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {selectedPapers.length === 0 ? (
              <div className="text-center p-6 bg-muted/30 rounded-lg border border-dashed border-border text-muted-foreground space-y-3">
                <BookOpen size={24} className="mx-auto opacity-50" />
                <p className="text-sm">No papers in context.</p>
                <p className="text-xs">The AI will answer from its general knowledge base.</p>
                <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => setLocation('/')}>
                  <Search size={14} className="mr-2" /> Search Papers
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Loaded Papers ({selectedPapers.length})
                </p>
                {selectedPapers.map(paper => (
                  <Card key={paper.id} className="p-3 bg-background border-border/50 shadow-sm relative overflow-hidden group">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/50" />
                    <h4 className="text-sm font-medium line-clamp-2 leading-tight pl-1 mb-1">{paper.title}</h4>
                    <div className="pl-1 flex items-center justify-between mt-2">
                      <span className="text-[10px] text-muted-foreground">{paper.year || 'Unknown year'}</span>
                      <Button variant="ghost" size="icon" className="h-5 w-5 hover:text-destructive hover:bg-destructive/10" onClick={() => removePaper(paper.id)}>
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </Card>
                ))}
                
                {selectedPapers.length < 5 && (
                  <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground border border-dashed border-border mt-2" onClick={() => setLocation('/results')}>
                    <PlusCircle size={14} className="mr-2" /> Add more papers
                  </Button>
                )}
              </div>
            )}
            
            <Separator className="bg-border/40" />
            
            <div className="bg-primary/5 rounded-lg p-3 text-xs text-primary/80 border border-primary/10 leading-relaxed">
              <strong>Tip:</strong> You can add up to 5 papers to the context to ask comparative questions or generate summaries across multiple studies.
            </div>
          </div>
        </ScrollArea>
      </div>

    </div>
  );
}