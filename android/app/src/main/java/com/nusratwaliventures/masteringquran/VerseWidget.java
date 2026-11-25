package com.nusratwaliventures.masteringquran;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.res.Configuration;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Typeface;
import android.net.Uri;
import android.os.Bundle;
import android.text.Layout;
import android.text.StaticLayout;
import android.text.TextDirectionHeuristics;
import android.text.TextPaint;
import android.util.Log;
import android.view.View;
import android.widget.RemoteViews;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.TimeZone;
import org.json.JSONArray;
import org.json.JSONObject;

/** Verse of the day on the home screen. Bundled text, so it works offline. */
public class VerseWidget extends AppWidgetProvider {

    private static final String TAG = "VerseWidget";
    private static Typeface amiri;

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] ids) {
        for (int id : ids) update(context, manager, id);
    }

    @Override
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager manager, int id, Bundle options) {
        update(context, manager, id);
    }

    private static void update(Context context, AppWidgetManager manager, int id) {
        try {
            JSONObject verse = verseOfTheDay(context);
            int surah = verse.getInt("s");
            int ayah = verse.getInt("a");
            String english = verse.getString("en");

            Bundle options = manager.getAppWidgetOptions(id);
            // Portrait uses the narrow, tall pair of sizes the launcher reports; landscape the other pair.
            boolean portrait = context.getResources().getConfiguration().orientation != Configuration.ORIENTATION_LANDSCAPE;
            int widthDp = Math.max(140, options.getInt(portrait ? AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH : AppWidgetManager.OPTION_APPWIDGET_MAX_WIDTH, 250)) - 32;
            int heightDp = Math.max(80, options.getInt(portrait ? AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT : AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT, 110)) - 32;
            boolean tall = heightDp >= 130;
            boolean showEnglish = heightDp >= 80;
            float englishSp = english.length() > 110 ? 12 : 14;
            // Reference line and button take what is left after the two texts.
            int textDp = heightDp - 22 - (tall ? 46 : 0);
            int englishLines = (int) Math.ceil(english.length() * englishSp * 0.52 / widthDp) + 1;
            int englishDp = showEnglish ? (int) (englishLines * englishSp * 1.35) : 0;
            // On a small widget the Arabic comes first: show it whole, without the translation.
            if (showEnglish && textDp - englishDp < Math.max(44, verse.getString("ar").length() * 0.45)) {
                showEnglish = false;
                englishDp = 0;
            }
            int arabicDp = Math.max(30, textDp - englishDp);

            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.verse_widget);
            views.setTextViewText(R.id.verse_reference, verse.getString("name") + " " + surah + ":" + ayah);
            views.setTextViewText(R.id.verse_english, english);
            views.setTextViewTextSize(R.id.verse_english, android.util.TypedValue.COMPLEX_UNIT_SP, englishSp);
            views.setViewVisibility(R.id.verse_english, showEnglish ? View.VISIBLE : View.GONE);
            views.setViewVisibility(R.id.verse_continue, tall ? View.VISIBLE : View.GONE);
            views.setImageViewBitmap(R.id.verse_arabic, arabic(context, verse.getString("ar"), widthDp, arabicDp));
            views.setContentDescription(R.id.verse_arabic, verse.getString("ar"));
            views.setOnClickPendingIntent(R.id.verse_root, open(context, 1, "quran/" + surah + "/" + ayah));
            views.setOnClickPendingIntent(R.id.verse_continue, open(context, 2, "continue"));
            manager.updateAppWidget(id, views);
        } catch (Exception e) {
            Log.w(TAG, "Could not update the widget", e);
        }
    }

    private static PendingIntent open(Context context, int code, String path) {
        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse("masteringquran://open/" + path), context, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        return PendingIntent.getActivity(context, code, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    private static JSONObject verseOfTheDay(Context context) throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (InputStream in = context.getAssets().open("widget/verses.json")) {
            byte[] buffer = new byte[8192];
            for (int n; (n = in.read(buffer)) > 0; ) out.write(buffer, 0, n);
        }
        JSONArray all = new JSONArray(new String(out.toByteArray(), StandardCharsets.UTF_8));
        long now = System.currentTimeMillis();
        long day = (now + TimeZone.getDefault().getOffset(now)) / 86_400_000L;
        return all.getJSONObject((int) (day % all.length()));
    }

    // Widgets cannot use a bundled font, so the Arabic is drawn with Amiri as a picture.
    private static Bitmap arabic(Context context, String text, int widthDp, int heightDp) {
        // Widgets share a small memory budget, so draw at no more than 2x.
        float density = Math.min(2f, context.getResources().getDisplayMetrics().density);
        // Keep every update under about 1 MB, whatever size the widget is stretched to.
        double area = (double) widthDp * heightDp * density * density;
        if (area > 250_000) density *= (float) Math.sqrt(250_000 / area);
        int width = Math.max(1, Math.round(widthDp * density));
        int height = Math.max(1, Math.round(heightDp * density));
        TextPaint paint = new TextPaint(TextPaint.ANTI_ALIAS_FLAG);
        paint.setColor(Color.WHITE);
        if (amiri == null) amiri = Typeface.createFromAsset(context.getAssets(), "widget/Amiri-Regular.ttf");
        paint.setTypeface(amiri);
        StaticLayout layout = null;
        for (float dp = 34; dp >= 9; dp -= 1) {
            paint.setTextSize(dp * density);
            layout = StaticLayout.Builder.obtain(text, 0, text.length(), paint, width)
                .setAlignment(Layout.Alignment.ALIGN_NORMAL)
                .setTextDirection(TextDirectionHeuristics.RTL)
                .setIncludePad(true)
                .build();
            if (layout.getHeight() <= height) break;
        }
        Bitmap bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(bitmap);
        float fit = Math.min(1f, height / (float) layout.getHeight());
        canvas.translate(width * (1 - fit) / 2f, Math.max(0, (height - layout.getHeight() * fit) / 2f));
        canvas.scale(fit, fit);
        layout.draw(canvas);
        return bitmap;
    }
}
