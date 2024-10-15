import React, { useState, useEffect, useCallback, useRef } from 'react';
import SearchResults from './SearchResults';
import ResultPopup from './ResultPopup';
import { searchMockData } from '../mocks/mockData';
import { SearchResult } from '../types/types';
import { Mic, MicOff } from 'lucide-react';

const VoiceActivatedSearch: React.FC = () => {
    const [isListening, setIsListening] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const recognitionRef = useRef<any>(null);
    const timeoutRef = useRef<number | null>(null);

    const performSearch = useCallback((query: string) => {
        console.log('Performing search for:', query);
        const results = searchMockData(query);
        setSearchResults(results);
        setSearchQuery(query);
    }, []);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        const recognition = recognitionRef.current;

        recognition.lang = "tr-TR";
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            console.log('Voice recognition started');
            setIsListening(true);
            setErrorMessage(null);
            // Set a timeout for 5 seconds
            timeoutRef.current = window.setTimeout(() => {
                recognition.stop();
                setErrorMessage("Ses algılanamadı. Lütfen tekrar deneyin.");
            }, 5000);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            console.log('Recognized speech:', transcript);
            setSearchQuery(transcript);
            performSearch(transcript);
            // Clear the timeout as we've received a result
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };

        recognition.onend = () => {
            console.log('Voice recognition ended');
            setIsListening(false);
            // Clear the timeout if it hasn't fired yet
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
            setErrorMessage("Ses tanıma hatası oluştu. Lütfen tekrar deneyin.");
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };

        return () => {
            recognition.abort();
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [performSearch]);

    const handleStartListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.start();
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Sesli Arama Uygulaması</h1>
            <div className="flex items-center mb-4">
                <button
                    onClick={handleStartListening}
                    disabled={isListening}
                    className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2 flex items-center ${isListening ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isListening ? <Mic className="mr-2" /> : <MicOff className="mr-2" />}
                    {isListening ? 'Dinleniyor...' : 'Sesli Aramayı Başlat'}
                </button>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-2 border-gray-300 bg-white h-10 px-5 rounded-lg text-sm focus:outline-none flex-grow"
                    placeholder="Arama sorgusu..."
                />
                <button
                    onClick={() => performSearch(searchQuery)}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ml-2"
                >
                    Ara
                </button>
            </div>
            {errorMessage && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Hata: </strong>
                    <span className="block sm:inline">{errorMessage}</span>
                </div>
            )}
            <SearchResults results={searchResults} onResultSelect={setSelectedResult} />
            <ResultPopup result={selectedResult} onClose={() => setSelectedResult(null)} />
        </div>
    );
};

export default VoiceActivatedSearch;