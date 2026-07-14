import React from 'react';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { PaperStoreProvider } from '@/lib/paper-store';

import { Sidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';

import Home from '@/pages/home';
import Results from '@/pages/results';
import PaperDetail from '@/pages/paper-detail';
import Compare from '@/pages/compare';
import Roadmap from '@/pages/roadmap';
import Trending from '@/pages/trending';
import Datasets from '@/pages/datasets';
import Saved from '@/pages/saved';
import Chat from '@/pages/chat';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] bg-background text-foreground w-full">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <MobileNav />
        <main className="flex-1 w-full flex flex-col relative overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/results" component={Results} />
        <Route path="/paper/:id" component={PaperDetail} />
        <Route path="/compare" component={Compare} />
        <Route path="/roadmap" component={Roadmap} />
        <Route path="/trending" component={Trending} />
        <Route path="/datasets" component={Datasets} />
        <Route path="/saved" component={Saved} />
        <Route path="/chat" component={Chat} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <PaperStoreProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </PaperStoreProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;