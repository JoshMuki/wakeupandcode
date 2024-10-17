import React, { useState, useCallback, useEffect, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { MediaPermissionsError, MediaPermissionsErrorType, requestMediaPermissions } from 'mic-check';
import SearchResults from './SearchResults';
import ResultPopup from './ResultPopup';
import { searchMockData } from '../mocks/mockData';
import { SearchResult } from '../types/types';
import { Mic, MicOff } from 'lucide-react';

const VoiceActivatedSearch: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [currentResultIndex, setCurrentResultIndex] = useState(0);
    const [isReadingDetails, setIsReadingDetails] = useState(false);
    const [microphonePermission, setMicrophonePermission] = useState<boolean | null>(null);
    const isSpeakingRef = useRef(false);
    const [isCapturingQuery, setIsCapturingQuery] = useState(false);
    const [isListening, setIsListening] = useState(false);

    const {
        transcript,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    const checkMicrophonePermission = useCallback(async () => {
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            setMicrophonePermission(true);
        } catch (err) {
            setMicrophonePermission(false);
        }
    }, []);

    useEffect(() => {
        checkMicrophonePermission();
    }, [checkMicrophonePermission]);

    const requestMicrophoneAccess = async () => {
        try {
            await requestMediaPermissions();
            setMicrophonePermission(true);
        } catch (err: unknown) {
            const error = err as MediaPermissionsError;
            setMicrophonePermission(false);
            let customMessage: string;
            switch (error.type) {
                case MediaPermissionsErrorType.SystemPermissionDenied:
                    customMessage = `Sistem mikrofon erişimine izin vermedi. Mesaj: ${error.message}`;
                    break;
                case MediaPermissionsErrorType.UserPermissionDenied:
                    customMessage = `Mikrofon kullanma izni reddedildi. Mesaj: ${error.message}`;
                    break;
                case MediaPermissionsErrorType.CouldNotStartVideoSource:
                    customMessage = `Başka bir uygulama mikrofonu kullanıyor. ${error.message}`;
                    break;
                default:
                    customMessage = `Mikrofona erişilemedi. ${error.message}`;
            }
            setErrorMessage(customMessage);
        }
    };

    const performSearch = useCallback((query: string) => {
        console.log('Performing search for:', query);
        const results = searchMockData(query);
        setSearchResults(results);
        setSearchQuery(query);
        setCurrentResultIndex(0);
        
        speakText(`${results.length} sonuç bulundu. İlk sonucu okuyorum.`, () => {
            if (results.length > 0) {
                speakResultTitle(results[0]);
            } else {
                speakText('Sonuç bulunamadı. Lütfen başka bir arama yapın.');
            }
        });
    }, []);

    const speakText = (text: string, onEndCallback?: () => void) => {
        isSpeakingRef.current = true;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "tr-TR";
        utterance.onend = () => {
            isSpeakingRef.current = false;
            if (onEndCallback) onEndCallback();
        };
        window.speechSynthesis.speak(utterance);
    };

    const speakResultTitle = (result: SearchResult) => {
        setSelectedResult(result);
        speakText(`${result.title}. Daha fazla bilgi ister misiniz?`, () => {
            startListening();
        });
    };

    const speakResultContent = (result: SearchResult) => {
        speakText(result.content, () => {
            speakText('Diğer sonuca geçmek ister misiniz, yoksa aramayı temizlemek mi istersiniz?', () => {
                setIsReadingDetails(false);
                startListening();
            });
        });
    };

    const handleVoiceCommand = (command: string) => {
        if (isSpeakingRef.current) return;

        if (!isReadingDetails) {
            if (command.includes('evet')) {
                setIsReadingDetails(true);
                speakResultContent(searchResults[currentResultIndex]);
            } else if (command.includes('hayır')) {
                moveToNextResult();
            } else {
                speakText('Anlaşılamadı. Lütfen evet veya hayır deyin.');
            }
        } else {
            if (command.includes('diğer') || command.includes('sonraki')) {
                moveToNextResult();
            } else if (command.includes('temizle') || command.includes('kapat')) {
                clearSearch();
            } else {
                speakText('Anlaşılamadı. Lütfen diğer sonuca geçmek için "diğer" veya aramayı temizlemek için "temizle" deyin.');
            }
        }
    };

    const moveToNextResult = () => {
        const nextIndex = currentResultIndex + 1;
        if (nextIndex < searchResults.length) {
            setCurrentResultIndex(nextIndex);
            speakResultTitle(searchResults[nextIndex]);
        } else {
            speakText('Başka sonuç kalmadı. Aramayı temizlemek ister misiniz?');
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setSelectedResult(null);
        setCurrentResultIndex(0);
        setIsReadingDetails(false);
        speakText('Arama temizlendi. Yeni bir arama yapmaya hazırsınız.');
        setIsListening(false);
        SpeechRecognition.stopListening();
    };

    useEffect(() => {
        if (transcript && !isSpeakingRef.current) {
            if (isCapturingQuery) {
                setIsCapturingQuery(false);
                setIsListening(false);
                performSearch(transcript);
                SpeechRecognition.stopListening();
            } else {
                handleVoiceCommand(transcript.toLowerCase());
            }
            resetTranscript();
        }
    }, [transcript, isCapturingQuery, performSearch]);

    const startListening = () => {
        if (microphonePermission) {
            setIsListening(true);
            SpeechRecognition.startListening({ language: 'tr-TR' }).catch((error: any) => {
                console.error('Speech recognition error:', error);
                setErrorMessage(`Ses tanıma başlatılırken hata oluştu: ${error.message}`);
                setIsListening(false);
            });
        } else {
            requestMicrophoneAccess();
        }
    };

    const toggleListening = () => {
        if (isListening) {
            setIsListening(false);
            SpeechRecognition.stopListening();
        } else {
            setIsCapturingQuery(true);
            startListening();
        }
    };

    if (!browserSupportsSpeechRecognition) {
        return <span>Tarayıcınız ses tanımayı desteklemiyor.</span>;
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Sesli Arama Uygulaması</h1>
            <div className="flex items-center mb-4">
                <button
                    onClick={toggleListening}
                    className={`${isListening ? 'bg-red-500 hover:bg-red-700' : 'bg-blue-500 hover:bg-blue-700'} text-white font-bold p-2 rounded-full mr-2`}
                    aria-label={isListening ? 'Dinlemeyi Durdur' : 'Sesli Aramayı Başlat'}
                >
                    {isListening ? <MicOff size={24} /> : <Mic size={24} />}
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
            {isListening && (
                <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4">
                    <strong className="font-bold">Dinleniyor: </strong>
                    <span className="block sm:inline">Lütfen arama sorgunuzu söyleyin.</span>
                </div>
            )}
            {transcript && (
                <div className="bg-gray-100 border border-gray-400 text-gray-700 px-4 py-3 rounded relative mb-4">
                    <strong className="font-bold">Tanınan Metin: </strong>
                    <span className="block sm:inline">{transcript}</span>
                </div>
            )}
            <SearchResults
                results={searchResults}
                onResultSelect={(result) => {
                    setSelectedResult(result);
                    speakResultTitle(result);
                }}
            />
            <ResultPopup result={selectedResult} onClose={() => setSelectedResult(null)} />
        </div>
    );
};

export default VoiceActivatedSearch;