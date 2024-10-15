export interface SearchResult {
  id: number;
  title: string;
  content: string;
  relevanceScore: number;
}

export interface SearchResultsProps {
  results: SearchResult[];
  onResultSelect: (result: SearchResult) => void;
}

export interface ResultPopupProps {
  result: SearchResult | null;
  onClose: () => void;
}
