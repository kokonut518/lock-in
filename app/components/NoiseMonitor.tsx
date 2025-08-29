"use client";

import { useEffect, useState } from "react";

export default function NoiseMonitor() {
  const [volume, setVolume] = useState(0);
  const [tooLoud, setTooLoud] = useState(false);

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
        setTooLoud(db > -20); // threshold, adjust as needed
        requestAnimationFrame(checkVolume);
      }

      checkVolume();
    }

    initMic();
  }, []);

    // 🔊 Play alarm when noise goes above threshold
  useEffect(() => {
    if (tooLoud) {
      const alarm = new Audio("/Youtuber常用的聲音素材--烏鴉叫.mp3"); // file inside /public
      alarm.play().catch(() => {}); // handle autoplay restriction
    }
  }, [tooLoud]); // runs only when `tooLoud` changes


  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold">📢 Study Room Noise Detector</h1>
      <p className="mt-2">Current volume: {volume.toFixed(2)} dB</p>

      {tooLoud && (
        <div className="mt-4 text-red-600 font-bold text-4xl animate-bounce">
          🚨 SHUT UP! 🚨
        </div>
      )}
    </div>
  );
}
