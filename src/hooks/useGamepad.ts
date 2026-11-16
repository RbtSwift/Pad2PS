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
  comboHistory: ComboEntry[];
  pressSimulated: (index: number, triggerValue?: number) => void;
  releaseSimulated: (index: number) => void;
  setSimulatedStick: (side: 'left' | 'right', x: number, y: number) => void;
  clearHistory: () => void;
}

const BUTTON_COUNT = 16;
const MAX_HISTORY = 10;

export function useGamepad(soundEnabled: boolean, deadzone = 0.1): GamepadHookState {
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
  const [comboHistory, setComboHistory] = useState<ComboEntry[]>([]);

  const soundEnabledRef = useRef<boolean>(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  const deadzoneRef = useRef<number>(deadzone);
  deadzoneRef.current = deadzone;

  const prevPressedRef = useRef<boolean[]>(Array(BUTTON_COUNT).fill(false));
  const simulatedButtonsRef = useRef<boolean[]>(Array(BUTTON_COUNT).fill(false));
  const simulatedTriggersRef = useRef<{l2: number; r2: number}>({l2: 0, r2: 0});
  const simulatedSticksRef = useRef<{left: StickState; right: StickState}>({
    left: {x: 0, y: 0},
    right: {x: 0, y: 0},
  });
  const lastStateSnapshotRef = useRef<string>('');
  const uidCounterRef = useRef<number>(1);
  const hasActivatedRef = useRef<boolean>(false);
  const isConnectedRef = useRef<boolean>(false);

  const recordButtonPress = useCallback((mapping: Ps2ButtonMapping) => {
    setLastPressed(mapping);
    setComboHistory((prev) => {
      const next: ComboEntry[] = [
        ...prev,
        {
          uid: uidCounterRef.current++,
          button: mapping,
          timestamp: Date.now(),
        },
      ];
      return next.slice(-MAX_HISTORY);
    });
    if (soundEnabledRef.current) {
      playButtonClickSound(mapping.id);
    }
  }, []);

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
        for (let i = 0; i < BUTTON_COUNT; i++) {
          const btn = pad.buttons[i];
          const physicalDown = Boolean(btn && (btn.pressed || btn.value > 0.12));
          if (physicalDown) {
            physicalActivity = true;
          }
          nextPressed[i] = physicalDown || simulatedButtonsRef.current[i];

          if (i === 6 && btn) {
            nextL2 = Math.max(btn.value ?? 0, simulatedTriggersRef.current.l2);
          }
          if (i === 7 && btn) {
            nextR2 = Math.max(btn.value ?? 0, simulatedTriggersRef.current.r2);
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
    comboHistory,
    pressSimulated,
    releaseSimulated,
    setSimulatedStick,
    clearHistory,
  };
}
