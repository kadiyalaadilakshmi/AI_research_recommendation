import React, { useState } from 'react';
import { useGenerateRoadmap } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Map as MapIcon, ArrowRight, BookOpen, Clock, Sparkles, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Roadmap() {
  const [topic, setTopic] = useState('');
  
  const roadmapMutation = useGenerateRoadmap();

  const handleGenerate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;
    
    roadmapMutation.mutate({ data: { topic: topic.trim() } });
  };

  const setAndGenerate = (t: string) => {
    setTopic(t);
    roadmapMutation.mutate({ data: { topic: t } });
  };

  const getLevelColor = (level: string) => {
    const l = level.toLowerCase();
    if (l.includes('foundation') || l.includes('prereq')) return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    if (l.includes('beginner') || l.includes('basic')) return 'bg-success/20 text-success border-success/30';
    if (l.includes('intermediate') || l.includes('core')) return 'bg-warning/20 text-warning border-warning/30';
    if (l.includes('advanced') || l.includes('deep')) return 'bg-destructive/20 text-destructive border-destructive/30';
    if (l.includes('tool') || l.includes('framework')) return 'bg-accent/20 text-accent border-accent/30';
    if (l.includes('project') || l.includes('apply')) return 'bg-primary/20 text-primary border-primary/30';
    if (l.includes('research') || l.includes('future')) return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    return 'bg-muted text-muted-foreground border-border';
  };

  const getLevelIconColor = (level: string) => {
    const l = level.toLowerCase();
    if (l.includes('foundation')) return 'text-slate-400';
    if (l.includes('beginner')) return 'text-success';
    if (l.includes('intermediate')) return 'text-warning';
    if (l.includes('advanced')) return 'text-destructive';
    if (l.includes('tool')) return 'text-accent';
    if (l.includes('project')) return 'text-primary';
    if (l.includes('research')) return 'text-purple-400';
    return 'text-muted-foreground';
  };

  return (
    <div className="flex flex-col flex-1 max-w-5xl mx-auto w-full p-4 md:p-8">
      
      {/* Header */}
      <div className="text-center space-y-4 mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-2 shadow-inner">
          <MapIcon size={32} />
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Research Roadmap</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Generate a structured, step-by-step learning path for any complex topic or research domain.
        </p>
      </div>

      {/* Input Section */}
      <Card className="border-primary/20 bg-card/60 backdrop-blur-sm shadow-lg mb-8">
        <CardContent className="p-6">
          <form onSubmit={handleGenerate} className="flex gap-3 flex-col sm:flex-row">
            <div className="relative flex-1">
              <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="E.g., Quantum Computing, Large Language Models, CRISPR..."
                className="pl-12 h-14 text-lg bg-background border-border/50"
              />
            </div>
            <Button type="submit" size="lg" className="h-14 px-8 text-base font-semibold shrink-0 gap-2" disabled={!topic.trim() || roadmapMutation.isPending}>
              {roadmapMutation.isPending ? <Sparkles size={20} className="animate-pulse" /> : <MapIcon size={20} />}
              Generate Path
            </Button>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground font-medium mr-2">Try:</span>
            {['Deep Learning', 'Generative Adversarial Networks', 'Reinforcement Learning', 'Bioinformatics'].map(t => (
              <button 
                key={t}
                type="button"
                onClick={() => setAndGenerate(t)}
                className="px-3 py-1.5 rounded-full bg-muted/50 hover:bg-primary/10 hover:text-primary transition-colors border border-border/50 text-muted-foreground"
              >
                {t}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {roadmapMutation.isPending && (
        <div className="flex flex-col items-center justify-center py-20 space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <MapIcon size={48} className="text-primary animate-bounce relative z-10" />
          </div>
          <h3 className="text-xl font-medium animate-pulse">Mapping out the territory for "{topic}"...</h3>
          <p className="text-muted-foreground text-center max-w-md">Structuring concepts from foundational basics to cutting-edge research.</p>
        </div>
      )}

      {/* Results */}
      {roadmapMutation.data && !roadmapMutation.isPending && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          <div className="flex items-center justify-between mb-8 px-4 py-3 bg-muted/30 rounded-lg border border-border/40">
            <div className="flex items-center gap-2 font-semibold text-lg">
              <span className="text-primary">Topic:</span> {roadmapMutation.data.topic}
            </div>
            {roadmapMutation.data.estimatedTime && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium bg-background px-3 py-1.5 rounded-md shadow-sm border border-border/50">
                <Clock size={16} />
                Estimated time: {roadmapMutation.data.estimatedTime}
              </div>
            )}
          </div>

          <div className="relative border-l-2 border-border/60 ml-4 md:ml-8 space-y-10 pb-12">
            {roadmapMutation.data.steps.map((step, index) => (
              <div key={index} className="relative pl-8 md:pl-12">
                {/* Node connector */}
                <div className="absolute -left-[17px] top-1.5 w-8 h-8 rounded-full bg-background border-4 border-card shadow-sm flex items-center justify-center">
                  <div className={cn("w-3 h-3 rounded-full", getLevelColor(step.level).split(' ')[0].replace('/20', ''))} />
                </div>

                <Card className="border-border/50 shadow-sm hover:border-primary/30 transition-colors group">
                  <CardContent className="p-5 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className={cn("text-xs font-bold uppercase tracking-wider", getLevelIconColor(step.level))}>
                            Step {step.order}
                          </span>
                          <Badge variant="outline" className={cn("uppercase text-[10px] font-bold border", getLevelColor(step.level))}>
                            {step.level}
                          </Badge>
                        </div>
                        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                          {step.title}
                        </h3>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {step.description}
                    </p>

                    <div className="space-y-3 bg-muted/20 p-4 rounded-lg border border-border/40">
                      <h4 className="text-xs font-semibold text-foreground/70 uppercase flex items-center gap-2">
                        <BookOpen size={14} /> Key Concepts & Papers to Read
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {step.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm bg-background border border-border/50 px-3 py-1.5 rounded-md shadow-sm">
                            <span className="text-primary shrink-0 opacity-50 text-xs">{(i + 1).toString().padStart(2, '0')}</span>
                            <span className="font-medium">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8 text-muted-foreground flex items-center justify-center gap-2 text-sm">
            <Sparkles size={16} /> Roadmap ends here. Time to start your research!
          </div>

        </div>
      )}

    </div>
  );
}