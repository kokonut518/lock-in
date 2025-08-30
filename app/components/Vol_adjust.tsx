"use client";

import { useEffect, useState } from "react";

import React from "react";

interface VolAdjustProps {
  threshold: number;
  setThreshold: (value: number) => void;
}


export default function Vol_adjust({ threshold, setThreshold }: VolAdjustProps) {
 
  return (
    <div className="flex flex-col items-center p-6 space-y-4 bg-white text-white min-h-screen">
      {/* Force visible threshold input box */}
      <div className="w-full max-w-xs bg-white rounded p-4 text-black">
        <label htmlFor="threshold" className="block font-semibold mb-2">
          Set Threshold (dB)
        </label>
        <input
          id="threshold"
          type="number"
          className="w-full px-3 py-2 border border-gray-400 rounded"
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          step="1"
        />
      </div>
    </div>
  );
}
