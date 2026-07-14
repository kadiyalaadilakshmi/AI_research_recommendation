import React from 'react';
import { useLocation } from 'wouter';
import { useGetTrendingPapers } from '@workspace/api-client-react';
import { PaperCard } from '@/components/paper-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, ArrowUpRight, BookOpen, Layers, Search, Sparkles } from 'lucide-react';

export default function Trending() {
  const [, setLocation] = useLocation();
  const { data, isLoading, isError, refetch } = useGetTrendingPapers();

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-96" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-2">
          <TrendingUp size={32} />
        </div>
        <h2 className="text-2xl font-bold">Failed to load trending data</h2>
        <p className="text-muted-foreground">We couldn't fetch the latest trending topics.</p>
        <Button onClick={() => refetch()} variant="outline">Try Again</Button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-col flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full gap-10">
      
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium mb-2 border border-success/20">
          <TrendingUp size={16} />
          <span>Real-time Insights</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          Trending Research
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Discover the fastest-growing topics, most cited recent papers, and active research areas across all major academic sources.
        </p>
      </div>

      {/* Topics Grid */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Sparkles className="text-primary" size={24} /> Hot Topics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.topics.map((topic, i) => (
            <Card 
              key={i} 
              className="border-border/50 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group bg-card/50"
              onClick={() => setLocation(`/results?query=${encodeURIComponent(topic.topic)}`)}
            >
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1" title={topic.topic}>
                    {topic.topic}
                  </h3>
                  {topic.growthRate && (
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20 shrink-0">
                      <ArrowUpRight size={14} className="mr-1" />
                      {topic.growthRate}%
                    </Badge>
                  )}
                </div>
                
                {topic.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {topic.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/40">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                    <BookOpen size={16} />
                    {topic.paperCount} recent papers
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <Search size={16} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Top Conferences / Venues */}
      {data.topConferences && data.topConferences.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Layers className="text-accent" size={20} /> Active Venues
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.topConferences.map((conf, i) => (
              <Badge key={i} variant="secondary" className="px-3 py-1.5 text-sm font-medium">
                {conf}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Recent Papers */}
      {data.recentPapers && data.recentPapers.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-border/40">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <BookOpen className="text-warning" size={24} /> 
              Breakthrough Papers
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {data.recentPapers.map(paper => (
              <PaperCard key={paper.id} paper={paper} compact />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}