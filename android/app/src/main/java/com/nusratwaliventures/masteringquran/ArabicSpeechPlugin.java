package com.nusratwaliventures.masteringquran;

import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.Locale;

/** Reads Arabic aloud with the phone's own voice: the Android WebView has no speech synthesis. */
@CapacitorPlugin(name = "ArabicSpeech")
public class ArabicSpeechPlugin extends Plugin {

    private TextToSpeech tts;
    private boolean ready;
    private PluginCall current;
    private int next;

    @PluginMethod
    public synchronized void speak(PluginCall call) {
        finish(null);
        current = call;
        if (tts == null) {
            tts = new TextToSpeech(getContext(), this::onInit);
        } else if (ready) {
            start();
        }
    }

    @PluginMethod
    public synchronized void stop(PluginCall call) {
        if (tts != null && ready) tts.stop();
        finish(null);
        call.resolve();
    }

    private synchronized void onInit(int status) {
        if (status != TextToSpeech.SUCCESS) {
            if (tts != null) tts.shutdown();
            tts = null;
            finish("no-voice");
            return;
        }
        ready = true;
        tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
            @Override
            public void onStart(String id) {}

            @Override
            public void onDone(String id) {
                ended(id, null);
            }

            @Override
            public void onError(String id) {
                ended(id, "failed");
            }

            @Override
            public void onStop(String id, boolean interrupted) {
                ended(id, null);
            }
        });
        start();
    }

    private void start() {
        if (current == null) return;
        int language = tts.setLanguage(new Locale("ar"));
        if (language == TextToSpeech.LANG_MISSING_DATA || language == TextToSpeech.LANG_NOT_SUPPORTED) {
            finish("no-voice");
            return;
        }
        Float rate = current.getFloat("rate", 0.75f);
        tts.setSpeechRate(rate == null ? 0.75f : rate);
        String id = String.valueOf(++next);
        if (tts.speak(current.getString("text", ""), TextToSpeech.QUEUE_FLUSH, new Bundle(), id) != TextToSpeech.SUCCESS) {
            // The speech engine went away: connect again on the next tap.
            tts.shutdown();
            tts = null;
            ready = false;
            finish("failed");
        }
    }

    private synchronized void ended(String id, String error) {
        if (id.equals(String.valueOf(next))) finish(error);
    }

    private synchronized void finish(String error) {
        PluginCall call = current;
        current = null;
        if (call == null) return;
        if (error == null) call.resolve();
        else call.reject("Could not speak", error);
    }

    @Override
    protected synchronized void handleOnDestroy() {
        if (tts != null) tts.shutdown();
        tts = null;
        ready = false;
    }
}
