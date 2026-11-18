package io.github.rbtswift.Pad2PS;

import android.content.Context;
import android.hardware.BatteryState;
import android.os.BatteryManager;
import android.os.Build;
import android.view.InputDevice;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "Pad2PSNative")
public class Pad2PSNativePlugin extends Plugin {

    @PluginMethod
    public void getGamepadBattery(PluginCall call) {
        JSArray devices = new JSArray();

        // 1. Leitura nativa de bateria de controles conectados via InputDevice.getBatteryState() (Android 12+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            try {
                int[] ids = InputDevice.getDeviceIds();
                for (int id : ids) {
                    InputDevice dev = InputDevice.getDevice(id);
                    if (dev == null) continue;
                    int sources = dev.getSources();
                    boolean isGamepad = (sources & InputDevice.SOURCE_GAMEPAD) == InputDevice.SOURCE_GAMEPAD
                            || (sources & InputDevice.SOURCE_JOYSTICK) == InputDevice.SOURCE_JOYSTICK;
                    if (!isGamepad) continue;

                    BatteryState state = dev.getBatteryState();
                    if (state != null && state.isPresent()) {
                        float cap = state.getCapacity();
                        if (cap >= 0f && cap <= 1f) {
                            JSObject obj = new JSObject();
                            obj.put("name", dev.getName() != null ? dev.getName() : "Controle Conectado");
                            obj.put("percentage", Math.round(cap * 100f));
                            obj.put("charging", state.getStatus() == BatteryState.STATUS_CHARGING);
                            devices.put(obj);
                        }
                    }
                }
            } catch (Exception ignored) {
            }
        }

        // 2. Fallback: bateria do proprio aparelho Android caso nenhum controle reporte bateria individualmente
        if (devices.length() == 0) {
            try {
                Context ctx = getContext();
                BatteryManager bm = (BatteryManager) ctx.getSystemService(Context.BATTERY_SERVICE);
                if (bm != null) {
                    int pct = bm.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY);
                    if (pct >= 0 && pct <= 100) {
                        JSObject obj = new JSObject();
                        obj.put("name", Build.MODEL != null ? Build.MODEL : "Android");
                        obj.put("percentage", pct);
                        obj.put("charging", bm.isCharging());
                        devices.put(obj);
                    }
                }
            } catch (Exception ignored) {
            }
        }

        JSObject res = new JSObject();
        res.put("devices", devices);
        call.resolve(res);
    }
}
