import React, { useState, useEffect } from 'react';
import { useLocation, useSearch } from 'wouter';
import { useSearchPapers, getSearchPapersQueryKey } from '@workspace/api-client-react';
import { PaperCard } from '@/components/paper-card';
import { usePaperStore } from '@/lib/paper-store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Search, SlidersHorizontal, ArrowLeft, Loader2, Library, BarChart2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Results() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const initialQuery = params.get('query') || '';
  
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState(initialQuery);
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [sortBy, setSortBy] = useState('relevance');
  const [sources, setSources] = useState<string[]>([]);
  const { selectedPapers, clearPapers } = usePaperStore();

  const { data, isLoading, isError, refetch } = useSearchPapers({ 
    query, 
    limit: 20,
    sources: sources.length > 0 ? sources.join(',') : undefined
  }, { 
    query: { 
      queryKey: getSearchPapersQueryKey({ query, limit: 20, sources: sources.length > 0 ? sources.join(',') : undefined }),
      enabled: !!query,
    } 
  });

  useEffect(() => {
    if (initialQuery !== query) {
      setQuery(initialQuery);
      setSearchInput(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setLocation(`/results?query=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const handleSourceToggle = (source: string) => {
    setSources(prev => 
      prev.includes(source) 
        ? prev.filter(s => s !== source)
        : [...prev, source]
    );
  };

  const toggleSort = (val: string) => {
    setSortBy(val);
  };

  let displayedPapers = data?.papers || [];
  if (sortBy === 'citationCount') {
    displayedPapers = [...displayedPapers].sort((a, b) => (b.citationCount || 0) - (a.citationCount || 0));
  } else if (sortBy === 'year') {
    displayedPapers = [...displayedPapers].sort((a, b) => (b.year || 0) - (a.year || 0));
  } else if (sortBy === 'qualityScore') {
    displayedPapers = [...displayedPapers].sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0));
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top Search Bar */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/40 p-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-4 items-center">
          <Button variant="ghost" size="icon" onClick={() => setLocation('/')} className="hidden sm:flex shrink-0">
            <ArrowLeft size={20} />
          </Button>
          <form onSubmit={handleSearch} className="relative flex-1 w-full max-w-3xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search papers, topics..." 
              className="pl-10 pr-20 bg-card border-border/50 focus-visible:ring-primary/30"
            />
            <Button size="sm" type="submit" className="absolute right-1 top-1 h-8 px-4" disabled={!searchInput.trim() || isLoading}>
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Search'}
            </Button>
          </form>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select value={sortBy} onValueChange={toggleSort}>
              <SelectTrigger className="w-full sm:w-[160px] bg-card">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="citationCount">Most Cited</SelectItem>
                <SelectItem value="year">Newest</SelectItem>
                <SelectItem value="qualityScore">Highest Quality</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex flex-1 max-w-7xl mx-auto w-full p-4 gap-6">
        {/* Sidebar Filters */}
        <div className="hidden lg:block w-64 shrink-0 space-y-6">
          <div className="sticky top-[100px]">
            <div className="flex items-center gap-2 font-semibold mb-4">
              <SlidersHorizontal size={18} />
              Filters
            </div>
            
            <Card className="p-4 bg-card/50 border-border/50">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-3 text-muted-foreground">Source</h4>
                  <div className="space-y-2.5">
                    {['semanticscholar', 'arxiv', 'openalex', 'crossref'].map(source => (
                      <div key={source} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`source-${source}`} 
                          checked={sources.includes(source)}
                          onCheckedChange={() => handleSourceToggle(source)}
                        />
                        <label 
                          htmlFor={`source-${source}`} 
                          className="text-sm leading-none font-medium capitalize cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {source === 'semanticscholar' ? 'Semantic Scholar' : source}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="bg-border/50" />

                <div>
                  <h4 className="text-sm font-medium mb-3 text-muted-foreground">Difficulty Level</h4>
                  <div className="space-y-2.5">
                    {['beginner', 'intermediate', 'advanced'].map(level => (
                      <div key={level} className="flex items-center space-x-2">
                        <Checkbox id={`level-${level}`} />
                        <label 
                          htmlFor={`level-${level}`} 
                          className="text-sm leading-none font-medium capitalize cursor-pointer"
                        >
                          {level}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="bg-border/50" />

                <div>
                  <h4 className="text-sm font-medium mb-3 text-muted-foreground">Attributes</h4>
                  <div className="space-y-2.5">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="attr-oa" />
                      <label htmlFor="attr-oa" className="text-sm font-medium cursor-pointer">Open Access</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="attr-code" />
                      <label htmlFor="attr-code" className="text-sm font-medium cursor-pointer">Has Code (GitHub)</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="attr-data" />
                      <label htmlFor="attr-data" className="text-sm font-medium cursor-pointer">Has Dataset</label>
                    </div>
                  </div>
                </div>

              </div>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 w-full min-w-0 pb-24">
          {!query ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 text-muted-foreground">
              <Library size={48} className="opacity-20" />
              <p className="text-lg">Enter a search query to find papers.</p>
            </div>
          ) : isLoading ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-6 w-48" />
              </div>
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i} className="p-5 border-border/40">
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex gap-2 pt-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                    <Skeleton className="h-16 w-full mt-4" />
                  </div>
                </Card>
              ))}
            </div>
          ) : isError ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="p-4 rounded-full bg-destructive/10 text-destructive mb-2">
                <Search size={32} />
              </div>
              <h3 className="text-xl font-semibold">Search Failed</h3>
              <p className="text-muted-foreground">We couldn't fetch results for "{query}".</p>
              <Button onClick={() => refetch()} variant="outline">Try Again</Button>
            </div>
          ) : displayedPapers.length === 0 ? (
            <div className="h-[50vh] flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="p-4 rounded-full bg-muted text-muted-foreground mb-2">
                <Search size={32} />
              </div>
              <h3 className="text-xl font-semibold">No results found</h3>
              <p className="text-muted-foreground max-w-md">We couldn't find any papers matching "{query}". Try different keywords or broader topics.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <p>Found <span className="font-medium text-foreground">{data?.total || 0}</span> results for "<span className="font-medium text-foreground">{query}</span>"</p>
              </div>
              
              <div className="space-y-4">
                {displayedPapers.map((paper) => (
                  <PaperCard key={paper.id} paper={paper} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Compare Action Bar */}
      {selectedPapers.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <Card className="px-6 py-4 shadow-2xl border-primary/30 bg-card/95 backdrop-blur-md flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {selectedPapers.map((p, i) => (
                  <div key={p.id} className="w-8 h-8 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-xs font-bold text-primary z-10" style={{ zIndex: 10 - i }}>
                    {i + 1}
                  </div>
                ))}
              </div>
              <span className="font-medium">
                {selectedPapers.length} paper{selectedPapers.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => clearPapers()}>
                Clear
              </Button>
              <Button onClick={() => setLocation('/compare')} className="gap-2">
                <BarChart2 size={16} /> Compare
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}