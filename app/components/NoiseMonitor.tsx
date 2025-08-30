"use client";
import { useEffect, useState, useRef } from "react";
import Vol_adjust from "./Vol_adjust"

export default function NoiseMonitor() {
  const [volume, setVolume] = useState(0);
  const [tooLoud, setTooLoud] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0); // Timer state in seconds
  
  const loudTimeRef = useRef(0); // how long it's been loud in ms
  const quietTimeRef = useRef(0); // how long it's been quiet in ms
  const lastCheckRef = useRef(Date.now()); // for volume checking
  const timerStartRef = useRef(Date.now()); // when timer started
  const timerPausedTimeRef = useRef(0); // accumulated paused time
  const pauseStartRef = useRef<number | null>(null); // when current pause started

  const [threshold, setThreshold] = useState(-20); // set volume if no input is given
  
  const thresholdRef = useRef(threshold); //Creates a ref that always holds latest threshold value input
  useEffect(() => {
  thresholdRef.current = threshold;
}, [threshold]);
  
  // 🔹 keep a single Audio element reference
  const alarmRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!alarmRef.current) {
      // ✅ change: reuse a single audio object
      alarmRef.current = new Audio("/Youtuber常用的聲音素材--烏鴉叫.mp3");
      alarmRef.current.loop = true; // keep looping while loud
    }
  }, []);

  // Timer effect - updates every 100ms when not paused
  useEffect(() => {
    const timerInterval = setInterval(() => {
      if (!tooLoud) { // Timer runs when not showing "SHUT UP!"
        const now = Date.now();
        const totalElapsed = now - timerStartRef.current - timerPausedTimeRef.current;
        setElapsedTime(Math.floor(totalElapsed / 1000));
      }
    }, 100);

    return () => clearInterval(timerInterval);
  }, [tooLoud]);

  // Handle timer pause/resume when tooLoud state changes
  useEffect(() => {
    if (tooLoud) {
      // Start pause
      pauseStartRef.current = Date.now();
    } else {
      // End pause
      if (pauseStartRef.current !== null) {
        timerPausedTimeRef.current += Date.now() - pauseStartRef.current;
        pauseStartRef.current = null;
      }
    }
  }, [tooLoud]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    let audioContext: AudioContext;
    let analyser: AnalyserNode;
    let source: MediaStreamAudioSourceNode;

    async function initMic() {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContext = new AudioContext();
      analyser = audioContext.createAnalyser();
      source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.fftSize);

      function checkVolume() {
        analyser.getByteTimeDomainData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          let v = (dataArray[i] - 128) / 128.0;
          sum += v * v;
        }
        let rms = Math.sqrt(sum / dataArray.length);
        let db = 20 * Math.log10(rms);
        setVolume(db);
        setTooLoud(db > thresholdRef.current); // threshold, adjust as needed taking most recent threshold value

        const now = Date.now();
        const delta = now - lastCheckRef.current;
        lastCheckRef.current = now;

        if (db > thresholdRef.current) {
          loudTimeRef.current += delta;
          quietTimeRef.current = 0;
        } else {
          quietTimeRef.current += delta;
        }

        // countdown = 5s - loud time
        const remaining = Math.max(0, 5000 - loudTimeRef.current);
        setCountdown(Math.ceil(remaining / 1000));

        // 🔹 trigger alarm after 5s loud
        if (loudTimeRef.current >= 5000 && !tooLoud) {
          setTooLoud(true);
          if (alarmRef.current && alarmRef.current.paused) {
            alarmRef.current.play();
          }
        }

        // 🔹 stop alarm after 5s quiet
        if (tooLoud && quietTimeRef.current >= 5000) {
          loudTimeRef.current = 0;
          quietTimeRef.current = 0;
          setTooLoud(false);
          setCountdown(0);
          if (alarmRef.current && !alarmRef.current.paused) {
            alarmRef.current.pause(); // ✅ stop sound
            alarmRef.current.currentTime = 0; // reset to start
          }
        }

        requestAnimationFrame(checkVolume);
      }

      checkVolume();
    }

    initMic();
  }, [tooLoud]);

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold">📢 Study Room Noise Detector</h1>
      
      {/* Timer Display */}
      <div className="mt-4 text-3xl font-mono bg-gray-100 px-4 py-2 rounded-lg border">
        <div className="text-sm text-gray-600 text-center mb-1">Study Timer</div>
        <div className="text-center">{formatTime(elapsedTime)}</div>
        {tooLoud && <div className="text-xs text-red-500 text-center">⏸️ PAUSED</div>}
      </div>
      
      <p className="mt-2">Current volume: {volume.toFixed(2)} dB</p>
      
      {!tooLoud && countdown > 0 && volume > thresholdRef.current && (
        <div className="mt-4 text-yellow-600 font-bold text-2xl">
          Quiet down in {countdown}...
        </div>
      )}
      
      {tooLoud && (
        <div className="mt-4 text-red-600 font-bold text-4xl animate-bounce">
          🚨 SHUT UP! 🚨
        </div>
      )}
      <Vol_adjust threshold={threshold} setThreshold={setThreshold} />
    </div>
  );
}
