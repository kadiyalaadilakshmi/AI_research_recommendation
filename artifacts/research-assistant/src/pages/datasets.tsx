import React, { useState } from 'react';
import { useSearchDatasets, useSearchGithubRepos, getSearchDatasetsQueryKey, getSearchGithubReposQueryKey } from '@workspace/api-client-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Database, 
  Github, 
  Search, 
  Download, 
  ExternalLink, 
  Star, 
  HardDrive, 
  Calendar,
  Layers
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Datasets() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('datasets');
  const [searchTriggered, setSearchTriggered] = useState(false);

  const datasetsQuery = useSearchDatasets(
    { query, limit: 12 }, 
    { query: { queryKey: getSearchDatasetsQueryKey({ query, limit: 12 }), enabled: searchTriggered && activeTab === 'datasets' && query.length > 0 } }
  );

  const githubQuery = useSearchGithubRepos(
    { query, limit: 12 }, 
    { query: { queryKey: getSearchGithubReposQueryKey({ query, limit: 12 }), enabled: searchTriggered && activeTab === 'github' && query.length > 0 } }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchTriggered(true);
    }
  };

  return (
    <div className="flex flex-col flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full gap-8">
      
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3">
          <Database className="text-primary" size={36} /> Resource Discovery
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Find public datasets for training models and discover open-source GitHub repositories implementing research papers.
        </p>
      </div>

      {/* Search */}
      <Card className="border-border/50 bg-card/60 shadow-sm">
        <CardContent className="p-4 md:p-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input 
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSearchTriggered(false);
                }}
                placeholder="Search for image classification, sentiment analysis, PyTorch implementation..."
                className="pl-12 h-12 text-base bg-background"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 px-6" disabled={!query.trim()}>
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Tabs & Results */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8 bg-card border border-border/50 h-12 p-1">
          <TabsTrigger value="datasets" className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary h-full">
            <HardDrive size={18} /> Datasets
          </TabsTrigger>
          <TabsTrigger value="github" className="flex items-center gap-2 data-[state=active]:bg-muted h-full">
            <Github size={18} /> GitHub Repos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="datasets" className="m-0 space-y-6">
          {!searchTriggered ? (
            <EmptyState icon={<HardDrive size={48} />} title="Find Datasets" desc="Search for datasets across Kaggle, HuggingFace, and generic sources to train your models." />
          ) : datasetsQuery.isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => <DatasetSkeleton key={i} />)}
            </div>
          ) : datasetsQuery.isError ? (
            <ErrorState retry={() => datasetsQuery.refetch()} />
          ) : datasetsQuery.data?.datasets.length === 0 ? (
            <EmptyState icon={<Database size={48} />} title="No datasets found" desc={`No results for "${query}". Try adjusting your keywords.`} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {datasetsQuery.data?.datasets.map(dataset => (
                <Card key={dataset.id} className="flex flex-col h-full border-border/50 hover:border-primary/30 transition-all shadow-sm bg-card/40 hover:bg-card">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <CardTitle className="text-lg font-semibold line-clamp-2 leading-tight">
                        {dataset.name}
                      </CardTitle>
                      <Badge variant="outline" className="shrink-0 capitalize border-primary/20 text-primary bg-primary/5">
                        {dataset.source}
                      </Badge>
                    </div>
                    {dataset.size && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                        <HardDrive size={14} /> {dataset.size}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1 pb-4">
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {dataset.description}
                    </p>
                    <div className="space-y-3">
                      {dataset.tasks && dataset.tasks.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold uppercase text-foreground/60 mb-1.5">Tasks</p>
                          <div className="flex flex-wrap gap-1.5">
                            {dataset.tasks.map((task, i) => (
                              <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0 bg-muted/50">{task}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {dataset.format && dataset.format.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold uppercase text-foreground/60 mb-1.5">Formats</p>
                          <div className="flex flex-wrap gap-1.5">
                            {dataset.format.map((fmt, i) => (
                              <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">{fmt}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-4 border-t border-border/40 bg-muted/10 gap-2 flex-wrap">
                    {dataset.huggingfaceUrl && (
                      <Button size="sm" variant="outline" className="h-8 gap-1.5 flex-1" asChild>
                        <a href={dataset.huggingfaceUrl} target="_blank" rel="noopener noreferrer">
                          <Layers size={14} /> HuggingFace
                        </a>
                      </Button>
                    )}
                    {dataset.kaggleUrl && (
                      <Button size="sm" variant="outline" className="h-8 gap-1.5 flex-1" asChild>
                        <a href={dataset.kaggleUrl} target="_blank" rel="noopener noreferrer">
                          <Database size={14} /> Kaggle
                        </a>
                      </Button>
                    )}
                    {(dataset.downloadUrl && !dataset.huggingfaceUrl && !dataset.kaggleUrl) && (
                      <Button size="sm" variant="default" className="h-8 gap-1.5 w-full" asChild>
                        <a href={dataset.downloadUrl} target="_blank" rel="noopener noreferrer">
                          <Download size={14} /> Download Direct
                        </a>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="github" className="m-0 space-y-6">
          {!searchTriggered ? (
            <EmptyState icon={<Github size={48} />} title="Find Code Implementations" desc="Search for official and unofficial open-source implementations of research papers." />
          ) : githubQuery.isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => <DatasetSkeleton key={i} />)}
            </div>
          ) : githubQuery.isError ? (
            <ErrorState retry={() => githubQuery.refetch()} />
          ) : githubQuery.data?.repos.length === 0 ? (
            <EmptyState icon={<Github size={48} />} title="No repositories found" desc={`No results for "${query}". Try adjusting your keywords.`} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {githubQuery.data?.repos.map(repo => (
                <Card key={repo.id} className="flex flex-col h-full border-border/50 hover:border-foreground/20 transition-all shadow-sm bg-card/40">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <Github className="shrink-0 text-muted-foreground" size={20} />
                        <CardTitle className="text-lg font-semibold line-clamp-1" title={repo.fullName}>
                          <a href={repo.url} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-primary">
                            {repo.fullName}
                          </a>
                        </CardTitle>
                      </div>
                      <Badge variant="secondary" className="shrink-0 flex items-center gap-1 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/20 border-yellow-500/20">
                        <Star size={12} className="fill-current" /> {repo.stars.toLocaleString()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 pb-4">
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {repo.description || <span className="italic opacity-50">No description provided</span>}
                    </p>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground mb-4">
                      {repo.language && (
                        <div className="flex items-center gap-1.5 font-medium text-foreground/80">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          {repo.language}
                        </div>
                      )}
                      {repo.framework && (
                        <div className="flex items-center gap-1.5 font-medium text-accent">
                          <Layers size={12} /> {repo.framework}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} /> Updated {formatDistanceToNow(new Date(repo.lastUpdated), { addSuffix: true })}
                      </div>
                    </div>

                    {repo.topics && repo.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {repo.topics.slice(0, 5).map((topic, i) => (
                          <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground bg-muted/20 border-border/50">
                            {topic}
                          </Badge>
                        ))}
                        {repo.topics.length > 5 && (
                          <span className="text-xs text-muted-foreground ml-1">+{repo.topics.length - 5}</span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

    </div>
  );
}

function EmptyState({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-card/30 rounded-xl border border-dashed border-border/60">
      <div className="p-4 rounded-full bg-muted/50 text-muted-foreground/50 mb-2">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-foreground/80">{title}</h3>
      <p className="text-muted-foreground max-w-md">{desc}</p>
    </div>
  );
}

function ErrorState({ retry }: { retry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
      <h3 className="text-xl font-semibold text-destructive">Something went wrong</h3>
      <p className="text-muted-foreground">Failed to fetch search results.</p>
      <Button onClick={retry} variant="outline">Try Again</Button>
    </div>
  );
}

function DatasetSkeleton() {
  return (
    <Card className="h-full border-border/30">
      <CardHeader className="pb-3">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/4" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}