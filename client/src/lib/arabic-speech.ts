import { registerPlugin } from "@capacitor/core";

/** Android only: the phone's text-to-speech. speak() resolves when it has finished or been stopped. */
export const arabicSpeech = registerPlugin<{
    speak(options: { text: string; rate: number }): Promise<void>;
    stop(): Promise<void>;
}>("ArabicSpeech");
