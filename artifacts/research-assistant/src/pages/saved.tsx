import React, { useMemo } from 'react';
import { useLocation } from 'wouter';
import { useGetBookmarks, useRemoveBookmark } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Bookmark, ExternalLink, Calendar, Users, Trash2, Search, FileText } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { getGetBookmarksQueryKey } from '@workspace/api-client-react';
import { format } from 'date-fns';

export default function Saved() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useGetBookmarks();
  
  const removeBookmark = useRemoveBookmark({
    mutation: {
      onSuccess: () => {
        toast({ title: 'Removed from bookmarks', duration: 2000 });
        queryClient.invalidateQueries({ queryKey: getGetBookmarksQueryKey() });
      }
    }
  });

  const handleRemove = (paperId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeBookmark.mutate({ paperId });
  };

  const bookmarks = data?.bookmarks || [];

  // Group by date saved
  const groupedBookmarks = useMemo(() => {
    const groups: Record<string, typeof bookmarks> = {};
    bookmarks.forEach(b => {
      const date = b.savedAt ? format(new Date(b.savedAt), 'MMMM d, yyyy') : 'Unknown Date';
      if (!groups[date]) groups[date] = [];
      groups[date].push(b);
    });
    return groups;
  }, [bookmarks]);

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-5xl mx-auto w-full space-y-8">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-5 border-border/40">
              <Skeleton className="h-6 w-3/4 mb-3" />
              <Skeleton className="h-4 w-1/2" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full gap-8">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Bookmark className="text-primary fill-primary/20" size={32} /> Saved Papers
          </h1>
          <p className="text-muted-foreground mt-2">
            Your personal library of bookmarked research papers.
          </p>
        </div>
        <Badge variant="secondary" className="text-sm px-3 py-1">
          {bookmarks.length} {bookmarks.length === 1 ? 'Paper' : 'Papers'}
        </Badge>
      </div>

      {isError ? (
        <div className="p-6 bg-destructive/10 border border-destructive/30 rounded-lg text-center text-destructive">
          Failed to load bookmarks. Please try again later.
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 bg-card/30 rounded-xl border border-dashed border-border/60">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center text-muted-foreground mb-2">
            <Bookmark size={40} className="opacity-50" />
          </div>
          <div className="space-y-2 max-w-sm">
            <h3 className="text-2xl font-semibold">Your library is empty</h3>
            <p className="text-muted-foreground">
              You haven't saved any papers yet. Search for topics and bookmark interesting papers to read later.
            </p>
          </div>
          <Button size="lg" onClick={() => setLocation('/')} className="gap-2 mt-4">
            <Search size={18} /> Start Searching
          </Button>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(groupedBookmarks).map(([date, items]) => (
            <div key={date} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-2">
                {date}
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                {items.map(bookmark => (
                  <Card key={bookmark.id} className="overflow-hidden border-border/50 hover:border-primary/40 transition-colors shadow-sm bg-card/60">
                    <CardHeader className="p-5 pb-3">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1 flex-1">
                          <h4 
                            className="font-semibold text-lg hover:text-primary cursor-pointer leading-tight"
                            onClick={() => setLocation(`/paper/${encodeURIComponent(bookmark.paperId)}`)}
                          >
                            {bookmark.title}
                          </h4>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground mt-2">
                            <span className="flex items-center gap-1">
                              <Users size={14} /> {bookmark.authors.slice(0, 3).join(', ')}{bookmark.authors.length > 3 ? ' et al.' : ''}
                            </span>
                            {bookmark.year && (
                              <span className="flex items-center gap-1">
                                <Calendar size={14} /> {bookmark.year}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className="capitalize text-xs bg-background">
                            {bookmark.source}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardFooter className="p-3 px-5 bg-muted/20 border-t border-border/40 flex justify-between items-center">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary hover:bg-primary/10 gap-1.5 -ml-2"
                        onClick={() => setLocation(`/paper/${encodeURIComponent(bookmark.paperId)}`)}
                      >
                        <FileText size={16} /> View Details
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {bookmark.url && (
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild title="External Link">
                            <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink size={16} className="text-muted-foreground" />
                            </a>
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10" 
                          onClick={(e) => handleRemove(bookmark.paperId, e)}
                          disabled={removeBookmark.isPending}
                          title="Remove bookmark"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}