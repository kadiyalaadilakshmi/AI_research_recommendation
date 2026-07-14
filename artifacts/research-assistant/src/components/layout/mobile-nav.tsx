import { Link, useLocation } from 'wouter';
import { 
  Search, 
  BarChart2, 
  Map as MapIcon, 
  TrendingUp, 
  Database, 
  Bookmark, 
  MessageSquare,
  Menu
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function MobileNav() {
  const [location, setLocation] = useLocation();

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
    <div className="md:hidden flex items-center justify-between p-4 border-b border-border/40 glass-effect sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white">
          <Search size={16} strokeWidth={2.5} />
        </div>
        <span className="font-bold text-lg tracking-tight">ResearchLens</span>
      </div>
      
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[80vw] sm:w-[350px] flex flex-col p-0">
          <SheetHeader className="p-6 border-b border-border/40 text-left">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
            {links.map((link) => (
              <SheetTrigger asChild key={link.href}>
                <Link href={link.href} className={`flex items-center gap-3 px-3 py-3 rounded-md transition-colors font-medium text-sm ${
                  location === link.href 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}>
                  <link.icon size={18} />
                  {link.label}
                </Link>
              </SheetTrigger>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}