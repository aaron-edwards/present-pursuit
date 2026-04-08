"use client";

import { useEffect } from "react";

type PoemReaderProps = {
  lines: string[];
};

function getPreferredVoice(voices: SpeechSynthesisVoice[]) {
  return (
    voices.find(
      (voice) =>
        voice.name.toLowerCase().includes("karen") &&
        voice.lang.toLowerCase() === "en-au",
    ) ??
    voices.find((voice) => voice.lang.toLowerCase() === "en-au") ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith("en"))
  );
}

function speakLines(lines: string[]) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return false;
  }

  const text = lines.join(" ");
  if (!text.trim()) {
    return false;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 1.05;
  utterance.volume = 1;

  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = getPreferredVoice(voices);

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  window.speechSynthesis.speak(utterance);
  return true;
}

export function PoemReader({ lines }: PoemReaderProps) {
  useEffect(() => {
    const attempt = () => {
      speakLines(lines);
    };

    attempt();
    window.speechSynthesis?.addEventListener("voiceschanged", attempt);

    return () => {
      window.speechSynthesis?.removeEventListener("voiceschanged", attempt);
      window.speechSynthesis?.cancel();
    };
  }, [lines]);

  return (
    <button
      className="button button-secondary poem-reader-button"
      onClick={() => {
        speakLines(lines);
      }}
      type="button"
    >
      Read Aloud
    </button>
  );
}
