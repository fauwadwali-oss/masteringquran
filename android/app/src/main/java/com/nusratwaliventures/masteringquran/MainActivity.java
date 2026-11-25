package com.nusratwaliventures.masteringquran;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(ShareFilePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
