import React from 'react';
import { Paper } from '@workspace/api-client-react';
import { usePaperStore } from '@/lib/paper-store';
import { useAddBookmark, useGetBookmarks, useRemoveBookmark } from '@workspace/api-client-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Link, useLocation } from 'wouter';
import { 
  FileText, 
  Plus, 
  Bookmark as BookmarkIcon, 
  BookmarkCheck, 
  Download, 
  Quote, 
  Star,
  ExternalLink,
  Check,
  CheckCircle2,
  Github,
  Database
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { getGetBookmarksQueryKey } from '@workspace/api-client-react';

interface PaperCardProps {
  paper: Paper;
  compact?: boolean;
}

export function PaperCard({ paper, compact = false }: PaperCardProps) {
  const { addPaper, removePaper, selectedPapers, setCurrentPaper } = usePaperStore();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bookmarksData } = useGetBookmarks();
  const isBookmarked = bookmarksData?.bookmarks?.some(b => b.paperId === paper.id) ?? false;

  const addBookmark = useAddBookmark({
    mutation: {
      onSuccess: () => {
        toast({ title: 'Paper saved to bookmarks', duration: 2000 });
        queryClient.invalidateQueries({ queryKey: getGetBookmarksQueryKey() });
      }
    }
  });

  const removeBookmark = useRemoveBookmark({
    mutation: {
      onSuccess: () => {
        toast({ title: 'Paper removed from bookmarks', duration: 2000 });
        queryClient.invalidateQueries({ queryKey: getGetBookmarksQueryKey() });
      }
    }
  });

  const isSelected = selectedPapers.some(p => p.id === paper.id);

  const toggleSelection = () => {
    if (isSelected) {
      removePaper(paper.id);
      toast({ title: 'Removed from comparison', duration: 2000 });
    } else {
      if (selectedPapers.length >= 5) {
        toast({ title: 'Maximum 5 papers allowed', variant: 'destructive', duration: 2000 });
        return;
      }
      addPaper(paper);
      toast({ title: 'Added to comparison', duration: 2000 });
    }
  };

  const toggleBookmark = () => {
    if (isBookmarked) {
      removeBookmark.mutate({ paperId: paper.id });
    } else {
      addBookmark.mutate({
        data: {
          paperId: paper.id,
          title: paper.title,
          authors: paper.authors,
          year: paper.year,
          url: paper.url,
          source: paper.source
        }
      });
    }
  };

  const navigateToDetail = () => {
    setCurrentPaper(paper);
    setLocation(`/paper/${encodeURIComponent(paper.id)}`);
  };

  const getDifficultyColor = (level?: string | null) => {
    if (!level) return 'bg-muted text-muted-foreground';
    const l = level.toLowerCase();
    if (l === 'beginner') return 'bg-success/20 text-success hover:bg-success/30 border-success/30';
    if (l === 'intermediate') return 'bg-warning/20 text-warning hover:bg-warning/30 border-warning/30';
    if (l === 'advanced') return 'bg-destructive/20 text-destructive hover:bg-destructive/30 border-destructive/30';
    return 'bg-muted text-muted-foreground';
  };

  const getSourceColorClass = (source: string) => {
    const s = source.toLowerCase();
    if (s.includes('semanticscholar')) return 'border-l-blue-500';
    if (s.includes('arxiv')) return 'border-l-red-500';
    if (s.includes('openalex')) return 'border-l-green-500';
    return 'border-l-primary';
  };

  return (
    <Card className={cn(
      "overflow-hidden card-hover-lift transition-all border-l-[3px]", 
      getSourceColorClass(paper.source),
      isSelected && "ring-2 ring-primary border-primary/50 shadow-md"
    )}>
      <CardHeader className={cn("pb-2", compact ? "p-4" : "p-5")}>
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <h3 
              className={cn("font-semibold leading-tight hover:text-primary cursor-pointer line-clamp-2", compact ? "text-base" : "text-lg")}
              onClick={navigateToDetail}
            >
              {paper.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {paper.authors.join(', ')} {paper.year ? `• ${paper.year}` : ''} {paper.journal ? `• ${paper.journal}` : ''}
            </p>
          </div>
          {paper.qualityScore && !compact && (
            <div className="flex items-center gap-1 shrink-0 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm font-medium">
              <Star size={14} className="fill-primary text-primary" />
              {paper.qualityScore.toFixed(1)}
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 pt-2">
          <Badge variant="outline" className="text-xs capitalize font-medium opacity-80">
            {paper.source}
          </Badge>
          {paper.difficultyLevel && (
            <Badge variant="outline" className={cn("text-xs font-medium border capitalize", getDifficultyColor(paper.difficultyLevel))}>
              {paper.difficultyLevel}
            </Badge>
          )}
          {paper.citationCount !== undefined && paper.citationCount !== null && (
            <Badge variant="secondary" className="text-xs bg-muted/50">
              <Quote size={12} className="mr-1" /> {paper.citationCount}
            </Badge>
          )}
          {paper.isOpenAccess && (
            <Badge variant="outline" className="text-xs border-success/50 text-success">
              Open Access
            </Badge>
          )}
          {paper.hasDataset && (
            <Badge variant="outline" className="text-xs border-accent/50 text-accent">
              <Database size={10} className="mr-1" /> Dataset
            </Badge>
          )}
          {paper.githubUrl && (
            <Badge variant="outline" className="text-xs border-muted-foreground/50 text-muted-foreground">
              <Github size={10} className="mr-1" /> Code
            </Badge>
          )}
        </div>
      </CardHeader>
      
      {!compact && paper.abstract && (
        <CardContent className="px-5 py-2">
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {paper.abstract}
          </p>
        </CardContent>
      )}
      
      <CardFooter className={cn("flex items-center justify-between border-t border-border/40 bg-muted/20", compact ? "p-3" : "p-4")}>
        <div className="flex gap-2">
          <Button size={compact ? "sm" : "default"} variant="default" className={cn(compact && "h-8 text-xs")} onClick={navigateToDetail}>
            <FileText size={compact ? 14 : 16} className="mr-2" />
            Explain
          </Button>
          <Button 
            size={compact ? "sm" : "default"} 
            variant={isSelected ? "secondary" : "outline"} 
            className={cn(compact && "h-8 text-xs")}
            onClick={toggleSelection}
          >
            {isSelected ? (
              <><CheckCircle2 size={compact ? 14 : 16} className="mr-2 text-primary" /> Added</>
            ) : (
              <><Plus size={compact ? 14 : 16} className="mr-2" /> Compare</>
            )}
          </Button>
        </div>
        
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" className={cn(compact && "h-8 w-8")} onClick={toggleBookmark} disabled={addBookmark.isPending || removeBookmark.isPending}>
            {isBookmarked ? (
              <BookmarkCheck size={compact ? 16 : 18} className="text-primary fill-primary/20" />
            ) : (
              <BookmarkIcon size={compact ? 16 : 18} className="text-muted-foreground" />
            )}
          </Button>
          
          {(paper.pdfUrl || paper.url || paper.doi) && (
            <Button size="icon" variant="ghost" className={cn(compact && "h-8 w-8")} asChild>
              <a href={paper.pdfUrl || paper.url || (paper.doi ? `https://doi.org/${paper.doi}` : '#')} target="_blank" rel="noopener noreferrer">
                {paper.pdfUrl ? <Download size={compact ? 16 : 18} /> : <ExternalLink size={compact ? 16 : 18} />}
              </a>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}