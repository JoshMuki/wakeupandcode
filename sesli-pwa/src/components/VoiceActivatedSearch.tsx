import React, { useState, useCallback } from 'react';
import SearchResults from './SearchResults';
import ResultPopup from './ResultPopup';
import { searchMockData } from '../mocks/mockData';
import { SearchResult } from '../types/types';
import useSpeechRecognition from '../hooks/useSpeechRecognition';

const VoiceActivatedSearch: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [shouldContinueListening, setShouldContinueListening] = useState(true);
  const [isIgnoringNextResult, setIsIgnoringNextResult] = useState(false);
  
  const { startRecognition, stopRecognition } = useSpeechRecognition(
    (command: any) => {
      console.log('Recognized command:', command);
      
      if (isIgnoringNextResult) {
        setIsIgnoringNextResult(false);
        return;
      }

      handleVoiceCommand(command);
    },
    (error: any) => {
      console.error('Speech recognition error:', error);
      speakWithDelay(error);
      setShouldContinueListening(false);
    }
  );

  const performSearch = useCallback((query: string) => {
    console.log('Performing search for:', query);
    const results = searchMockData(query);
    setSearchResults(results);
    setCurrentResultIndex(0);
    if (results.length > 0) {
      speakResult(results[0], 0);
    } else {
      speakWithDelay('Sonuç bulunamadı. Yeni bir arama yapmak ister misiniz?');
    }
  }, []);

  const speakWithDelay = (text: string, delay = 1000) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "tr-TR";
    window.speechSynthesis.speak(utterance);

    utterance.onend = () => {
      setTimeout(() => {
        setIsIgnoringNextResult(true);
        if (shouldContinueListening) {
          startRecognition();
        }
      }, delay);
    };
  };

  const speakResult = (result: SearchResult, index: number) => {
    speakWithDelay(`${index + 1}. sonuç: ${result.title}. Alaka düzeyi: ${result.relevanceScore.toFixed(2)}. Daha fazla bilgi ister misiniz?`);
  };

  const handleVoiceCommand = (command: string) => {
    if (searchResults.length > 0) {
      if (command === 'evet') {
        setSelectedResult(searchResults[currentResultIndex]);
        speakWithDelay(searchResults[currentResultIndex].content);
        setShouldContinueListening(false);
      } else if (command === 'hayır' || command === 'yok') {
        const nextIndex = currentResultIndex + 1;
        if (nextIndex < searchResults.length) {
          setCurrentResultIndex(nextIndex);
          speakResult(searchResults[nextIndex], nextIndex);
        } else {
          speakWithDelay('Başka sonuç kalmadı. Yeni bir arama yapmak ister misiniz?');
        }
      } else {
        setSearchQuery(command);
        performSearch(command);
      }
    } else {
      if (command === 'evet') {
        speakWithDelay('Lütfen arama sorgunuzu söyleyin.');
      } else if (command === 'hayır' || command === 'yok') {
        speakWithDelay('Aramayı sonlandırıyorum.');
        setShouldContinueListening(false);
      } else {
        setSearchQuery(command);
        performSearch(command);
      }
    }
  };

  const handleActivation = () => {
    setIsActivating(true);
    speakWithDelay('Merhaba, bir arama sorgusu söyleyin');

    setTimeout(() => {
      setIsActivating(false);
      setShouldContinueListening(true);
      setIsIgnoringNextResult(true);
      startRecognition();
    }, 2000);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Sesli Arama Uygulaması</h1>
      <button
        onClick={handleActivation}
        disabled={isActivating || isListening}
        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2 ${isActivating || isListening ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isActivating ? 'Hazırlanıyor...' : isListening ? 'Dinleniyor...' : 'Sesli Aramayı Başlat'}
      </button>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="border-2 border-gray-300 bg-white h-10 px-5 rounded-lg text-sm focus:outline-none"
        placeholder="Arama sorgusu..."
      />
      <button
        onClick={() => performSearch(searchQuery)}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ml-2"
      >
        Ara
      </button>
      <SearchResults results={searchResults} onResultSelect={setSelectedResult} />
      <ResultPopup result={selectedResult} onClose={() => setSelectedResult(null)} />
    </div>
  );
};

export default VoiceActivatedSearch;