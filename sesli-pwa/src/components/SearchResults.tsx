import React from 'react';
import { SearchResultsProps } from '../types/types';

const SearchResults: React.FC<SearchResultsProps> = ({ results, onResultSelect }) => {
    return (
        <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Arama Sonuçları:</h2>
            {results.length > 0 ? (
                <ul className="space-y-2">
                    {results.map(result => (
                        <li key={result.id} className="border p-2 rounded">
                            <h3 className="font-semibold">{result.title}</h3>
                            <p>Alaka Düzeyi: {result.relevanceScore.toFixed(2)}</p>
                            <button
                                onClick={() => onResultSelect(result)}
                                className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                            >
                                Daha Fazla Göster
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Sonuç bulunamadı.</p>
            )}
        </div>
    );
};

export default SearchResults;