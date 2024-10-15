import { useRef, useEffect } from 'react';

// Custom hook for speech recognition
const useSpeechRecognition = (onResult: any, onError: any) => {
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onError('Tarayıcı ses tanımayı desteklemiyor.');
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;

    recognition.lang = "tr-TR";
    recognition.continuous = false;
    recognition.interimResults = false;
     
    recognition.onresult = (event: any) => {
      const command = event.results[0][0].transcript.toLowerCase();
      onResult(command);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      onError('Bir hata oluştu. Lütfen tekrar deneyin.');
    };

    return () => {
      recognition.abort();
    };
  }, [onResult, onError]);

  const startRecognition = () => recognitionRef.current?.start();
  const stopRecognition = () => recognitionRef.current?.stop();

  return { startRecognition, stopRecognition };
};

export default useSpeechRecognition;