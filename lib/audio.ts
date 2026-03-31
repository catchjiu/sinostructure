'use client';

// Voices load asynchronously — cache them once the browser fires voiceschanged
let cachedVoices: SpeechSynthesisVoice[] = [];

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      resolve([]);
      return;
    }

    // Voices may already be available (Firefox loads them synchronously)
    const immediate = window.speechSynthesis.getVoices();
    if (immediate.length > 0) {
      cachedVoices = immediate;
      resolve(immediate);
      return;
    }

    // Chrome / Edge fire voiceschanged once they're ready
    const handler = () => {
      cachedVoices = window.speechSynthesis.getVoices();
      resolve(cachedVoices);
      window.speechSynthesis.removeEventListener('voiceschanged', handler);
    };
    window.speechSynthesis.addEventListener('voiceschanged', handler);

    // Fallback: if event never fires (some mobile browsers), resolve empty after 1s
    setTimeout(() => {
      if (cachedVoices.length === 0) resolve([]);
    }, 1000);
  });
}

function pickChineseVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  return (
    voices.find((v) => v.lang === 'zh-TW') ??
    voices.find((v) => v.lang === 'zh-HK') ??
    voices.find((v) => v.lang === 'zh-CN') ??
    voices.find((v) => v.lang.startsWith('zh')) ??
    null
  );
}

export async function speakChinese(text: string, onEnd?: () => void): Promise<void> {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  // Cancel anything currently playing
  window.speechSynthesis.cancel();

  const voices = cachedVoices.length > 0 ? cachedVoices : await loadVoices();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-TW';
  utterance.rate = 0.85;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  const voice = pickChineseVoice(voices);
  if (voice) utterance.voice = voice;

  if (onEnd) utterance.onend = onEnd;

  // Chrome bug: synthesis sometimes silently stops on long pauses.
  // A tiny delay after cancel() prevents the race condition.
  setTimeout(() => {
    window.speechSynthesis.speak(utterance);
  }, 50);
}

export function stopSpeech(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

// Eagerly warm up voice loading as soon as this module is imported client-side
if (typeof window !== 'undefined') {
  loadVoices();
}
