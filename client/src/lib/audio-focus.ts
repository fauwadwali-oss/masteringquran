// Only one thing should recite at a time. Whoever starts audio claims focus,
// and everyone else pauses.

const EVENT = "mq-audio-focus";

export function claimAudioFocus(owner: string): void {
    window.dispatchEvent(new CustomEvent<string>(EVENT, { detail: owner }));
}

/** Calls `onLost` when anyone other than `owner` starts audio. Returns a cleanup function. */
export function onAudioFocusLost(owner: string, onLost: () => void): () => void {
    const handler = (e: Event) => {
        if ((e as CustomEvent<string>).detail !== owner) onLost();
    };
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
}
