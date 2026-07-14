import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Search, Sparkles, Database, BarChart2, Github, Map as MapIcon, ArrowRight, BookOpen, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useGetTrendingPapers, useGetSearchHistory } from '@workspace/api-client-react';

export default function Home() {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState('');

  const { data: trendingData } = useGetTrendingPapers();
  const { data: historyData } = useGetSearchHistory();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setLocation(`/results?query=${encodeURIComponent(query.trim())}`);
    }
  };

  const executeSearch = (q: string) => {
    setQuery(q);
    setLocation(`/results?query=${encodeURIComponent(q)}`);
  };

  const quickActions = [
    { icon: BarChart2, label: 'Compare Papers', desc: 'Find differences and gaps', path: '/compare', color: 'text-primary' },
    { icon: MapIcon, label: 'Research Roadmap', desc: 'Step-by-step learning paths', path: '/roadmap', color: 'text-success' },
    { icon: Database, label: 'Find Datasets', desc: 'Discover data for your model', path: '/datasets', color: 'text-accent' },
    { icon: Sparkles, label: 'AI Chat', desc: 'Discuss papers with AI', path: '/chat', color: 'text-warning' },
  ];

  const suggestedTopics = [
    'Transformer attention mechanisms for NLP',
    'YOLO real-time object detection',
    'Quantum error correction codes',
    'CRISPR Cas9 off-target effects'
  ];

  return (
    <div className="flex flex-col items-center flex-1 w-full max-w-5xl mx-auto px-4 py-12 md:py-24">
      
      {/* Hero Section */}
      <div className="text-center space-y-6 w-full max-w-3xl mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2 border border-primary/20">
          <Sparkles size={16} />
          <span>ResearchLens Intelligence</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
          Your <span className="text-gradient">AI Research</span> Partner
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover, understand, and compare research papers with artificial intelligence. Generate roadmaps, find datasets, and identify research gaps in seconds.
        </p>
      </div>

      {/* Main Search */}
      <Card className="w-full max-w-3xl border border-border/50 shadow-xl bg-card/40 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
        <CardContent className="p-2">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <Search className="absolute left-4 text-muted-foreground" size={24} />
            <Input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search papers, topics, or paste an abstract..." 
              className="pl-12 pr-24 py-8 text-lg border-none bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button size="lg" type="submit" className="absolute right-2 h-12 px-6 rounded-md font-medium" disabled={!query.trim()}>
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Input Hints */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground animate-in fade-in duration-700 delay-200">
        <span className="font-medium mr-1">Try:</span>
        {suggestedTopics.slice(0, 3).map((topic, i) => (
          <button 
            key={i} 
            onClick={() => executeSearch(topic)}
            className="px-3 py-1.5 rounded-full bg-muted/50 hover:bg-primary/10 hover:text-primary transition-colors border border-border/50 hover:border-primary/20 truncate max-w-[200px] sm:max-w-none"
          >
            "{topic}"
          </button>
        ))}
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full mt-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
        {quickActions.map((action, i) => (
          <button 
            key={i}
            onClick={() => setLocation(action.path)}
            className="flex flex-col items-start p-6 rounded-xl border border-border/50 bg-card hover:bg-muted/30 transition-all text-left group hover:border-primary/30 hover:shadow-md"
          >
            <div className={`p-3 rounded-lg bg-background border border-border mb-4 group-hover:scale-110 transition-transform ${action.color}`}>
              <action.icon size={24} />
            </div>
            <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
              {action.label}
            </h3>
            <p className="text-sm text-muted-foreground">
              {action.desc}
            </p>
          </button>
        ))}
      </div>

      {/* History and Trending Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-16">
        
        {/* Search History */}
        {historyData && historyData.history.length > 0 && (
          <div className="space-y-4 animate-in fade-in duration-700 delay-500">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
              <Clock size={18} className="text-primary" />
              Recent Searches
            </h3>
            <div className="flex flex-wrap gap-2">
              {historyData.history.slice(0, 8).map((h) => (
                <button 
                  key={h.id}
                  onClick={() => executeSearch(h.query)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-card border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-colors text-sm text-muted-foreground hover:text-foreground"
                >
                  <Search size={14} className="opacity-50" />
                  {h.query}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Trending Topics */}
        {trendingData && trendingData.topics && trendingData.topics.length > 0 && (
          <div className="space-y-4 animate-in fade-in duration-700 delay-500">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                <TrendingUp size={18} className="text-success" />
                Trending Topics
              </h3>
              <Button variant="link" size="sm" onClick={() => setLocation('/trending')} className="text-muted-foreground p-0 h-auto">
                View all <ArrowRight size={14} className="ml-1" />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {trendingData.topics.slice(0, 4).map((topic, i) => (
                <button
                  key={i}
                  onClick={() => executeSearch(topic.topic)}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card hover:bg-primary/5 hover:border-primary/30 transition-all text-left"
                >
                  <span className="font-medium text-sm text-foreground truncate mr-2">{topic.topic}</span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 bg-background px-2 py-1 rounded">
                    <BookOpen size={12} />
                    {topic.paperCount}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}

// Inline this missing icon for Home
function TrendingUp(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}