// The Android app's WebView has no Web Share and ignores downloads of generated files,
// so there these go through the native ShareFile plugin. Everywhere else the browser does it.
import { Capacitor, registerPlugin } from "@capacitor/core";

interface NativeFile {
    name: string;
    mime: string;
    data: string;
}

const ShareFile = registerPlugin<{
    share(options: Partial<NativeFile> & { title?: string; text?: string }): Promise<void>;
    saveImage(options: NativeFile): Promise<{ saved: boolean }>;
    copyImage(options: NativeFile): Promise<void>;
    open(options: NativeFile): Promise<void>;
}>("ShareFile");

export const isIosApp = () => Capacitor.getPlatform() === "ios";
export const isAndroidApp = () => Capacitor.getPlatform() === "android";

async function native(blob: Blob, name: string): Promise<NativeFile> {
    const data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
    });
    return { name, mime: blob.type.split(";")[0] || "application/octet-stream", data };
}

/** "unsupported" when this browser has no share sheet. */
export async function shareImage(blob: Blob, name: string, title: string, text: string): Promise<"shared" | "unsupported"> {
    if (isAndroidApp()) {
        await ShareFile.share({ ...(await native(blob, name)), title, text });
        return "shared";
    }
    if (!navigator.share) return "unsupported";
    const withFile: ShareData = { title, text, files: [new File([blob], name, { type: blob.type })] };
    await navigator.share(navigator.canShare?.(withFile) ? withFile : { title, text });
    return "shared";
}

export async function shareText(title: string, text: string, url: string): Promise<"shared" | "unsupported"> {
    if (isAndroidApp()) {
        await ShareFile.share({ title, text: `${text}\n${url}` });
        return "shared";
    }
    if (!navigator.share) return "unsupported";
    await navigator.share({ title, text, url });
    return "shared";
}

/** Copies a picture. False when this browser cannot. */
export async function copyImage(blob: Blob, name: string): Promise<boolean> {
    if (isAndroidApp()) {
        await ShareFile.copyImage(await native(blob, name));
        return true;
    }
    if (!("ClipboardItem" in window) || !navigator.clipboard?.write) return false;
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    return true;
}

/** Copies text, with a fallback for WebViews that refuse the Clipboard API. Throws when neither works. */
export async function copyText(text: string): Promise<void> {
    try {
        await navigator.clipboard.writeText(text);
    } catch {
        const area = document.createElement("textarea");
        area.value = text;
        area.style.cssText = "position:fixed;opacity:0";
        document.body.appendChild(area);
        area.select();
        const copied = document.execCommand("copy");
        area.remove();
        if (!copied) throw new Error("copy refused");
    }
}

/** Saves a picture. "gallery" means it went to the phone's gallery without any visible sign. */
export async function saveImage(blob: Blob, name: string): Promise<"gallery" | "handed-off"> {
    if (isAndroidApp()) {
        const file = await native(blob, name);
        if ((await ShareFile.saveImage(file)).saved) return "gallery";
        await ShareFile.share(file); // Android 9 and older: save from the share sheet.
        return "handed-off";
    }
    if (isIosApp()) await iosShare(blob, name);
    else browserDownload(blob, name);
    return "handed-off";
}

export async function saveCalendar(blob: Blob, name: string): Promise<void> {
    if (isAndroidApp()) await ShareFile.open(await native(blob, name));
    else browserDownload(blob, name);
}

// The iPhone WebView ignores downloads; its share sheet offers Save Image and Save to Files.
async function iosShare(blob: Blob, name: string) {
    try {
        await navigator.share({ files: [new File([blob], name, { type: blob.type.split(";")[0] })] });
    } catch (e) {
        if ((e as { name?: string })?.name !== "AbortError") throw e;
    }
}

function browserDownload(blob: Blob, name: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
