package com.nusratwaliventures.masteringquran;

import android.content.ActivityNotFoundException;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import androidx.core.content.FileProvider;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;

/** The Android WebView has no share sheet and ignores downloads of generated files, so the app does both. */
@CapacitorPlugin(name = "ShareFile")
public class ShareFilePlugin extends Plugin {

    @PluginMethod
    public void share(PluginCall call) {
        try {
            Intent send = new Intent(Intent.ACTION_SEND);
            String data = call.getString("data");
            if (data != null) {
                Uri uri = cacheFile(call, data);
                send.setType(call.getString("mime", "application/octet-stream"));
                send.putExtra(Intent.EXTRA_STREAM, uri);
                // Also shows the picture in the share sheet, and passes read access on to the chosen app.
                send.setClipData(ClipData.newUri(getContext().getContentResolver(), "Mastering Quran", uri));
                send.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            } else {
                send.setType("text/plain");
            }
            String text = call.getString("text");
            if (text != null) send.putExtra(Intent.EXTRA_TEXT, text);
            String title = call.getString("title");
            if (title != null) send.putExtra(Intent.EXTRA_SUBJECT, title);
            getActivity().startActivity(Intent.createChooser(send, title));
            call.resolve();
        } catch (Exception e) {
            call.reject("Could not share", e);
        }
    }

    /** Saves a picture to the gallery. Resolves saved=false on Android 9 and older, which need a storage permission. */
    @PluginMethod
    public void saveImage(PluginCall call) {
        JSObject result = new JSObject();
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
            call.resolve(result.put("saved", false));
            return;
        }
        ContentResolver resolver = getContext().getContentResolver();
        Uri uri = null;
        try {
            byte[] bytes = Base64.decode(call.getString("data", ""), Base64.DEFAULT);
            ContentValues values = new ContentValues();
            values.put(MediaStore.Images.Media.DISPLAY_NAME, fileName(call));
            values.put(MediaStore.Images.Media.MIME_TYPE, call.getString("mime", "image/png"));
            values.put(MediaStore.Images.Media.RELATIVE_PATH, Environment.DIRECTORY_PICTURES + "/Mastering Quran");
            values.put(MediaStore.Images.Media.IS_PENDING, 1);
            uri = resolver.insert(MediaStore.Images.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY), values);
            if (uri == null) throw new IOException("no gallery entry");
            try (OutputStream out = resolver.openOutputStream(uri)) {
                if (out == null) throw new IOException("no output");
                out.write(bytes);
            }
            ContentValues done = new ContentValues();
            done.put(MediaStore.Images.Media.IS_PENDING, 0);
            resolver.update(uri, done, null, null);
            call.resolve(result.put("saved", true));
        } catch (Exception e) {
            if (uri != null) resolver.delete(uri, null, null);
            call.reject("Could not save", e);
        }
    }

    @PluginMethod
    public void copyImage(PluginCall call) {
        try {
            Uri uri = cacheFile(call, call.getString("data", ""));
            ClipboardManager clipboard = (ClipboardManager) getContext().getSystemService(Context.CLIPBOARD_SERVICE);
            clipboard.setPrimaryClip(ClipData.newUri(getContext().getContentResolver(), "Mastering Quran", uri));
            call.resolve();
        } catch (Exception e) {
            call.reject("Could not copy", e);
        }
    }

    /** Opens a file in the app that handles it (a calendar for .ics), or offers the share sheet. */
    @PluginMethod
    public void open(PluginCall call) {
        try {
            Uri uri = cacheFile(call, call.getString("data", ""));
            Intent view = new Intent(Intent.ACTION_VIEW).setDataAndType(uri, call.getString("mime")).addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            try {
                getActivity().startActivity(view);
                call.resolve();
            } catch (ActivityNotFoundException e) {
                share(call);
            }
        } catch (Exception e) {
            call.reject("Could not open", e);
        }
    }

    private static String fileName(PluginCall call) {
        return call.getString("name", "mastering-quran").replaceAll("[^A-Za-z0-9._-]", "-");
    }

    private Uri cacheFile(PluginCall call, String data) throws IOException {
        File dir = new File(getContext().getCacheDir(), "shared");
        if (!dir.isDirectory() && !dir.mkdirs()) throw new IOException("no cache folder");
        // Each file gets its own folder, so a picture another app still holds is never replaced. Cleared after a day.
        File[] old = dir.listFiles();
        if (old != null) for (File folder : old) {
            if (System.currentTimeMillis() - folder.lastModified() < 86_400_000L) continue;
            File[] files = folder.listFiles();
            if (files != null) for (File f : files) f.delete();
            folder.delete();
        }
        File own = new File(dir, java.util.UUID.randomUUID().toString());
        if (!own.mkdirs()) throw new IOException("no cache folder");
        File file = new File(own, fileName(call));
        try (FileOutputStream out = new FileOutputStream(file)) {
            out.write(Base64.decode(data, Base64.DEFAULT));
        }
        return FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".fileprovider", file);
    }
}
