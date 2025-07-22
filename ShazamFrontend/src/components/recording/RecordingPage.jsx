import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import WaveformVisualizer from './WaveformVisualizer';

const RecordingPage = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [error, setError] = useState(null);
  const [audioQuality, setAudioQuality] = useState({ sampleRate: 0, bitDepth: 16 });

  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioPlayerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      // Check supported MIME types
      const mimeTypes = ['audio/wav', 'audio/webm', 'audio/ogg'];
      let selectedMimeType = null;
      
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          selectedMimeType = type;
          break;
        }
      }

      if (!selectedMimeType) {
        throw new Error('No supported audio MIME types found');
      }

      console.log('Using MIME type:', selectedMimeType);

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
        audioBitsPerSecond: 44100
      });

      audioChunksRef.current = [];
      setRecordingTime(30);
      setAudioQuality({
        sampleRate: audioContextRef.current.sampleRate,
        bitDepth: 16
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: selectedMimeType });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start(100);
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingTime((time) => {
          if (time <= 1) {
            stopRecording();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Recording error:', err);
      setError(err.message || 'Microphone access denied. Please allow microphone access and try again.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      clearInterval(timerRef.current);
      setIsRecording(false);
    }
  };

  const playRecording = () => {
    if (audioBlob && !isPlaying) {
      const audioUrl = URL.createObjectURL(audioBlob);
      audioPlayerRef.current = new Audio(audioUrl);
      audioPlayerRef.current.onended = () => setIsPlaying(false);
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  const stopPlayback = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const convertToWav = async (audioBlob) => {
    try {
      // Create audio context
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Convert blob to array buffer
      const arrayBuffer = await audioBlob.arrayBuffer();
      
      // Decode audio data
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // Get the raw audio data
      const numberOfChannels = audioBuffer.numberOfChannels;
      const length = audioBuffer.length;
      const sampleRate = audioBuffer.sampleRate;
      const channelData = [];
      
      // Get audio data from all channels
      for (let channel = 0; channel < numberOfChannels; channel++) {
        channelData.push(audioBuffer.getChannelData(channel));
      }
      
      // Create WAV file
      const wavFile = {
        sampleRate: sampleRate,
        numberOfChannels: numberOfChannels,
        length: length
      };
      
      // Create the WAV format data
      const wavData = new Float32Array(length * numberOfChannels);
      
      // Interleave the channel data
      for (let i = 0; i < length; i++) {
        for (let channel = 0; channel < numberOfChannels; channel++) {
          wavData[i * numberOfChannels + channel] = channelData[channel][i];
        }
      }
      
      // Convert to 16-bit PCM
      const pcmData = new Int16Array(wavData.length);
      for (let i = 0; i < wavData.length; i++) {
        const s = Math.max(-1, Math.min(1, wavData[i]));
        pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }
      
      // Create WAV header
      const headerLength = 44;
      const dataLength = pcmData.length * 2; // 2 bytes per sample
      const totalLength = headerLength + dataLength;
      
      const wavBuffer = new ArrayBuffer(totalLength);
      const view = new DataView(wavBuffer);
      
      // WAV header
      writeString(view, 0, 'RIFF'); // RIFF identifier
      view.setUint32(4, totalLength - 8, true); // file length - 8
      writeString(view, 8, 'WAVE'); // WAVE identifier
      writeString(view, 12, 'fmt '); // fmt chunk
      view.setUint32(16, 16, true); // length of fmt chunk
      view.setUint16(20, 1, true); // PCM format
      view.setUint16(22, numberOfChannels, true); // number of channels
      view.setUint32(24, sampleRate, true); // sample rate
      view.setUint32(28, sampleRate * numberOfChannels * 2, true); // byte rate
      view.setUint16(32, numberOfChannels * 2, true); // block align
      view.setUint16(34, 16, true); // bits per sample
      writeString(view, 36, 'data'); // data chunk identifier
      view.setUint32(40, dataLength, true); // data chunk length
      
      // Write PCM data
      const pcmOffset = 44;
      for (let i = 0; i < pcmData.length; i++) {
        view.setInt16(pcmOffset + i * 2, pcmData[i], true);
      }
      
      return new Blob([wavBuffer], { type: 'audio/wav' });
    } catch (err) {
      console.error('Error converting to WAV:', err);
      throw new Error('Failed to convert audio format');
    }
  };

  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const matchSong = async () => {
    if (!audioBlob) return;

    setIsMatching(true);
    setError(null);
    setMatchResult(null);

    try {
      console.log('Converting audio to WAV format...');
      const wavBlob = await convertToWav(audioBlob);
      console.log('Converted to WAV:', wavBlob);

      const formData = new FormData();
      formData.append('file', wavBlob, 'recording.wav');

      console.log('Sending audio file:', wavBlob);
      const response = await axios.post('${import.meta.env.VITE_BACKEND_URL}/match', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Response:', response.data);
      
      if (response.data.status === 'error') {
        setError(response.data.message);
        return;
      }

      if (response.data.match === false) {
        setError('No matching song found. Try recording again.');
        return;
      }

      setMatchResult(response.data);
    } catch (err) {
      console.error('Error matching song:', err);
      setError(err.message || 'Error processing audio. Please try again.');
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-950 py-20 px-4 font-['Inter']">
      <div className="max-w-4xl mx-auto">
        <div className="bg-zinc-900/80 rounded-2xl p-8 backdrop-blur-sm border border-zinc-800/50 shadow-xl">
          {/* Recording Interface */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Find Any Song</h1>
            <p className="text-zinc-400">Record a song playing around you to identify it</p>
          </div>

          <div className="flex flex-col items-center justify-center space-y-6">
            {/* Waveform Visualizer */}
            <div className="w-full h-32 bg-zinc-800/50 rounded-xl overflow-hidden">
              <WaveformVisualizer
                isRecording={isRecording}
                analyser={analyserRef.current}
              />
            </div>

            {/* Timer */}
            <div className="text-2xl font-semibold text-white">
              {recordingTime}s
            </div>

            {/* Recording Controls */}
            <div className="flex items-center gap-4">
              {!isRecording ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startRecording}
                  className="px-6 py-3 bg-violet-600 hover:bg-violet-700 rounded-full text-white font-medium flex items-center gap-2 transition-all"
                >
                  <i className="ri-record-circle-line text-xl" />
                  Start Recording
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={stopRecording}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-full text-white font-medium flex items-center gap-2 transition-all"
                >
                  <i className="ri-stop-circle-line text-xl" />
                  Stop Recording
                </motion.button>
              )}

              {audioBlob && !isRecording && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={isPlaying ? stopPlayback : playRecording}
                  className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 rounded-full text-white font-medium flex items-center gap-2 transition-all"
                >
                  <i className={`ri-${isPlaying ? 'stop' : 'play'}-circle-line text-xl`} />
                  {isPlaying ? 'Stop' : 'Play'} Recording
                </motion.button>
              )}
            </div>

            {/* Recording Quality Info */}
            {audioBlob && (
              <div className="text-sm text-zinc-400">
                Sample Rate: {audioQuality.sampleRate}Hz • Bit Depth: {audioQuality.bitDepth}-bit
              </div>
            )}

            {/* Match Button */}
            {audioBlob && !isRecording && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={matchSong}
                disabled={isMatching}
                className="px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 rounded-full text-white font-medium flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {isMatching ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Identifying song...
                  </>
                ) : (
                  <>
                    <i className="ri-music-2-line text-xl" />
                    Find Song
                  </>
                )}
              </motion.button>
            )}

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-red-400 text-center"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Match Results */}
            <AnimatePresence>
              {matchResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="w-full max-w-md bg-zinc-800/50 rounded-xl p-6 border border-zinc-700/50"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={matchResult.coverUrl || '/album-placeholder.jpg'}
                      alt={matchResult.album}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-1">
                        {matchResult.title}
                      </h3>
                      <p className="text-zinc-400">{matchResult.artist}</p>
                      {matchResult.album && (
                        <p className="text-zinc-500 text-sm">{matchResult.album}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordingPage; 