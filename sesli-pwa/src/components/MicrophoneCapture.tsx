import { useState, useRef } from 'react';
import { Button, Typography, Paper, Box } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';

const MicrophoneCapture = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      
      recognitionRef.current = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        const currentTranscript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setTranscript(currentTranscript);
      };

      recognitionRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Failed to access microphone. Please ensure you have granted the necessary permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, p: 2 }}>
      <Button
        variant="contained"
        onClick={toggleRecording}
        startIcon={isRecording ? <MicOffIcon /> : <MicIcon />}
        color={isRecording ? "error" : "primary"}
      >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </Button>
      <Paper elevation={3} sx={{ p: 2, width: '100%', maxWidth: 'md', minHeight: 100 }}>
        <Typography variant="body1" color="text.secondary">
          {transcript || 'Transcript will appear here...'}
        </Typography>
      </Paper>
    </Box>
  );
};

export default MicrophoneCapture;