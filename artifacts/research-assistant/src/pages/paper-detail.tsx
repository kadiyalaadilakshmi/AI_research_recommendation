import React, { useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useExplainPaper, useGenerateCitations, useGetRelatedPapers } from '@workspace/api-client-react';
import { usePaperStore } from '@/lib/paper-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { PaperCard } from '@/components/paper-card';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Download, 
  ExternalLink, 
  Quote, 
  Sparkles, 
  Star, 
  Users, 
  Calendar, 
  BookOpen, 
  Share2, 
  MessageSquare,
  CheckCircle2,
  Check
} from 'lucide-react';

export default function PaperDetail() {
  const [match, params] = useRoute('/paper/:id');
  const [, setLocation] = useLocation();
  const { currentPaper, selectedPapers, addPaper } = usePaperStore();
  const { toast } = useToast();

  const id = params?.id ? decodeURIComponent(params.id) : null;
  const paper = currentPaper;

  // We need the paper context. If accessed directly without store, we show an error.
  // In a real app, we'd fetch it by ID here.

  const explainMutation = useExplainPaper();
  const citationMutation = useGenerateCitations();
  const relatedMutation = useGetRelatedPapers();

  useEffect(() => {
    if (paper && !explainMutation.data && !explainMutation.isPending) {
      explainMutation.mutate({ data: { paper } });
      citationMutation.mutate({ data: { paper } });
      relatedMutation.mutate({ data: { paper, limit: 3 } });
    }
  }, [paper]);

  if (!paper) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold">Paper Not Found</h2>
        <p className="text-muted-foreground">The paper details could not be loaded. Please return to search and try again.</p>
        <Button onClick={() => setLocation('/')}>Return to Search</Button>
      </div>
    );
  }

  const isSelected = selectedPapers.some(p => p.id === paper.id);

  const handleCopyCitation = (text: string, format: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Citation Copied", description: `Copied ${format} format to clipboard.`, duration: 2000 });
  };

  const explainData = explainMutation.data;
  const citationData = citationMutation.data;
  const relatedData = relatedMutation.data?.papers || [];

  return (
    <div className="flex flex-col flex-1 pb-24">
      {/* Header / Nav */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/40 p-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="gap-2">
            <ArrowLeft size={16} /> Back
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => {
              if (isSelected) toast({ title: "Already in comparison" });
              else { addPaper(paper); toast({ title: "Added to comparison" }); }
            }}>
              {isSelected ? <CheckCircle2 size={16} className="text-primary" /> : <Star size={16} />}
              {isSelected ? 'Added' : 'Compare'}
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setLocation('/chat')}>
              <MessageSquare size={16} /> Chat
            </Button>
            {(paper.pdfUrl || paper.url || paper.doi) && (
              <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                <a href={paper.pdfUrl || paper.url || (paper.doi ? `https://doi.org/${paper.doi}` : '#')} target="_blank" rel="noopener noreferrer">
                  {paper.pdfUrl ? <Download size={16} /> : <ExternalLink size={16} />} 
                  {paper.pdfUrl ? 'PDF' : 'Source'}
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full p-4 md:p-6 lg:p-8 space-y-8">
        
        {/* Title & Meta Header */}
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-primary/50 text-primary uppercase text-xs tracking-wider font-semibold">
              {paper.source}
            </Badge>
            {paper.difficultyLevel && (
              <Badge variant="secondary" className="capitalize text-xs">
                {paper.difficultyLevel}
              </Badge>
            )}
            {paper.isOpenAccess && (
              <Badge variant="outline" className="border-success text-success text-xs">
                Open Access
              </Badge>
            )}
            {paper.qualityScore && (
              <Badge variant="secondary" className="bg-warning/10 text-warning hover:bg-warning/20 border-warning/20 text-xs">
                <Star size={12} className="mr-1 fill-warning" /> Quality: {paper.qualityScore.toFixed(1)}
              </Badge>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight">
            {paper.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-primary/70" />
              <span className="font-medium text-foreground/80">{paper.authors.join(', ')}</span>
            </div>
            {paper.year && (
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-primary/70" />
                <span>{paper.year}</span>
              </div>
            )}
            {paper.journal && (
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-primary/70" />
                <span>{paper.journal}</span>
              </div>
            )}
            {paper.citationCount !== undefined && paper.citationCount !== null && (
              <div className="flex items-center gap-2">
                <Quote size={16} className="text-primary/70" />
                <span>{paper.citationCount} Citations</span>
              </div>
            )}
          </div>
        </div>

        {/* Abstract */}
        {paper.abstract && (
          <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FileTextIcon /> Abstract
            </h3>
            <p className="text-muted-foreground leading-relaxed text-justify">
              {paper.abstract}
            </p>
          </div>
        )}

        <Separator className="bg-border/50" />

        {/* AI Explanation Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="text-primary" size={24} />
            AI Explanation
          </h2>
          
          {explainMutation.isPending ? (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3 text-primary mb-4">
                  <Sparkles size={20} className="animate-pulse" />
                  <span className="font-medium">ResearchLens AI is analyzing this paper...</span>
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
                <div className="pt-4 grid grid-cols-2 gap-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              </CardContent>
            </Card>
          ) : explainData ? (
            <div className="space-y-6">
              <Card className="border-primary/30 bg-primary/5 shadow-md">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-primary mb-2 text-lg">TL;DR Summary</h3>
                  <p className="text-foreground/90 leading-relaxed">{explainData.summary}</p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-border/50 bg-card/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-foreground/80 uppercase tracking-wider">Problem & Objective</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <span className="text-sm font-medium text-destructive mb-1 block">The Problem:</span>
                      <p className="text-sm text-muted-foreground">{explainData.problem}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-success mb-1 block">The Objective:</span>
                      <p className="text-sm text-muted-foreground">{explainData.objective}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-foreground/80 uppercase tracking-wider">Methodology</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{explainData.methodology}</p>
                    
                    <div className="space-y-3">
                      {explainData.algorithms && explainData.algorithms.length > 0 && (
                        <div>
                          <span className="text-xs font-semibold uppercase text-muted-foreground mb-1 block">Algorithms</span>
                          <div className="flex flex-wrap gap-1.5">
                            {explainData.algorithms.map((alg, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">{alg}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {explainData.metrics && explainData.metrics.length > 0 && (
                        <div>
                          <span className="text-xs font-semibold uppercase text-muted-foreground mb-1 block">Metrics</span>
                          <div className="flex flex-wrap gap-1.5">
                            {explainData.metrics.map((m, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{m}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-foreground/80 uppercase tracking-wider">Key Findings & Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{explainData.results}</p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-success">
                    <CheckCircle2 size={16} /> Advantages
                  </h4>
                  <ul className="space-y-2">
                    {explainData.advantages.map((adv, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-success mt-0.5">•</span> <span>{adv}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-destructive">
                    <InfoIcon size={16} /> Limitations
                  </h4>
                  <ul className="space-y-2">
                    {explainData.limitations.map((lim, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-destructive mt-0.5">•</span> <span>{lim}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {explainData.realWorldApplications && explainData.realWorldApplications.length > 0 && (
                <div className="pt-4 border-t border-border/40">
                  <h4 className="text-sm font-semibold mb-3">Real World Applications</h4>
                  <div className="flex flex-wrap gap-2">
                    {explainData.realWorldApplications.map((app, i) => (
                      <Badge key={i} variant="outline" className="bg-accent/5 border-accent/20 text-accent-foreground">
                        {app}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : explainMutation.isError ? (
            <div className="p-4 border border-destructive/30 bg-destructive/5 rounded-lg text-destructive text-sm">
              Failed to generate AI explanation. Please try again later.
            </div>
          ) : null}
        </div>

        <Separator className="bg-border/50" />

        {/* Citations */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Quote size={20} /> Cite this paper
          </h3>
          <Card className="border-border/50 bg-card/30">
            <CardContent className="p-0">
              {citationMutation.isPending ? (
                <div className="p-6 space-y-2">
                  <Skeleton className="h-8 w-full max-w-sm" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : citationData ? (
                <Tabs defaultValue="apa" className="w-full">
                  <div className="px-4 border-b border-border/40">
                    <TabsList className="bg-transparent h-12">
                      <TabsTrigger value="apa" className="data-[state=active]:bg-muted/50 data-[state=active]:shadow-none">APA</TabsTrigger>
                      <TabsTrigger value="ieee" className="data-[state=active]:bg-muted/50 data-[state=active]:shadow-none">IEEE</TabsTrigger>
                      <TabsTrigger value="mla" className="data-[state=active]:bg-muted/50 data-[state=active]:shadow-none">MLA</TabsTrigger>
                      <TabsTrigger value="chicago" className="data-[state=active]:bg-muted/50 data-[state=active]:shadow-none">Chicago</TabsTrigger>
                      <TabsTrigger value="bibtex" className="data-[state=active]:bg-muted/50 data-[state=active]:shadow-none">BibTeX</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  {Object.entries(citationData).map(([format, text]) => (
                    <TabsContent key={format} value={format} className="p-4 m-0">
                      <div className="relative group">
                        <pre className="p-4 rounded-md bg-muted/40 font-mono text-sm whitespace-pre-wrap break-all text-muted-foreground border border-border/50">
                          {text}
                        </pre>
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleCopyCitation(text as string, format.toUpperCase())}
                        >
                          Copy
                        </Button>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {/* Related Papers */}
        {relatedData.length > 0 && (
          <div className="space-y-4 pt-8">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <LibraryIcon /> Related Papers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedData.map(relatedPaper => (
                <PaperCard key={relatedPaper.id} paper={relatedPaper} compact />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function FileTextIcon(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>;
}

function InfoIcon(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>;
}

function LibraryIcon(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/></svg>;
}