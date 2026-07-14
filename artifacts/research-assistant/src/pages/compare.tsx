import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useComparePapers, useDetectResearchGaps } from '@workspace/api-client-react';
import { usePaperStore } from '@/lib/paper-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  BarChart2, 
  X, 
  Search, 
  Sparkles, 
  Target, 
  Lightbulb, 
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Layers,
  ThumbsUp,
  BrainCircuit
} from 'lucide-react';

export default function Compare() {
  const [, setLocation] = useLocation();
  const { selectedPapers, removePaper } = usePaperStore();
  const [topic, setTopic] = useState('');

  const compareMutation = useComparePapers();
  const gapsMutation = useDetectResearchGaps();

  const handleCompare = () => {
    if (selectedPapers.length < 2) return;
    compareMutation.mutate({ data: { papers: selectedPapers } });
  };

  const handleDetectGaps = () => {
    if (selectedPapers.length === 0) return;
    gapsMutation.mutate({ 
      data: { 
        papers: selectedPapers, 
        topic: topic || "General comparison topic" 
      } 
    });
  };

  if (selectedPapers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6 max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
          <BarChart2 size={40} />
        </div>
        <h1 className="text-3xl font-bold">Compare Research Papers</h1>
        <p className="text-lg text-muted-foreground">
          Select up to 5 papers to generate a detailed AI comparison of their methodologies, results, and limitations. Find research gaps across multiple studies.
        </p>
        
        <Card className="w-full mt-8 p-6 bg-card/50 border-dashed border-2 border-border">
          <div className="flex flex-col items-center space-y-4">
            <Search className="text-muted-foreground" size={32} />
            <h3 className="font-semibold">Search to add papers</h3>
            <Button onClick={() => setLocation('/')} size="lg">Go to Search</Button>
          </div>
        </Card>
      </div>
    );
  }

  const compareData = compareMutation.data;
  const gapsData = gapsMutation.data;

  return (
    <div className="flex flex-col flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full gap-8">
      
      {/* Header & Selected Papers */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <BarChart2 className="text-primary" /> Paper Comparison
            </h1>
            <p className="text-muted-foreground mt-1">Comparing {selectedPapers.length} selected papers</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button 
              onClick={handleCompare} 
              disabled={selectedPapers.length < 2 || compareMutation.isPending}
              className="gap-2 w-full md:w-auto shadow-md"
              size="lg"
            >
              {compareMutation.isPending ? (
                <span className="flex items-center gap-2"><Sparkles className="animate-pulse" size={18} /> Analyzing...</span>
              ) : (
                <span className="flex items-center gap-2"><Sparkles size={18} /> Compare with AI</span>
              )}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {selectedPapers.map(paper => (
            <div key={paper.id} className="flex items-center gap-2 bg-card border border-border/60 rounded-full pl-4 pr-2 py-1.5 shadow-sm max-w-sm">
              <span className="text-sm font-medium truncate">{paper.title}</span>
              <button 
                onClick={() => removePaper(paper.id)}
                className="p-1 hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors text-muted-foreground shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          {selectedPapers.length < 5 && (
            <Button variant="outline" size="sm" className="rounded-full rounded-l-none border-dashed" onClick={() => setLocation('/')}>
              + Add more
            </Button>
          )}
        </div>
      </div>

      {/* Comparison Results */}
      {compareMutation.isPending ? (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-4">
            <BrainCircuit size={48} className="text-primary animate-pulse" />
            <h3 className="text-xl font-semibold">Synthesizing Comparison</h3>
            <p className="text-muted-foreground max-w-md">ResearchLens is reading all selected papers, extracting methodologies, and comparing their results side-by-side.</p>
            <div className="w-full max-w-xl h-2 bg-muted rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-primary animate-in slide-in-from-left-full duration-1000 infinite alternate" />
            </div>
          </CardContent>
        </Card>
      ) : compareData ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Comparison Table */}
          <Card className="overflow-hidden border-border/50 shadow-md">
            <ScrollArea className="w-full pb-4">
              <div className="min-w-[1000px] p-6">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr>
                      <th className="py-3 px-4 bg-muted/30 font-semibold rounded-tl-lg border-b border-border/50 w-1/4">Feature</th>
                      {compareData.rows.map((row, i) => (
                        <th key={row.paperId} className={`py-3 px-4 bg-muted/30 font-semibold border-b border-border/50 w-[${75 / compareData.rows.length}%] ${i === compareData.rows.length - 1 ? 'rounded-tr-lg' : 'border-r border-border/20'}`}>
                          <div className="line-clamp-2" title={row.title}>{row.title}</div>
                          {row.year && <div className="text-xs text-muted-foreground mt-1 font-normal">{row.year}</div>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {[
                      { key: 'dataset', label: 'Dataset', icon: <Layers size={14} /> },
                      { key: 'algorithm', label: 'Core Algorithm', icon: <BrainCircuit size={14} /> },
                      { key: 'model', label: 'Model/Architecture', icon: <Target size={14} /> },
                      { key: 'accuracy', label: 'Performance/Accuracy', icon: <TrendingUp size={14} /> },
                      { key: 'novelContribution', label: 'Novel Contribution', icon: <Sparkles size={14} /> },
                      { key: 'advantages', label: 'Advantages', icon: <ThumbsUp size={14} className="text-success" /> },
                      { key: 'limitations', label: 'Limitations', icon: <AlertTriangle size={14} className="text-destructive" /> },
                    ].map(feature => (
                      <tr key={feature.key} className="hover:bg-muted/10 transition-colors">
                        <td className="py-4 px-4 font-medium text-muted-foreground align-top bg-card/30">
                          <div className="flex items-center gap-2">
                            {feature.icon}
                            {feature.label}
                          </div>
                        </td>
                        {compareData.rows.map((row, i) => (
                          <td key={`${row.paperId}-${feature.key}`} className={`py-4 px-4 align-top ${i < compareData.rows.length - 1 ? 'border-r border-border/20' : ''}`}>
                            <div className="text-foreground/90 whitespace-pre-wrap">
                              {row[feature.key as keyof typeof row] || <span className="text-muted-foreground/40 italic">Not specified</span>}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </Card>

          {/* AI Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="col-span-1 lg:col-span-3 border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-3 text-primary">
                  <Sparkles size={20} /> Synthesis & Recommendation
                </h3>
                <p className="text-foreground/90 leading-relaxed">{compareData.aiRecommendation}</p>
              </CardContent>
            </Card>

            {[
              { key: 'bestForBeginners', label: 'Best for Beginners', color: 'success' },
              { key: 'bestForImplementation', label: 'Best for Implementation', color: 'accent' },
              { key: 'bestForFutureResearch', label: 'Best for Future Research', color: 'warning' },
            ].map(rec => compareData[rec.key as keyof typeof compareData] && (
              <Card key={rec.key} className={`border-${rec.color}/30 bg-card`}>
                <CardHeader className={`pb-2 text-${rec.color}`}>
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider">{rec.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium">{String(compareData[rec.key as keyof typeof compareData] || '')}</p>
                </CardContent>
              </Card>
            ))}
          </div>

        </div>
      ) : null}

      {/* Research Gaps Section */}
      <div className="mt-12 pt-8 border-t border-border/40">
        <div className="max-w-3xl space-y-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3 mb-2">
              <Target className="text-destructive" /> Detect Research Gaps
            </h2>
            <p className="text-muted-foreground">Identify unresolved problems and future directions across these papers.</p>
          </div>
          
          <div className="flex gap-3">
            <Input 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Optional topic focus (e.g., 'efficiency in edge devices')"
              className="flex-1 bg-card"
            />
            <Button onClick={handleDetectGaps} disabled={gapsMutation.isPending || selectedPapers.length === 0} variant="secondary">
              {gapsMutation.isPending ? <Loader2Icon /> : 'Detect Gaps'}
            </Button>
          </div>
        </div>

        {gapsData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 animate-in fade-in duration-500">
            <Card className="border-destructive/30 border-l-4 border-l-destructive">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="text-destructive" size={20} /> Critical Limitations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {gapsData.commonLimitations.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-destructive shrink-0 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-warning/50 border-l-4 border-l-warning bg-warning/5">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="text-warning" size={20} /> Identified Research Gaps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {gapsData.researchGaps.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <ArrowRight className="text-warning shrink-0 mt-0.5" size={16} />
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-success/40 border-l-4 border-l-success">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lightbulb className="text-success" size={20} /> Novel Ideas & Future Work
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Future Directions</h4>
                    <ul className="space-y-2">
                      {gapsData.futureWork.slice(0, 3).map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-success shrink-0 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Novel Combinations</h4>
                    <ul className="space-y-2">
                      {gapsData.novelIdeas.slice(0, 3).map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Sparkles className="text-success shrink-0 mt-0.5" size={14} />
                          <span className="italic">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Layers className="text-primary" size={20} /> Common Foundations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Shared Techniques</h4>
                    <div className="flex flex-wrap gap-2">
                      {gapsData.commonTechniques.map((item, i) => (
                        <Badge key={i} variant="secondary">{item}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Frequent Datasets</h4>
                    <div className="flex flex-wrap gap-2">
                      {gapsData.frequentDatasets.map((item, i) => (
                        <Badge key={i} variant="outline" className="border-primary/30 text-primary">{item}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        )}

      </div>
    </div>
  );
}

function Loader2Icon() {
  return <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
}