// src/lib/voice.ts
export function speak(text: string) {
  if (!("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  // u.rate = 1; u.pitch = 1; // tweak if desired
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

type ListenOpts = {
  lang?: string;
  onResult?: (text: string) => void;
  onEnd?: () => void;
  onError?: (err: string) => void;
};

export function listen(opts?: ListenOpts) {
  const Rec: any =
    (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
  if (!Rec) {
    throw new Error("SpeechRecognition not supported. Use Chrome on desktop.");
  }
  const rec = new Rec();
  rec.lang = opts?.lang ?? "en-US";
  rec.interimResults = false;
  rec.maxAlternatives = 1;

  rec.onresult = (e: any) => {
    const text = e.results?.[0]?.[0]?.transcript ?? "";
    opts?.onResult?.(text);
  };
  rec.onerror = (e: any) => opts?.onError?.(e?.error || "unknown");
  rec.onend = () => opts?.onEnd?.();

  rec.start();
  return () => rec.abort();
}
