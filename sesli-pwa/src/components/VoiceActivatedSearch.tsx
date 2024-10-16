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
    const [isReadingResults, setIsReadingResults] = useState(false);
    const [isReadingDetails, setIsReadingDetails] = useState(false);
    const [isListeningEnabled, setIsListeningEnabled] = useState(false);
    const [microphonePermission, setMicrophonePermission] = useState<boolean | null>(null);
    const isSpeakingRef = useRef(false);

    const requestMicrophoneAccess = () => {
        requestMediaPermissions()
            .then(() => {
                setMicrophonePermission(true);
                setIsListeningEnabled(true);
            })
            .catch((err: MediaPermissionsError) => {
                setMicrophonePermission(false);
                const { type, message } = err;
                let customMessage: string;
                switch (type) {
                    case MediaPermissionsErrorType.SystemPermissionDenied:
                        customMessage = `Your system has not granted microphone access. Message: ${message}`;
                        break;
                    case MediaPermissionsErrorType.UserPermissionDenied:
                        customMessage = `You denied the permission to use the microphone. Message: ${message}`;
                        break;
                    case MediaPermissionsErrorType.CouldNotStartVideoSource:
                        customMessage = `Another application is using the microphone. ${message}`;
                        break;
                    default:
                        customMessage = `Failed to access the microphone. ${message}`;
                }
                setErrorMessage(customMessage);
            });
    };

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition({
        commands: [
            {
                command: 'reset',
                callback: () => resetTranscript()
            }
        ]
    });

    const performSearch = useCallback((query: string) => {
        console.log('Performing search for:', query);
        const results = searchMockData(query);
        setSearchResults(results);
        setSearchQuery(query);
        setCurrentResultIndex(0);
        setIsReadingResults(true);
        if (results.length > 0) {
            speakResultTitle(results[0]);
        } else {
            speakText('Sonuç bulunamadı. Lütfen başka bir arama yapın.');
        }
    }, []);

    const speakText = (text: string, onEndCallback?: () => void) => {
        isSpeakingRef.current = true;
        stopListening();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "tr-TR";
        utterance.onend = () => {
            isSpeakingRef.current = false;
            if (onEndCallback) onEndCallback();
            if (isListeningEnabled) startListening();  // Ensure listening resumes if needed
        };
        window.speechSynthesis.speak(utterance);
    };

    const speakResultTitle = (result: SearchResult) => {
        setSelectedResult(result);
        speakText(`${result.title}. Daha fazla bilgi ister misiniz?`);
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
            } else if (command.includes('temizle') || command.includes('yeni arama')) {
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
        setIsReadingResults(false);
        setIsReadingDetails(false);
        speakText('Arama temizlendi. Yeni bir arama yapmaya hazır olduğunuzda butona tıklayın.');
    };

    useEffect(() => {
        if (transcript && !isSpeakingRef.current) {
            if (isReadingResults) {
                handleVoiceCommand(transcript.toLowerCase());
            } else {
                setSearchQuery(transcript);
                performSearch(transcript);
            }
            resetTranscript();
        }
    }, [transcript, searchResults, currentResultIndex, performSearch, isReadingResults]);

    const startListening = () => {
        if (!isListeningEnabled) return;
        SpeechRecognition.startListening({ language: 'tr-TR' }).catch((error: any) => {
            console.error('Speech recognition error:', error);
            setErrorMessage(`Ses tanıma başlatılırken hata oluştu: ${error.message}`);
        });
    };

    const stopListening = () => {
        SpeechRecognition.stopListening().catch((error: any) => {
            console.error('Error stopping speech recognition:', error);
            setErrorMessage(`Ses tanıma durdurulurken hata oluştu: ${error.message}`);
        });
    };

    const toggleListening = () => {
        if (listening) {
            stopListening();
        } else if (microphonePermission) {
            startListening();
        }
    };

    if (!browserSupportsSpeechRecognition) {
        return <span>Tarayıcınız ses tanımayı desteklemiyor.</span>;
    }

    if (microphonePermission === false) {
        return <div>Microphone access is needed: {errorMessage}</div>;
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Sesli Arama Uygulaması</h1>
            {!microphonePermission && (
                <button
                    onClick={requestMicrophoneAccess}
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mb-4"
                >
                    Mikrofon İzni Ver
                </button>
            )}
            <div className="flex items-center mb-4">
                <button
                    onClick={toggleListening}
                    className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2 flex items-center ${!isListeningEnabled && 'opacity-50 cursor-not-allowed'}`}
                    disabled={!isListeningEnabled}
                >
                    {listening ? <Mic className="mr-2" /> : <MicOff className="mr-2" />}
                    {listening ? 'Dinlemeyi Durdur' : 'Sesli Aramayı Başlat'}
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