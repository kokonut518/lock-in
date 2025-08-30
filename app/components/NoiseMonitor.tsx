"use client";
import { useEffect, useState, useRef } from "react";
import Vol_adjust from "./Vol_adjust" 
import { usePointsSystem } from "./PointsSystem";

export default function NoiseMonitor() {
  const [volume, setVolume] = useState(0);
  const [tooLoud, setTooLoud] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0); // Timer state in seconds
  const [threshold, setThreshold] = useState(-20); 

  const loudTimeRef = useRef(0);
  const quietTimeRef = useRef(0);
  const lastCheckRef = useRef(Date.now());
  const timerStartRef = useRef(Date.now());
  const timerPausedTimeRef = useRef(0);
  const pauseStartRef = useRef<number | null>(null);
  const quietShortRef = useRef(0);
  const graceWindow = 500;

  // keep a ref of latest threshold value
  const thresholdRef = useRef(threshold);
  useEffect(() => {
    thresholdRef.current = threshold;
  }, [threshold]);

  const alarmRef = useRef<HTMLAudioElement | null>(null);

  // points system
  const points = usePointsSystem(tooLoud);

  useEffect(() => {
    if (!alarmRef.current) {
      alarmRef.current = new Audio("/Youtuber常用的聲音素材--烏鴉叫.mp3");
      alarmRef.current.loop = true;
    }
  }, []);

  // Timer effect
  useEffect(() => {
    const timerInterval = setInterval(() => {
      if (!tooLoud) {
        const now = Date.now();
        const totalElapsed = now - timerStartRef.current - timerPausedTimeRef.current;
        setElapsedTime(Math.floor(totalElapsed / 1000));
      }
    }, 100);

    return () => clearInterval(timerInterval);
  }, [tooLoud]);

  useEffect(() => {
    if (tooLoud) {
      pauseStartRef.current = Date.now();
    } else {
      if (pauseStartRef.current !== null) {
        timerPausedTimeRef.current += Date.now() - pauseStartRef.current;
        pauseStartRef.current = null;
      }
    }
  }, [tooLoud]);

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

        const now = Date.now();
        const delta = now - lastCheckRef.current;
        lastCheckRef.current = now;

        // use thresholdRef.current
        if (db > thresholdRef.current) {
          loudTimeRef.current += delta;
          quietTimeRef.current = 0;
          quietShortRef.current = 0;
        } else {
          quietTimeRef.current += delta;
          quietShortRef.current += delta;

          if (quietShortRef.current >= graceWindow) {
            loudTimeRef.current = 0;
            if (countdown !== 0) setCountdown(0);
          }
        }

        // update countdown only when loudTimeRef > 0
        if (loudTimeRef.current > 0) {
          const remaining = Math.max(0, 5000 - loudTimeRef.current);
          const newCountdown = Math.ceil(remaining / 1000);
          if (newCountdown !== countdown) setCountdown(newCountdown);
        }

        if (loudTimeRef.current >= 5000 && !tooLoud) {
          setTooLoud(true);
          if (alarmRef.current && alarmRef.current.paused) alarmRef.current.play();
        }

        if (tooLoud && quietTimeRef.current >= 2000) {
          loudTimeRef.current = 0;
          quietTimeRef.current = 0;
          setTooLoud(false);
          setCountdown(0);
          if (alarmRef.current && !alarmRef.current.paused) {
            alarmRef.current.pause();
            alarmRef.current.currentTime = 0;
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

      <Vol_adjust threshold={threshold} setThreshold={setThreshold} />

      {/* Timer Display */}
      <div className="mt-4 text-3xl font-mono bg-gray-100 px-4 py-2 rounded-lg border">
        <div className="text-sm text-gray-600 text-center mb-1">Study Timer</div>
        <div className="text-center">{formatTime(elapsedTime)}</div>
        {tooLoud && <div className="text-xs text-red-500 text-center">⏸️ PAUSED</div>}
      </div>

      <p className="mt-2">Current volume: {volume.toFixed(2)} dB</p>
      <p className="mt-2 text-lg front-semibold">Points: {points}</p>

      {!tooLoud && countdown > 0 && (
        <div className="mt-4 text-yellow-600 font-bold text-2xl">
          Quiet down in {countdown}...
        </div>
      )}

      {tooLoud && (
        <div className="mt-4 text-red-600 font-bold text-4xl animate-bounce">
          🚨 SHUT UP! 🚨
        </div>
      )}
    </div>
  );
}
