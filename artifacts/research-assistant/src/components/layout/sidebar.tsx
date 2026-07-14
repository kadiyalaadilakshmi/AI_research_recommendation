import { Link, useLocation } from 'wouter';
import { 
  Search, 
  BarChart2, 
  Map as MapIcon, 
  TrendingUp, 
  Database, 
  Bookmark, 
  MessageSquare,
  Moon,
  Sun
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();

  const links = [
    { href: '/', label: 'Search', icon: Search },
    { href: '/compare', label: 'Compare', icon: BarChart2 },
    { href: '/roadmap', label: 'Roadmap', icon: MapIcon },
    { href: '/trending', label: 'Trending', icon: TrendingUp },
    { href: '/datasets', label: 'Datasets', icon: Database },
    { href: '/saved', label: 'Saved', icon: Bookmark },
    { href: '/chat', label: 'AI Chat', icon: MessageSquare },
  ];

  return (
    <div className="hidden md:flex flex-col w-64 border-r border-border/40 bg-card/50 dark:bg-[#151b23] backdrop-blur-sm shrink-0 sticky top-0 h-screen">
      <div className="p-6 flex items-center gap-3 border-b border-border/40">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg">
          <Search size={18} strokeWidth={2.5} />
        </div>
        <span className="font-bold text-lg tracking-tight">ResearchLens</span>
      </div>
      
      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
          Discover
        </div>
        {links.slice(0, 5).map((link) => (
          <Link key={link.href} href={link.href} className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors font-medium text-sm",
            location === link.href 
              ? "bg-primary/10 text-primary" 
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}>
            <link.icon size={18} className={location === link.href ? "text-primary" : "text-muted-foreground"} />
            {link.label}
          </Link>
        ))}

        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-8 mb-4 px-2">
          Workspace
        </div>
        {links.slice(5).map((link) => (
          <Link key={link.href} href={link.href} className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors font-medium text-sm",
            location === link.href 
              ? "bg-primary/10 text-primary" 
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}>
            <link.icon size={18} className={location === link.href ? "text-primary" : "text-muted-foreground"} />
            {link.label}
          </Link>
        ))}
      </div>
      
      <div className="p-4 border-t border-border/40">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? (
            <><Sun size={18} className="mr-3" /> Light Mode</>
          ) : (
            <><Moon size={18} className="mr-3" /> Dark Mode</>
          )}
        </Button>
      </div>
    </div>
  );
}