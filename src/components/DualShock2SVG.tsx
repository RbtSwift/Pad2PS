import type {ConsoleLayout} from '../data/ps2Mapping';
import type {StickState} from '../hooks/useGamepad';

interface DualShock2SVGProps {
  layout: ConsoleLayout;
  pressedButtons: boolean[];
  l2Value: number;
  r2Value: number;
  leftStick: StickState;
  rightStick: StickState;
  isCompact?: boolean;
  onButtonDown: (index: number) => void;
  onButtonUp: (index: number) => void;
}

const ACTIVE_FILL = 'var(--accent-color)';
const ACTIVE_STROKE = '#FFFFFF';
const IDLE_BTN_FILL = '#1A1A22';
const IDLE_BTN_STROKE = 'rgba(var(--accent-rgb), 0.45)';
const BODY_STROKE = 'rgba(var(--accent-rgb), 0.58)';

export function DualShock2SVG({
  layout,
  pressedButtons,
  l2Value,
  r2Value,
  leftStick,
  rightStick,
  isCompact = false,
  onButtonDown,
  onButtonUp,
}: DualShock2SVGProps) {
  const isPressed = (idx: number) => Boolean(pressedButtons[idx]);

  const bindBtn = (index: number, label: string) => ({
    role: 'button' as const,
    tabIndex: 0,
    'aria-label': label,
    className: `cursor-pointer outline-none svg-btn-interactive ${
      isPressed(index) ? 'svg-btn-pressed' : 'hover:brightness-125'
    }`,
    onPointerDown: (e: React.PointerEvent<SVGGElement>) => {
      e.preventDefault();
      onButtonDown(index);
    },
    onPointerUp: () => onButtonUp(index),
    onPointerLeave: () => {
      if (isPressed(index)) {
        onButtonUp(index);
      }
    },
    onPointerCancel: () => onButtonUp(index),
    onKeyDown: (e: React.KeyboardEvent<SVGGElement>) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        onButtonDown(index);
      }
    },
    onKeyUp: (e: React.KeyboardEvent<SVGGElement>) => {
      if (e.key === ' ' || e.key === 'Enter') {
        onButtonUp(index);
      }
    },
  });

  const l2Pct = Math.max(0, Math.min(1, l2Value || (isPressed(6) ? 1 : 0)));
  const r2Pct = Math.max(0, Math.min(1, r2Value || (isPressed(7) ? 1 : 0)));
  const sizeClass = isCompact ? 'max-h-[74vh]' : 'max-h-[52vh]';

  // ==================== PSP HANDHELD LAYOUT ====================
  if (layout === 'psp') {
    const pspStickTravel = 11;
    const pspNubX = 116 + leftStick.x * pspStickTravel;
    const pspNubY = 250 + leftStick.y * pspStickTravel;

    return (
      <svg
        viewBox="0 0 740 340"
        className={`w-full h-auto ${sizeClass} select-none drop-shadow-[0_18px_40px_rgba(0,0,0,0.75)]`}
        role="img"
        aria-label="PlayStation Portable (PSP) interativo"
      >
        <defs>
          <linearGradient id="psp-shell" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1D1D25" />
            <stop offset="50%" stopColor="#121217" />
            <stop offset="100%" stopColor="#0B0B0F" />
          </linearGradient>
          <linearGradient id="psp-screen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0C0D14" />
            <stop offset="60%" stopColor="#12121A" />
            <stop offset="100%" stopColor="#09090D" />
          </linearGradient>
        </defs>

        {/* Left & Right Transparent-Style Triggers (L & R only) */}
        <g {...bindBtn(4, 'Gatilho L (LB)')}>
          <path
            d="M 52 74 C 54 50, 82 40, 152 40 L 176 40 L 176 64 L 52 74 Z"
            fill={isPressed(4) ? ACTIVE_FILL : IDLE_BTN_FILL}
            stroke={isPressed(4) ? ACTIVE_STROKE : IDLE_BTN_STROKE}
            strokeWidth="1.6"
          />
          <text
            x="118"
            y="57"
            textAnchor="middle"
            className="font-mono text-[13px] font-bold"
            fill={isPressed(4) ? '#FFFFFF' : '#E4E4E7'}
          >
            L
          </text>
        </g>

        <g {...bindBtn(5, 'Gatilho R (RB)')}>
          <path
            d="M 688 74 C 686 50, 658 40, 588 40 L 564 40 L 564 64 L 688 74 Z"
            fill={isPressed(5) ? ACTIVE_FILL : IDLE_BTN_FILL}
            stroke={isPressed(5) ? ACTIVE_STROKE : IDLE_BTN_STROKE}
            strokeWidth="1.6"
          />
          <text
            x="622"
            y="57"
            textAnchor="middle"
            className="font-mono text-[13px] font-bold"
            fill={isPressed(5) ? '#FFFFFF' : '#E4E4E7'}
          >
            R
          </text>
        </g>

        {/* PSP Elongated Body */}
        <path
          d="
            M 140 60
            L 600 60
            C 666 60, 712 108, 712 174
            C 712 240, 666 290, 600 290
            L 556 290
            C 542 290, 536 298, 520 298
            L 220 298
            C 204 298, 198 290, 184 290
            L 140 290
            C 74 290, 28 240, 28 174
            C 28 108, 74 60, 140 60
            Z
          "
          fill="url(#psp-shell)"
          stroke={BODY_STROKE}
          strokeWidth="2"
        />

        {/* Inner Decorative Trim Line */}
        <rect
          x="188"
          y="72"
          width="364"
          height="216"
          rx="12"
          fill="#09090D"
          stroke="rgba(var(--accent-rgb), 0.35)"
          strokeWidth="1.4"
        />

        {/* Widescreen LCD */}
        <rect
          x="202"
          y="82"
          width="336"
          height="174"
          rx="6"
          fill="url(#psp-screen)"
          stroke="var(--accent-color)"
          strokeWidth="1.6"
          opacity="0.92"
        />
        <line
          x1="214"
          y1="94"
          x2="262"
          y2="94"
          stroke="rgba(var(--accent-rgb), 0.3)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <text
          x="370"
          y="164"
          textAnchor="middle"
          className="font-display text-[22px] font-bold tracking-[0.28em]"
          fill="rgba(var(--accent-rgb), 0.25)"
        >
          PSP
        </text>
        <text
          x="370"
          y="186"
          textAnchor="middle"
          className="font-mono text-[10px] tracking-widest"
          fill="#71717A"
        >
          PLAYSTATION PORTABLE
        </text>

        {/* Bottom Chin Buttons (PS / SELECT / START) */}
        <g {...bindBtn(16, 'Botão PS / Home')}>
          <rect
            x="222"
            y="265"
            width="42"
            height="16"
            rx="8"
            fill={isPressed(16) ? ACTIVE_FILL : IDLE_BTN_FILL}
            stroke={isPressed(16) ? ACTIVE_STROKE : IDLE_BTN_STROKE}
            strokeWidth="1.2"
          />
          <text
            x="243"
            y="276.5"
            textAnchor="middle"
            className="font-mono text-[8.5px] font-bold"
            fill={isPressed(16) ? '#FFFFFF' : '#E4E4E7'}
          >
            PS
          </text>
        </g>

        <g {...bindBtn(8, 'Botão SELECT (View/Back)')}>
          <rect
            x="408"
            y="265"
            width="52"
            height="16"
            rx="8"
            fill={isPressed(8) ? ACTIVE_FILL : IDLE_BTN_FILL}
            stroke={isPressed(8) ? ACTIVE_STROKE : IDLE_BTN_STROKE}
            strokeWidth="1.2"
          />
          <text
            x="434"
            y="276"
            textAnchor="middle"
            className="font-mono text-[8px] font-bold tracking-wider"
            fill={isPressed(8) ? '#FFFFFF' : '#E4E4E7'}
          >
            SELECT
          </text>
        </g>

        <g {...bindBtn(9, 'Botão START (Menu/Start)')}>
          <rect
            x="468"
            y="265"
            width="52"
            height="16"
            rx="8"
            fill={isPressed(9) ? ACTIVE_FILL : IDLE_BTN_FILL}
            stroke={isPressed(9) ? ACTIVE_STROKE : IDLE_BTN_STROKE}
            strokeWidth="1.2"
          />
          <text
            x="494"
            y="276"
            textAnchor="middle"
            className="font-mono text-[8px] font-bold tracking-wider"
            fill={isPressed(9) ? '#FFFFFF' : '#E4E4E7'}
          >
            START
          </text>
        </g>

        {/* Left Side: D-Pad */}
        <circle
          cx="116"
          cy="152"
          r="52"
          fill="#0D0D12"
          stroke="rgba(var(--accent-rgb), 0.22)"
          strokeWidth="1.2"
        />
        <g {...bindBtn(12, 'D-Pad Cima')}>
          <path
            d="M 104 108 L 128 108 L 128 131 L 116 143 L 104 131 Z"
            fill={isPressed(12) ? ACTIVE_FILL : IDLE_BTN_FILL}
            stroke={isPressed(12) ? ACTIVE_STROKE : IDLE_BTN_STROKE}
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path d="M 116 115 L 121 124 L 111 124 Z" fill={isPressed(12) ? '#FFFFFF' : '#A1A1AA'} />
        </g>
        <g {...bindBtn(13, 'D-Pad Baixo')}>
          <path
            d="M 104 196 L 128 196 L 128 173 L 116 161 L 104 173 Z"
            fill={isPressed(13) ? ACTIVE_FILL : IDLE_BTN_FILL}
            stroke={isPressed(13) ? ACTIVE_STROKE : IDLE_BTN_STROKE}
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path d="M 116 189 L 121 180 L 111 180 Z" fill={isPressed(13) ? '#FFFFFF' : '#A1A1AA'} />
        </g>
        <g {...bindBtn(14, 'D-Pad Esquerda')}>
          <path
            d="M 72 140 L 72 164 L 95 164 L 107 152 L 95 140 Z"
            fill={isPressed(14) ? ACTIVE_FILL : IDLE_BTN_FILL}
            stroke={isPressed(14) ? ACTIVE_STROKE : IDLE_BTN_STROKE}
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path d="M 79 152 L 88 147 L 88 157 Z" fill={isPressed(14) ? '#FFFFFF' : '#A1A1AA'} />
        </g>
        <g {...bindBtn(15, 'D-Pad Direita')}>
          <path
            d="M 160 140 L 160 164 L 137 164 L 125 152 L 137 140 Z"
            fill={isPressed(15) ? ACTIVE_FILL : IDLE_BTN_FILL}
            stroke={isPressed(15) ? ACTIVE_STROKE : IDLE_BTN_STROKE}
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path d="M 153 152 L 144 147 L 144 157 Z" fill={isPressed(15) ? '#FFFFFF' : '#A1A1AA'} />
        </g>

        {/* PSP Single Analog Stick below D-Pad */}
        <g>
          <circle
            cx="116"
            cy="250"
            r="26"
            fill="#09090D"
            stroke={isPressed(10) ? ACTIVE_FILL : 'rgba(var(--accent-rgb), 0.35)'}
            strokeWidth="1.4"
          />
          <g {...bindBtn(10, 'Analógico PSP')}>
            <circle
              cx={pspNubX}
              cy={pspNubY}
              r="15"
              fill={isPressed(10) ? ACTIVE_FILL : '#1E1E28'}
              stroke={isPressed(10) ? '#FFFFFF' : 'rgba(var(--accent-rgb), 0.65)'}
              strokeWidth="1.6"
            />
            <circle
              cx={pspNubX}
              cy={pspNubY}
              r="9"
              fill="none"
              stroke="rgba(255,255,255,0.16)"
              strokeDasharray="2 2"
            />
          </g>
        </g>

        {/* Right Side: Action Face Buttons */}
        <circle
          cx="624"
          cy="170"
          r="56"
          fill="#0D0D12"
          stroke="rgba(var(--accent-rgb), 0.22)"
          strokeWidth="1.2"
        />
        {/* Triangle */}
        <g {...bindBtn(3, 'Botão Triângulo (Y)')}>
          <circle
            cx="624"
            cy="132"
            r="17"
            fill={isPressed(3) ? ACTIVE_FILL : IDLE_BTN_FILL}
            stroke={isPressed(3) ? ACTIVE_STROKE : IDLE_BTN_STROKE}
            strokeWidth="1.5"
          />
          <path
            d="M 624 123.5 L 632 138 L 616 138 Z"
            fill="none"
            stroke={isPressed(3) ? '#FFFFFF' : '#34D399'}
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
        </g>
        {/* Circle */}
        <g {...bindBtn(1, 'Botão Bolinha (B)')}>
          <circle
            cx="662"
            cy="170"
            r="17"
            fill={isPressed(1) ? ACTIVE_FILL : IDLE_BTN_FILL}
            stroke={isPressed(1) ? ACTIVE_STROKE : IDLE_BTN_STROKE}
            strokeWidth="1.5"
          />
          <circle
            cx="662"
            cy="170"
            r="7.5"
            fill="none"
            stroke={isPressed(1) ? '#FFFFFF' : '#FB7185'}
            strokeWidth="2.2"
          />
        </g>
        {/* Cross */}
        <g {...bindBtn(0, 'Botão X / Cruz (A)')}>
          <circle
            cx="624"
            cy="208"
            r="17"
            fill={isPressed(0) ? ACTIVE_FILL : IDLE_BTN_FILL}
            stroke={isPressed(0) ? ACTIVE_STROKE : IDLE_BTN_STROKE}
            strokeWidth="1.5"
          />
          <path
            d="M 618 202 L 630 214 M 630 202 L 618 214"
            fill="none"
            stroke={isPressed(0) ? '#FFFFFF' : '#60A5FA'}
            strokeWidth="2.3"
            strokeLinecap="round"
          />
        </g>
        {/* Square */}
        <g {...bindBtn(2, 'Botão Quadrado (X)')}>
          <circle
            cx="586"
            cy="170"
            r="17"
            fill={isPressed(2) ? ACTIVE_FILL : IDLE_BTN_FILL}
            stroke={isPressed(2) ? ACTIVE_STROKE : IDLE_BTN_STROKE}
            strokeWidth="1.5"
          />
          <rect
            x="579.5"
            y="163.5"
            width="13"
            height="13"
            rx="1.5"
            fill="none"
            stroke={isPressed(2) ? '#FFFFFF' : '#F472B6'}
            strokeWidth="2.2"
          />
        </g>
      </svg>
    );
  }

  // ==================== PS1 / PS2 / PS3 CONTROLLERS ====================
  const showAnalogSticks = layout !== 'ps1';
  const isPs3 = layout === 'ps3';
  const stickTravel = 18;
  const leftCapX = 246 + leftStick.x * stickTravel;
  const leftCapY = 290 + leftStick.y * stickTravel;
  const rightCapX = 434 + rightStick.x * stickTravel;
  const rightCapY = 290 + rightStick.y * stickTravel;

  return (
    <svg
      viewBox="0 0 680 430"
      className={`w-full h-auto ${sizeClass} select-none drop-shadow-[0_18px_40px_rgba(0,0,0,0.75)]`}
      role="img"
      aria-label={`Controle ${layout.toUpperCase()} interativo`}
    >
      <defs>
        <linearGradient id="ds2-shell" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1B1B22" />
          <stop offset="55%" stopColor="#121217" />
          <stop offset="100%" stopColor="#0C0C10" />
        </linearGradient>

        <radialGradient id="ds2-well" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#08080B" />
          <stop offset="100%" stopColor="#15151C" />
        </radialGradient>

        <radialGradient id="ds2-cap" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#2A2A35" />
          <stop offset="100%" stopColor="#121218" />
        </radialGradient>

        <filter id="neon-accent-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <clipPath id="l2-clip">
          {isPs3 ? (
            <path d="M 88 22 C 88 12, 192 10, 192 22 L 188 48 C 188 52, 92 52, 92 48 Z" />
          ) : (
            <rect x="92" y="20" width="96" height="28" rx="8" />
          )}
        </clipPath>
        <clipPath id="r2-clip">
          {isPs3 ? (
            <path d="M 488 22 C 488 10, 592 12, 592 22 L 588 48 C 588 52, 492 52, 492 48 Z" />
          ) : (
            <rect x="492" y="20" width="96" height="28" rx="8" />
          )}
        </clipPath>
      </defs>

      {/* ==================== SHOULDER INDICATORS (ABOVE BODY) ==================== */}
      {/* L2 Analog Trigger (Curved on PS3, Rectangular on PS1/PS2) */}
      <g {...bindBtn(6, 'Gatilho L2 (LT)')}>
        {isPs3 ? (
          <path
            d="M 88 22 C 88 12, 192 10, 192 22 L 188 48 C 188 52, 92 52, 92 48 Z"
            fill="#101015"
            stroke={
              isPressed(6) || l2Pct > 0.05
                ? 'var(--accent-color)'
                : 'rgba(var(--accent-rgb), 0.35)'
            }
            strokeWidth="1.6"
          />
        ) : (
          <rect
            x="92"
            y="20"
            width="96"
            height="28"
            rx="8"
            fill="#101015"
            stroke={
              isPressed(6) || l2Pct > 0.05
                ? 'var(--accent-color)'
                : 'rgba(var(--accent-rgb), 0.35)'
            }
            strokeWidth="1.6"
          />
        )}
        <g clipPath="url(#l2-clip)">
          <rect
            x="88"
            y="10"
            width={104 * l2Pct}
            height="44"
            fill="var(--accent-color)"
            opacity={0.85}
          />
        </g>
        <text
          x="124"
          y="38.5"
          textAnchor="middle"
          className="font-mono text-[12px] font-bold"
          fill={l2Pct > 0.45 ? '#FFFFFF' : 'var(--accent-color)'}
        >
          L2
        </text>
        <text
          x="164"
          y="38"
          textAnchor="middle"
          className="font-mono text-[10px]"
          fill={l2Pct > 0.75 ? '#FFFFFF' : '#A1A1AA'}
        >
          {Math.round(l2Pct * 100)}%
        </text>
      </g>

      {/* L1 Shoulder */}
      <g {...bindBtn(4, 'Botão L1 (LB)')}>
        <rect
          x="98"
          y="58"
          width="84"
          height="24"
          rx="7"
          fill={isPressed(4) ? ACTIVE_FILL : IDLE_BTN_FILL}
          stroke={isPressed(4) ? ACTIVE_STROKE : IDLE_BTN_STROKE}
          strokeWidth="1.5"
        />
        <text
          x="140"
          y="74"
          textAnchor="middle"
          className="font-mono text-[12px] font-bold"
          fill={isPressed(4) ? '#FFFFFF' : '#E4E4E7'}
        >
          L1
        </text>
      </g>

      {/* R2 Analog Trigger */}
      <g {...bindBtn(7, 'Gatilho R2 (RT)')}>
        {isPs3 ? (
          <path
            d="M 488 22 C 488 10, 592 12, 592 22 L 588 48 C 588 52, 492 52, 492 48 Z"
            fill="#101015"
            stroke={
              isPressed(7) || r2Pct > 0.05
                ? 'var(--accent-color)'
                : 'rgba(var(--accent-rgb), 0.35)'
            }
            strokeWidth="1.6"
          />
        ) : (
          <rect
            x="492"
            y="20"
            width="96"
            height="28"
            rx="8"
            fill="#101015"
            stroke={
              isPressed(7) || r2Pct > 0.05
                ? 'var(--accent-color)'
                : 'rgba(var(--accent-rgb), 0.35)'
            }
            strokeWidth="1.6"
          />
        )}
        <g clipPath="url(#r2-clip)">
          <rect
            x={488 + 104 * (1 - r2Pct)}
            y="10"
            width={104 * r2Pct}
            height="44"
            fill="var(--accent-color)"
            opacity={0.85}
          />
        </g>
        <text
          x="556"
          y="38.5"
          textAnchor="middle"
          className="font-mono text-[12px] font-bold"
          fill={r2Pct > 0.45 ? '#FFFFFF' : 'var(--accent-color)'}
        >
          R2
        </text>
        <text
          x="516"
          y="38"
          textAnchor="middle"
          className="font-mono text-[10px]"
          fill={r2Pct > 0.75 ? '#FFFFFF' : '#A1A1AA'}
        >
          {Math.round(r2Pct * 100)}%
        </text>
      </g>

      {/* R1 Shoulder */}
      <g {...bindBtn(5, 'Botão R1 (RB)')}>
        <rect
          x="498"
          y="58"
          width="84"
          height="24"
          rx="7"
          fill={isPressed(5) ? ACTIVE_FILL : IDLE_BTN_FILL}
          stroke={isPressed(5) ? ACTIVE_STROKE : IDLE_BTN_STROKE}
          strokeWidth="1.5"
        />
        <text
          x="540"
          y="74"
          textAnchor="middle"
          className="font-mono text-[12px] font-bold"
          fill={isPressed(5) ? '#FFFFFF' : '#E4E4E7'}
        >
          R1
        </text>
      </g>

      {/* Subtle Shoulder Connection Lines */}
      <line x1="140" y1="82" x2="140" y2="96" stroke="rgba(var(--accent-rgb), 0.35)" strokeWidth="1.5" />
      <line x1="540" y1="82" x2="540" y2="96" stroke="rgba(var(--accent-rgb), 0.35)" strokeWidth="1.5" />

      {/* ==================== CONTROLLER CHASSIS ==================== */}
      {/* Top Cable Neck (omitted on wireless PS3) */}
      {!isPs3 && (
        <path
          d="M 322 104 L 322 90 C 322 86, 358 86, 358 90 L 358 104"
          fill="#111116"
          stroke="rgba(var(--accent-rgb), 0.35)"
          strokeWidth="1.4"
        />
      )}

      {/* Main Symmetrical Silhouette (PS1 removes the bottom analog bridge bulge) */}
      {layout === 'ps1' ? (
        <path
          d="
            M 164 96
            C 112 96, 72 132, 62 184
            L 40 318
            C 32 366, 62 404, 102 404
            C 138 404, 162 372, 184 328
            C 198 300, 214 274, 246 274
            L 434 274
            C 466 274, 482 300, 496 328
            C 518 372, 542 404, 578 404
            C 618 404, 648 366, 640 318
            L 618 184
            C 608 132, 568 96, 516 96
            C 478 96, 456 112, 434 114
            L 246 114
            C 224 112, 202 96, 164 96
            Z
          "
          fill="url(#ds2-shell)"
          stroke={BODY_STROKE}
          strokeWidth="2"
        />
      ) : (
        <path
          d="
            M 164 96
            C 112 96, 72 132, 62 184
            L 40 318
            C 32 366, 62 404, 102 404
            C 138 404, 162 372, 184 328
            C 198 300, 210 296, 224 316
            C 238 336, 266 346, 290 330
            C 306 318, 314 304, 340 304
            C 366 304, 374 318, 390 330
            C 414 346, 442 336, 456 316
            C 470 296, 482 300, 496 328
            C 518 372, 542 404, 578 404
            C 618 404, 648 366, 640 318
            L 618 184
            C 608 132, 568 96, 516 96
            C 478 96, 456 112, 434 114
            L 246 114
            C 224 112, 202 96, 164 96
            Z
          "
          fill="url(#ds2-shell)"
          stroke={BODY_STROKE}
          strokeWidth="2"
        />
      )}

      {/* Subtle Inner Contour Rings (Left D-pad & Right Face Wells) */}
      <circle
        cx="162"
        cy="202"
        r="64"
        fill="#0D0D12"
        stroke="rgba(var(--accent-rgb), 0.22)"
        strokeWidth="1.4"
      />
      <circle
        cx="518"
        cy="202"
        r="64"
        fill="#0D0D12"
        stroke="rgba(var(--accent-rgb), 0.22)"
        strokeWidth="1.4"
      />

      {/* Center Console Panel */}
      <rect
        x="248"
        y="138"
        width="184"
        height="104"
        rx="14"
        fill="#0E0E13"
        stroke="rgba(var(--accent-rgb), 0.16)"
        strokeWidth="1.2"
      />

      {/* ==================== D-PAD (LEFT) ==================== */}
      <circle
        cx="162"
        cy="202"
        r="14"
        fill="#14141B"
        stroke="rgba(var(--accent-rgb), 0.2)"
        strokeWidth="1"
      />

      {/* D-Pad UP (Index 12) */}
      <g {...bindBtn(12, 'D-Pad Cima')}>
        <path
          d="M 148 150 L 176 150 L 176 177 L 162 191 L 148 177 Z"
          fill={isPressed(12) ? ACTIVE_FILL : IDLE_BTN_FILL}
          stroke={isPressed(12) ? ACTIVE_STROKE : IDLE_BTN_STROKE}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M 162 158 L 168 168 L 156 168 Z" fill={isPressed(12) ? '#FFFFFF' : '#A1A1AA'} />
      </g>

      {/* D-Pad DOWN (Index 13) */}
      <g {...bindBtn(13, 'D-Pad Baixo')}>
        <path
          d="M 148 254 L 176 254 L 176 227 L 162 213 L 148 227 Z"
          fill={isPressed(13) ? ACTIVE_FILL : IDLE_BTN_FILL}
          stroke={isPressed(13) ? ACTIVE_STROKE : IDLE_BTN_STROKE}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M 162 246 L 168 236 L 156 236 Z" fill={isPressed(13) ? '#FFFFFF' : '#A1A1AA'} />
      </g>

      {/* D-Pad LEFT (Index 14) */}
      <g {...bindBtn(14, 'D-Pad Esquerda')}>
        <path
          d="M 110 188 L 110 216 L 137 216 L 151 202 L 137 188 Z"
          fill={isPressed(14) ? ACTIVE_FILL : IDLE_BTN_FILL}
          stroke={isPressed(14) ? ACTIVE_STROKE : IDLE_BTN_STROKE}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M 118 202 L 128 196 L 128 208 Z" fill={isPressed(14) ? '#FFFFFF' : '#A1A1AA'} />
      </g>

      {/* D-Pad RIGHT (Index 15) */}
      <g {...bindBtn(15, 'D-Pad Direita')}>
        <path
          d="M 214 188 L 214 216 L 187 216 L 173 202 L 187 188 Z"
          fill={isPressed(15) ? ACTIVE_FILL : IDLE_BTN_FILL}
          stroke={isPressed(15) ? ACTIVE_STROKE : IDLE_BTN_STROKE}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M 206 202 L 196 196 L 196 208 Z" fill={isPressed(15) ? '#FFFFFF' : '#A1A1AA'} />
      </g>

      {/* ==================== CENTER BUTTONS (SELECT / ANALOG or PS HOME / START) ==================== */}
      {/* SELECT (Index 8) */}
      <g {...bindBtn(8, 'Botão SELECT (View/Back)')}>
        <rect
          x="274"
          y="178"
          width="38"
          height="16"
          rx="3"
          fill={isPressed(8) ? ACTIVE_FILL : IDLE_BTN_FILL}
          stroke={isPressed(8) ? ACTIVE_STROKE : IDLE_BTN_STROKE}
          strokeWidth="1.4"
        />
        <text
          x="293"
          y="168"
          textAnchor="middle"
          className="font-mono text-[9.5px] font-semibold tracking-wider"
          fill={isPressed(8) ? 'var(--accent-color)' : '#A1A1AA'}
        >
          SELECT
        </text>
      </g>

      {/* START (Index 9) */}
      <g {...bindBtn(9, 'Botão START (Menu/Start)')}>
        <path
          d="M 368 176 L 404 186 L 368 196 Z"
          fill={isPressed(9) ? ACTIVE_FILL : IDLE_BTN_FILL}
          stroke={isPressed(9) ? ACTIVE_STROKE : IDLE_BTN_STROKE}
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <text
          x="384"
          y="168"
          textAnchor="middle"
          className="font-mono text-[9.5px] font-semibold tracking-wider"
          fill={isPressed(9) ? 'var(--accent-color)' : '#A1A1AA'}
        >
          START
        </text>
      </g>

      {/* PS2: Central ANALOG LED & Label | PS3: Interactive PS Home Button | PS1: Classic Label */}
      {layout === 'ps2' && (
        <g>
          <circle
            cx="340"
            cy="214"
            r="4.5"
            fill="var(--accent-color)"
            filter="url(#neon-accent-glow)"
          />
          <rect
            x="323"
            y="224"
            width="34"
            height="11"
            rx="3"
            fill="#181820"
            stroke="rgba(var(--accent-rgb), 0.35)"
            strokeWidth="1"
          />
          <text
            x="340"
            y="232"
            textAnchor="middle"
            className="font-mono text-[7px] font-semibold tracking-widest"
            fill="var(--accent-color)"
          >
            ANALOG
          </text>
        </g>
      )}

      {isPs3 && (
        <g {...bindBtn(16, 'Botão PS Home (Guide)')}>
          <circle
            cx="340"
            cy="216"
            r="16"
            fill={isPressed(16) ? ACTIVE_FILL : '#171720'}
            stroke={isPressed(16) ? ACTIVE_STROKE : 'rgba(var(--accent-rgb), 0.55)'}
            strokeWidth="1.6"
          />
          <text
            x="340"
            y="220"
            textAnchor="middle"
            className="font-display text-[11px] font-extrabold tracking-tight"
            fill={isPressed(16) ? '#FFFFFF' : 'var(--accent-color)'}
          >
            PS
          </text>
        </g>
      )}

      {layout === 'ps1' && (
        <text
          x="340"
          y="222"
          textAnchor="middle"
          className="font-mono text-[9px] font-semibold tracking-widest"
          fill="#71717A"
        >
          PS1 DIGITAL
        </text>
      )}

      {/* ==================== FACE BUTTONS (RIGHT) ==================== */}
      {/* TRIANGLE (Index 3 - Top) */}
      <g {...bindBtn(3, 'Botão Triângulo (Y)')}>
        <circle
          cx="518"
          cy="158"
          r="20"
          fill={isPressed(3) ? ACTIVE_FILL : IDLE_BTN_FILL}
          stroke={isPressed(3) ? ACTIVE_STROKE : IDLE_BTN_STROKE}
          strokeWidth="1.6"
        />
        <path
          d="M 518 148.5 L 527.5 165 L 508.5 165 Z"
          fill="none"
          stroke={isPressed(3) ? '#FFFFFF' : '#34D399'}
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
      </g>

      {/* CIRCLE (Index 1 - Right) */}
      <g {...bindBtn(1, 'Botão Bolinha (B)')}>
        <circle
          cx="562"
          cy="202"
          r="20"
          fill={isPressed(1) ? ACTIVE_FILL : IDLE_BTN_FILL}
          stroke={isPressed(1) ? ACTIVE_STROKE : IDLE_BTN_STROKE}
          strokeWidth="1.6"
        />
        <circle
          cx="562"
          cy="202"
          r="9"
          fill="none"
          stroke={isPressed(1) ? '#FFFFFF' : '#FB7185'}
          strokeWidth="2.4"
        />
      </g>

      {/* CROSS (Index 0 - Bottom) */}
      <g {...bindBtn(0, 'Botão X / Cruz (A)')}>
        <circle
          cx="518"
          cy="246"
          r="20"
          fill={isPressed(0) ? ACTIVE_FILL : IDLE_BTN_FILL}
          stroke={isPressed(0) ? ACTIVE_STROKE : IDLE_BTN_STROKE}
          strokeWidth="1.6"
        />
        <path
          d="M 511 239 L 525 253 M 525 239 L 511 253"
          fill="none"
          stroke={isPressed(0) ? '#FFFFFF' : '#60A5FA'}
          strokeWidth="2.6"
          strokeLinecap="round"
        />
      </g>

      {/* SQUARE (Index 2 - Left) */}
      <g {...bindBtn(2, 'Botão Quadrado (X)')}>
        <circle
          cx="474"
          cy="202"
          r="20"
          fill={isPressed(2) ? ACTIVE_FILL : IDLE_BTN_FILL}
          stroke={isPressed(2) ? ACTIVE_STROKE : IDLE_BTN_STROKE}
          strokeWidth="1.6"
        />
        <rect
          x="466"
          y="194"
          width="16"
          height="16"
          rx="1.5"
          fill="none"
          stroke={isPressed(2) ? '#FFFFFF' : '#F472B6'}
          strokeWidth="2.4"
        />
      </g>

      {/* ==================== ANALOG STICKS (L & R, hidden on PS1) ==================== */}
      {showAnalogSticks && (
        <>
          <g>
            <circle
              cx="246"
              cy="290"
              r="40"
              fill="url(#ds2-well)"
              stroke={isPressed(10) ? ACTIVE_FILL : 'rgba(var(--accent-rgb), 0.35)'}
              strokeWidth="1.6"
            />
            <circle
              cx="246"
              cy="290"
              r="28"
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeDasharray="3 3"
            />
            <g {...bindBtn(10, 'Analógico Esquerdo L3 (LS)')}>
              <circle
                cx={leftCapX}
                cy={leftCapY}
                r="24"
                fill={isPressed(10) ? ACTIVE_FILL : 'url(#ds2-cap)'}
                stroke={isPressed(10) ? '#FFFFFF' : 'rgba(var(--accent-rgb), 0.6)'}
                strokeWidth="1.8"
              />
              <circle
                cx={leftCapX}
                cy={leftCapY}
                r="16"
                fill="none"
                stroke={isPressed(10) ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.08)'}
                strokeWidth="1.2"
              />
              <text
                x={leftCapX}
                y={leftCapY + 4}
                textAnchor="middle"
                className="font-mono text-[11px] font-bold pointer-events-none"
                fill={isPressed(10) ? '#FFFFFF' : '#E4E4E7'}
              >
                {isPressed(10) ? 'L3' : 'L'}
              </text>
            </g>
          </g>

          <g>
            <circle
              cx="434"
              cy="290"
              r="40"
              fill="url(#ds2-well)"
              stroke={isPressed(11) ? ACTIVE_FILL : 'rgba(var(--accent-rgb), 0.35)'}
              strokeWidth="1.6"
            />
            <circle
              cx="434"
              cy="290"
              r="28"
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeDasharray="3 3"
            />
            <g {...bindBtn(11, 'Analógico Direito R3 (RS)')}>
              <circle
                cx={rightCapX}
                cy={rightCapY}
                r="24"
                fill={isPressed(11) ? ACTIVE_FILL : 'url(#ds2-cap)'}
                stroke={isPressed(11) ? '#FFFFFF' : 'rgba(var(--accent-rgb), 0.6)'}
                strokeWidth="1.8"
              />
              <circle
                cx={rightCapX}
                cy={rightCapY}
                r="16"
                fill="none"
                stroke={isPressed(11) ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.08)'}
                strokeWidth="1.2"
              />
              <text
                x={rightCapX}
                y={rightCapY + 4}
                textAnchor="middle"
                className="font-mono text-[11px] font-bold pointer-events-none"
                fill={isPressed(11) ? '#FFFFFF' : '#E4E4E7'}
              >
                {isPressed(11) ? 'R3' : 'R'}
              </text>
            </g>
          </g>
        </>
      )}
    </svg>
  );
}
