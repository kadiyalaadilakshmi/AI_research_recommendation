import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Paper } from '@workspace/api-client-react';

interface PaperStore {
  selectedPapers: Paper[];
  addPaper: (p: Paper) => void;
  removePaper: (id: string) => void;
  clearPapers: () => void;
  currentPaper: Paper | null;
  setCurrentPaper: (p: Paper | null) => void;
}

const PaperStoreContext = createContext<PaperStore | undefined>(undefined);

export function PaperStoreProvider({ children }: { children: ReactNode }) {
  const [selectedPapers, setSelectedPapers] = useState<Paper[]>([]);
  const [currentPaper, setCurrentPaper] = useState<Paper | null>(null);

  const addPaper = (paper: Paper) => {
    setSelectedPapers(prev => {
      if (prev.find(p => p.id === paper.id)) return prev;
      return [...prev, paper];
    });
  };

  const removePaper = (id: string) => {
    setSelectedPapers(prev => prev.filter(p => p.id !== id));
  };

  const clearPapers = () => {
    setSelectedPapers([]);
  };

  return (
    <PaperStoreContext.Provider value={{
      selectedPapers,
      addPaper,
      removePaper,
      clearPapers,
      currentPaper,
      setCurrentPaper
    }}>
      {children}
    </PaperStoreContext.Provider>
  );
}

export function usePaperStore() {
  const context = useContext(PaperStoreContext);
  if (context === undefined) {
    throw new Error('usePaperStore must be used within a PaperStoreProvider');
  }
  return context;
}