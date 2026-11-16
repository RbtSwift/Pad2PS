import {useCallback, useEffect, useRef, useState} from 'react';
import {applyDeadzone, PS2_BUTTON_MAP, type Ps2ButtonMapping} from '../data/ps2Mapping';
import {playButtonClickSound} from '../utils/sound';

export interface StickState {
  x: number;
  y: number;
}

export interface ComboEntry {
  uid: number;
  button: Ps2ButtonMapping;
  timestamp: number;
}

export interface SessionStats {
  totalClicks: number;
  clicksPerSecond: number;
  apm: number;
  peakCps: number;
  peakApm: number;
  pollingRateHz: number;
}

export interface RawPhysicalPressEvent {
  uid: number;
  physicalIndex: number;
}

export interface GamepadHookState {
  isConnected: boolean;
  hasActivatedInput: boolean;
  deviceName: string | null;
  pressedButtons: boolean[];
  l2Value: number;
  r2Value: number;
  leftStick: StickState;
  rightStick: StickState;
  rawLeftStick: StickState;
  rawRightStick: StickState;
  activeButtons: Ps2ButtonMapping[];
  lastPressed: Ps2ButtonMapping | null;
  latestPressEvent: ComboEntry | null;
  lastRawPhysicalPress: RawPhysicalPressEvent | null;
  comboHistory: ComboEntry[];
  sessionStats: SessionStats;
  pressSimulated: (index: number, triggerValue?: number) => void;
  releaseSimulated: (index: number) => void;
  setSimulatedStick: (side: 'left' | 'right', x: number, y: number) => void;
  clearHistory: () => void;
  resetStats: () => void;
  triggerRumble: () => Promise<'ok' | 'unsupported' | 'disconnected'>;
}

const BUTTON_COUNT = 17;
const MAX_HISTORY = 10;
const SPEED_WINDOW_MS = 4000;

export function useGamepad(
  soundEnabled: boolean,
  deadzone = 0.1,
  remapMap: Record<number, number> = {}
): GamepadHookState {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [hasActivatedInput, setHasActivatedInput] = useState<boolean>(false);
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [pressedButtons, setPressedButtons] = useState<boolean[]>(() =>
    Array(BUTTON_COUNT).fill(false)
  );
  const [l2Value, setL2Value] = useState<number>(0);
  const [r2Value, setR2Value] = useState<number>(0);
  const [leftStick, setLeftStick] = useState<StickState>({x: 0, y: 0});
  const [rightStick, setRightStick] = useState<StickState>({x: 0, y: 0});
  const [rawLeftStick, setRawLeftStick] = useState<StickState>({x: 0, y: 0});
  const [rawRightStick, setRawRightStick] = useState<StickState>({x: 0, y: 0});
  const [lastPressed, setLastPressed] = useState<Ps2ButtonMapping | null>(null);
  const [latestPressEvent, setLatestPressEvent] = useState<ComboEntry | null>(null);
  const [lastRawPhysicalPress, setLastRawPhysicalPress] =
    useState<RawPhysicalPressEvent | null>(null);
  const [comboHistory, setComboHistory] = useState<ComboEntry[]>([]);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    totalClicks: 0,
    clicksPerSecond: 0,
    apm: 0,
    peakCps: 0,
    peakApm: 0,
    pollingRateHz: 0,
  });

  const soundEnabledRef = useRef<boolean>(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  const deadzoneRef = useRef<number>(deadzone);
  deadzoneRef.current = deadzone;

  const remapMapRef = useRef<Record<number, number>>(remapMap);
  remapMapRef.current = remapMap;

  const prevPressedRef = useRef<boolean[]>(Array(BUTTON_COUNT).fill(false));
  const prevRawPhysicalRef = useRef<boolean[]>(Array(BUTTON_COUNT).fill(false));
  const simulatedButtonsRef = useRef<boolean[]>(Array(BUTTON_COUNT).fill(false));
  const simulatedTriggersRef = useRef<{l2: number; r2: number}>({l2: 0, r2: 0});
  const simulatedSticksRef = useRef<{left: StickState; right: StickState}>({
    left: {x: 0, y: 0},
    right: {x: 0, y: 0},
  });
  const lastStateSnapshotRef = useRef<string>('');
  const uidCounterRef = useRef<number>(1);
  const rawUidCounterRef = useRef<number>(1);
  const hasActivatedRef = useRef<boolean>(false);
  const isConnectedRef = useRef<boolean>(false);

  // Stats tracking refs
  const totalClicksRef = useRef<number>(0);
  const clickTimestampsRef = useRef<number[]>([]);
  const peakCpsRef = useRef<number>(0);
  const peakApmRef = useRef<number>(0);
  const lastPadTimestampRef = useRef<number>(0);
  const pollDeltasRef = useRef<number[]>([]);
  const pollingRateHzRef = useRef<number>(0);

  const registerClickForStats = useCallback(() => {
    const now = performance.now();
    totalClicksRef.current += 1;
    const cutoff = now - SPEED_WINDOW_MS;
    clickTimestampsRef.current = clickTimestampsRef.current.filter((t) => t >= cutoff);
    clickTimestampsRef.current.push(now);

    const cps = clickTimestampsRef.current.length / (SPEED_WINDOW_MS / 1000);
    const apm = Math.round(cps * 60);
    if (cps > peakCpsRef.current) {
      peakCpsRef.current = cps;
    }
    if (apm > peakApmRef.current) {
      peakApmRef.current = apm;
    }

    setSessionStats({
      totalClicks: totalClicksRef.current,
      clicksPerSecond: Number(cps.toFixed(1)),
      apm,
      peakCps: Number(peakCpsRef.current.toFixed(1)),
      peakApm: peakApmRef.current,
      pollingRateHz: pollingRateHzRef.current,
    });
  }, []);

  const recordButtonPress = useCallback(
    (mapping: Ps2ButtonMapping) => {
      const entry: ComboEntry = {
        uid: uidCounterRef.current++,
        button: mapping,
        timestamp: Date.now(),
      };
      setLastPressed(mapping);
      setLatestPressEvent(entry);
      setComboHistory((prev) => {
        const next: ComboEntry[] = [...prev, entry];
        return next.slice(-MAX_HISTORY);
      });
      registerClickForStats();
      if (soundEnabledRef.current) {
        playButtonClickSound(mapping.id);
      }
    },
    [registerClickForStats]
  );

  const pressSimulated = useCallback(
    (index: number, triggerValue = 1) => {
      if (index < 0 || index >= BUTTON_COUNT) {
        return;
      }
      const wasPressed = prevPressedRef.current[index] || simulatedButtonsRef.current[index];
      simulatedButtonsRef.current[index] = true;
      if (index === 6) {
        simulatedTriggersRef.current.l2 = triggerValue;
      }
      if (index === 7) {
        simulatedTriggersRef.current.r2 = triggerValue;
      }
      if (!wasPressed) {
        const mapping = PS2_BUTTON_MAP[index];
        if (mapping) {
          recordButtonPress(mapping);
        }
      }
    },
    [recordButtonPress]
  );

  const releaseSimulated = useCallback((index: number) => {
    if (index < 0 || index >= BUTTON_COUNT) {
      return;
    }
    simulatedButtonsRef.current[index] = false;
    if (index === 6) {
      simulatedTriggersRef.current.l2 = 0;
    }
    if (index === 7) {
      simulatedTriggersRef.current.r2 = 0;
    }
  }, []);

  const setSimulatedStick = useCallback((side: 'left' | 'right', x: number, y: number) => {
    simulatedSticksRef.current[side] = {
      x: Math.max(-1, Math.min(1, x)),
      y: Math.max(-1, Math.min(1, y)),
    };
  }, []);

  const clearHistory = useCallback(() => {
    setComboHistory([]);
  }, []);

  const resetStats = useCallback(() => {
    totalClicksRef.current = 0;
    clickTimestampsRef.current = [];
    peakCpsRef.current = 0;
    peakApmRef.current = 0;
    pollDeltasRef.current = [];
    pollingRateHzRef.current = 0;
    setSessionStats({
      totalClicks: 0,
      clicksPerSecond: 0,
      apm: 0,
      peakCps: 0,
      peakApm: 0,
      pollingRateHz: 0,
    });
  }, []);

  // Decay live CPS/APM smoothly when idle
  useEffect(() => {
    const interval = window.setInterval(() => {
      const now = performance.now();
      const cutoff = now - SPEED_WINDOW_MS;
      const before = clickTimestampsRef.current.length;
      clickTimestampsRef.current = clickTimestampsRef.current.filter((t) => t >= cutoff);
      if (before > 0 || pollingRateHzRef.current > 0) {
        const cps = clickTimestampsRef.current.length / (SPEED_WINDOW_MS / 1000);
        const apm = Math.round(cps * 60);
        setSessionStats((prev) => {
          if (
            prev.clicksPerSecond === Number(cps.toFixed(1)) &&
            prev.apm === apm &&
            prev.pollingRateHz === pollingRateHzRef.current
          ) {
            return prev;
          }
          return {
            ...prev,
            clicksPerSecond: Number(cps.toFixed(1)),
            apm,
            pollingRateHz: pollingRateHzRef.current,
          };
        });
      }
    }, 350);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.getGamepads) {
      return;
    }

    let rafId: number | null = null;
    let isMounted = true;

    const findActiveGamepad = (): Gamepad | null => {
      const pads = navigator.getGamepads();
      if (!pads) {
        return null;
      }
      for (let i = 0; i < pads.length; i++) {
        const pad = pads[i];
        if (pad && pad.connected) {
          return pad;
        }
      }
      return null;
    };

    const handleConnected = (event: GamepadEvent) => {
      if (!isMounted) {
        return;
      }
      isConnectedRef.current = true;
      setIsConnected(true);
      setDeviceName(event.gamepad.id || 'Controle X-Input');
    };

    const handleDisconnected = () => {
      if (!isMounted) {
        return;
      }
      const remaining = findActiveGamepad();
      if (remaining) {
        isConnectedRef.current = true;
        setIsConnected(true);
        setDeviceName(remaining.id || 'Controle X-Input');
      } else {
        isConnectedRef.current = false;
        setIsConnected(false);
        setDeviceName(null);
        hasActivatedRef.current = false;
        setHasActivatedInput(false);
      }
    };

    window.addEventListener('gamepadconnected', handleConnected);
    window.addEventListener('gamepaddisconnected', handleDisconnected);

    const initialPad = findActiveGamepad();
    if (initialPad) {
      isConnectedRef.current = true;
      setIsConnected(true);
      setDeviceName(initialPad.id || 'Controle X-Input');
    }

    const pollLoop = () => {
      if (!isMounted) {
        return;
      }

      const pad = findActiveGamepad();
      if (pad && !isConnectedRef.current) {
        isConnectedRef.current = true;
        setIsConnected(true);
        setDeviceName(pad.id || 'Controle X-Input');
      }

      const nextPressed = Array<boolean>(BUTTON_COUNT).fill(false);
      let nextL2 = simulatedTriggersRef.current.l2;
      let nextR2 = simulatedTriggersRef.current.r2;
      let lx = simulatedSticksRef.current.left.x;
      let ly = simulatedSticksRef.current.left.y;
      let rx = simulatedSticksRef.current.right.x;
      let ry = simulatedSticksRef.current.right.y;
      let rawAxisLx = 0;
      let rawAxisLy = 0;
      let rawAxisRx = 0;
      let rawAxisRy = 0;

      let physicalActivity = false;

      if (pad) {
        // Estimate polling rate from pad.timestamp updates
        if (pad.timestamp && pad.timestamp > lastPadTimestampRef.current) {
          if (lastPadTimestampRef.current > 0) {
            const delta = pad.timestamp - lastPadTimestampRef.current;
            if (delta > 0.4 && delta < 200) {
              pollDeltasRef.current.push(delta);
              if (pollDeltasRef.current.length > 24) {
                pollDeltasRef.current.shift();
              }
              const avgDelta =
                pollDeltasRef.current.reduce((a, b) => a + b, 0) /
                pollDeltasRef.current.length;
              pollingRateHzRef.current = Math.min(2000, Math.round(1000 / avgDelta));
            }
          }
          lastPadTimestampRef.current = pad.timestamp;
        }

        const currentRemap = remapMapRef.current;

        for (let i = 0; i < BUTTON_COUNT; i++) {
          const btn = pad.buttons[i];
          const physicalDown = Boolean(btn && (btn.pressed || btn.value > 0.12));
          if (physicalDown) {
            physicalActivity = true;
          }

          if (physicalDown && !prevRawPhysicalRef.current[i]) {
            setLastRawPhysicalPress({
              uid: rawUidCounterRef.current++,
              physicalIndex: i,
            });
          }
          prevRawPhysicalRef.current[i] = physicalDown;

          const targetIdx = currentRemap[i] ?? i;
          if (targetIdx >= 0 && targetIdx < BUTTON_COUNT) {
            nextPressed[targetIdx] = nextPressed[targetIdx] || physicalDown;
            if (targetIdx === 6 && btn) {
              nextL2 = Math.max(nextL2, btn.value ?? 0);
            }
            if (targetIdx === 7 && btn) {
              nextR2 = Math.max(nextR2, btn.value ?? 0);
            }
          }
        }

        for (let i = 0; i < BUTTON_COUNT; i++) {
          if (simulatedButtonsRef.current[i]) {
            nextPressed[i] = true;
          }
        }

        const currentDz = deadzoneRef.current;
        rawAxisLx = pad.axes[0] ?? 0;
        rawAxisLy = pad.axes[1] ?? 0;
        rawAxisRx = pad.axes[2] ?? 0;
        rawAxisRy = pad.axes[3] ?? 0;

        const filteredLx = applyDeadzone(rawAxisLx, currentDz);
        const filteredLy = applyDeadzone(rawAxisLy, currentDz);
        const filteredRx = applyDeadzone(rawAxisRx, currentDz);
        const filteredRy = applyDeadzone(rawAxisRy, currentDz);

        if (filteredLx !== 0 || filteredLy !== 0 || filteredRx !== 0 || filteredRy !== 0) {
          physicalActivity = true;
        }

        if (simulatedSticksRef.current.left.x === 0 && simulatedSticksRef.current.left.y === 0) {
          lx = filteredLx;
          ly = filteredLy;
        }
        if (simulatedSticksRef.current.right.x === 0 && simulatedSticksRef.current.right.y === 0) {
          rx = filteredRx;
          ry = filteredRy;
        }
      } else {
        for (let i = 0; i < BUTTON_COUNT; i++) {
          prevRawPhysicalRef.current[i] = false;
          nextPressed[i] = simulatedButtonsRef.current[i];
        }
      }

      if (pad && physicalActivity && !hasActivatedRef.current) {
        hasActivatedRef.current = true;
        setHasActivatedInput(true);
        setIsConnected(true);
        setDeviceName(pad.id || 'Controle X-Input');
      }

      for (let i = 0; i < BUTTON_COUNT; i++) {
        if (nextPressed[i] && !prevPressedRef.current[i]) {
          // Only record physical edges here; mouse clicks already record immediately in pressSimulated
          if (!simulatedButtonsRef.current[i]) {
            const mapping = PS2_BUTTON_MAP[i];
            if (mapping) {
              recordButtonPress(mapping);
            }
          }
        }
        prevPressedRef.current[i] = nextPressed[i];
      }

      const snapshot = `${nextPressed.map((v) => (v ? '1' : '0')).join('')}|${nextL2.toFixed(2)}|${nextR2.toFixed(2)}|${lx.toFixed(2)},${ly.toFixed(2)}|${rx.toFixed(2)},${ry.toFixed(2)}|${rawAxisLx.toFixed(2)},${rawAxisLy.toFixed(2)}|${rawAxisRx.toFixed(2)},${rawAxisRy.toFixed(2)}`;

      if (snapshot !== lastStateSnapshotRef.current) {
        lastStateSnapshotRef.current = snapshot;
        setPressedButtons(nextPressed);
        setL2Value(nextL2);
        setR2Value(nextR2);
        setLeftStick({x: lx, y: ly});
        setRightStick({x: rx, y: ry});
        setRawLeftStick({x: rawAxisLx, y: rawAxisLy});
        setRawRightStick({x: rawAxisRx, y: rawAxisRy});
      }

      rafId = window.requestAnimationFrame(pollLoop);
    };

    rafId = window.requestAnimationFrame(pollLoop);

    return () => {
      isMounted = false;
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener('gamepadconnected', handleConnected);
      window.removeEventListener('gamepaddisconnected', handleDisconnected);
    };
  }, [recordButtonPress]);

  const triggerRumble = useCallback(async (): Promise<'ok' | 'unsupported' | 'disconnected'> => {
    if (typeof window === 'undefined' || !navigator.getGamepads) {
      return 'unsupported';
    }
    const pads = navigator.getGamepads();
    let activePad: Gamepad | null = null;
    if (pads) {
      for (let i = 0; i < pads.length; i++) {
        const p = pads[i];
        if (p && p.connected) {
          activePad = p;
          break;
        }
      }
    }
    if (!activePad) {
      return 'disconnected';
    }
    const actuator = activePad.vibrationActuator as
      | {
          playEffect?: (
            type: string,
            params: {
              startDelay?: number;
              duration?: number;
              weakMagnitude?: number;
              strongMagnitude?: number;
            }
          ) => Promise<string>;
        }
      | undefined;

    if (!actuator || typeof actuator.playEffect !== 'function') {
      return 'unsupported';
    }

    try {
      await actuator.playEffect('dual-rumble', {
        startDelay: 0,
        duration: 400,
        weakMagnitude: 0.75,
        strongMagnitude: 1.0,
      });
      return 'ok';
    } catch {
      return 'unsupported';
    }
  }, []);

  const activeButtons: Ps2ButtonMapping[] = [];
  for (let i = 0; i < BUTTON_COUNT; i++) {
    if (pressedButtons[i] && PS2_BUTTON_MAP[i]) {
      activeButtons.push(PS2_BUTTON_MAP[i]);
    }
  }

  return {
    isConnected,
    hasActivatedInput,
    deviceName,
    pressedButtons,
    l2Value,
    r2Value,
    leftStick,
    rightStick,
    rawLeftStick,
    rawRightStick,
    activeButtons,
    lastPressed,
    latestPressEvent,
    lastRawPhysicalPress,
    comboHistory,
    sessionStats,
    pressSimulated,
    releaseSimulated,
    setSimulatedStick,
    clearHistory,
    resetStats,
    triggerRumble,
  };
}
