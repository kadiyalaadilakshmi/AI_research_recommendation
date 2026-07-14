import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Search, Home, FileQuestion } from "lucide-react";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center text-muted-foreground mb-8">
        <FileQuestion size={48} className="opacity-50" />
      </div>
      
      <h1 className="text-4xl font-bold tracking-tight mb-2">404 - Page Not Found</h1>
      <p className="text-lg text-muted-foreground max-w-md mb-8">
        The research portal or page you're looking for doesn't exist or has been moved.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button size="lg" onClick={() => setLocation('/')} className="gap-2">
          <Home size={18} /> Back to Home
        </Button>
        <Button size="lg" variant="outline" onClick={() => setLocation('/results')} className="gap-2">
          <Search size={18} /> Search Papers
        </Button>
      </div>
    </div>
  );
}