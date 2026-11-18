import React from 'react';
import type { StickState } from '../hooks/useGamepad';

interface SwitchControllerSVGProps {
  pressedButtons: boolean[];
  l2Value: number;
  r2Value: number;
  leftStick: StickState;
  rightStick: StickState;
  isCompact?: boolean;
  isRemapMode?: boolean;
  remapTargetIndex?: number | null;
  onSelectRemapTarget?: (index: number) => void;
  onButtonDown: (index: number) => void;
  onButtonUp: (index: number) => void;
}

const ACTIVE_FILL = 'var(--accent-color)';
const ACTIVE_STROKE = '#FFFFFF';
const IDLE_BTN_FILL = '#181822';
const IDLE_BTN_STROKE = 'rgba(var(--accent-rgb), 0.45)';
const BODY_STROKE = 'rgba(var(--accent-rgb), 0.58)';

export function SwitchControllerSVG({
  pressedButtons,
  l2Value,
  r2Value,
  leftStick,
  rightStick,
  isCompact = false,
  isRemapMode = false,
  remapTargetIndex = null,
  onSelectRemapTarget,
  onButtonDown,
  onButtonUp,
}: SwitchControllerSVGProps) {
  const isPressed = (idx: number) =>
    Boolean(pressedButtons[idx]) || (isRemapMode && remapTargetIndex === idx);

  const bindBtn = (index: number, label: string) => ({
    role: 'button' as const,
    tabIndex: 0,
    'aria-label': label,
    className: `cursor-pointer outline-none svg-btn-interactive ${
      isRemapMode && remapTargetIndex === index
        ? 'animate-pulse drop-shadow-[0_0_12px_#FFFFFF]'
        : isPressed(index)
          ? 'svg-btn-pressed'
          : 'hover:brightness-125'
    }`,
    onPointerDown: (e: React.PointerEvent<SVGGElement>) => {
      e.preventDefault();
      if (isRemapMode && onSelectRemapTarget) {
        onSelectRemapTarget(index);
        return;
      }
      onButtonDown(index);
    },
    onPointerUp: () => {
      if (!isRemapMode) onButtonUp(index);
    },
    onPointerLeave: () => {
      if (!isRemapMode && Boolean(pressedButtons[index])) onButtonUp(index);
    },
    onPointerCancel: () => {
      if (!isRemapMode && Boolean(pressedButtons[index])) onButtonUp(index);
    },
    onKeyDown: (e: React.KeyboardEvent<SVGGElement>) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (isRemapMode && onSelectRemapTarget) {
          onSelectRemapTarget(index);
          return;
        }
        onButtonDown(index);
      }
    },
    onKeyUp: (e: React.KeyboardEvent<SVGGElement>) => {
      if (!isRemapMode && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        onButtonUp(index);
      }
    },
  });

  const lsX = 190 + leftStick.x * 16;
  const lsY = 182 + leftStick.y * 16;
  const rsX = 415 + rightStick.x * 16;
  const rsY = 260 + rightStick.y * 16;

  return (
    <svg
      viewBox="0 0 680 430"
      className={`w-full h-auto select-none ${isCompact ? 'max-w-[360px]' : 'max-w-[660px]'}`}
      style={{
        filter: 'drop-shadow(0 18px 42px rgba(0, 0, 0, 0.72))',
      }}
    >
      <defs>
        <linearGradient id="switchBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1E1F28" />
          <stop offset="100%" stopColor="#0E0E14" />
        </linearGradient>
      </defs>

      {/* Gatilhos ZL (6) e ZR (7) */}
      <g {...bindBtn(6, 'ZL (Gatilho Esquerdo)')}>
        <rect
          x="148"
          y="22"
          width="88"
          height="32"
          rx="10"
          fill={isPressed(6) || l2Value > 0.08 ? ACTIVE_FILL : IDLE_BTN_FILL}
          stroke={isPressed(6) || l2Value > 0.08 ? ACTIVE_STROKE : IDLE_BTN_STROKE}
          strokeWidth="2"
        />
        <text x="192" y="42" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="700">
          ZL
        </text>
      </g>

      <g {...bindBtn(7, 'ZR (Gatilho Direito)')}>
        <rect
          x="444"
          y="22"
          width="88"
          height="32"
          rx="10"
          fill={isPressed(7) || r2Value > 0.08 ? ACTIVE_FILL : IDLE_BTN_FILL}
          stroke={isPressed(7) || r2Value > 0.08 ? ACTIVE_STROKE : IDLE_BTN_STROKE}
          strokeWidth="2"
        />
        <text x="488" y="42" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="700">
          ZR
        </text>
      </g>

      {/* Ombros L (4) e R (5) */}
      <g {...bindBtn(4, 'L (Ombro Esquerdo)')}>
        <path
          d="M 124 84 C 132 58 156 56 244 58 L 246 80 L 124 90 Z"
          fill={isPressed(4) ? ACTIVE_FILL : IDLE_BTN_FILL}
          stroke={isPressed(4) ? ACTIVE_STROKE : IDLE_BTN_STROKE}
          strokeWidth="2"
        />
        <text x="184" y="75" textAnchor="middle" fill="#FAFAFA" fontSize="12" fontWeight="700">
          L
        </text>
      </g>

      <g {...bindBtn(5, 'R (Ombro Direito)')}>
        <path
          d="M 556 84 C 548 58 524 56 436 58 L 434 80 L 556 90 Z"
          fill={isPressed(5) ? ACTIVE_FILL : IDLE_BTN_FILL}
          stroke={isPressed(5) ? ACTIVE_STROKE : IDLE_BTN_STROKE}
          strokeWidth="2"
        />
        <text x="496" y="75" textAnchor="middle" fill="#FAFAFA" fontSize="12" fontWeight="700">
          R
        </text>
      </g>

      {/* Corpo Switch Pro Controller */}
      <path
        d="M 148 82
           C 198 76 266 78 340 78
           C 414 78 482 76 532 82
           C 574 90 604 134 614 210
           C 624 282 618 358 582 384
           C 554 402 518 386 486 332
           C 464 294 434 290 340 290
           C 246 290 216 294 194 332
           C 162 386 126 402 98 384
           C 62 358 56 282 66 210
           C 76 134 106 90 148 82 Z"
        fill="url(#switchBodyGrad)"
        stroke={BODY_STROKE}
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Botões de Sistema: - (8), + (9), Captura (decorativo) e Home (16) */}
      <g {...bindBtn(8, 'Botão Menos (-)')}>
        <circle
          cx="286"
          cy="144"
          r="12"
          fill={isPressed(8) ? ACTIVE_FILL : IDLE_BTN_FILL}
          stroke={isPressed(8) ? ACTIVE_STROKE : IDLE_BTN_STROKE}
          strokeWidth="2"
        />
        <line x1="281" y1="144" x2="291" y2="144" stroke="#FAFAFA" strokeWidth="2.4" strokeLinecap="round" />
      </g>

      <g {...bindBtn(9, 'Botão Mais (+)')}>
        <circle
          cx="394"
          cy="144"
          r="12"
          fill={isPressed(9) ? ACTIVE_FILL : IDLE_BTN_FILL}
          stroke={isPressed(9) ? ACTIVE_STROKE : IDLE_BTN_STROKE}
          strokeWidth="2"
        />
        <line x1="389" y1="144" x2="399" y2="144" stroke="#FAFAFA" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="394" y1="139" x2="394" y2="149" stroke="#FAFAFA" strokeWidth="2.2" strokeLinecap="round" />
      </g>

      {/* Captura (decorativo) */}
      <g>
        <rect x="292" y="176" width="22" height="22" rx="4" fill="#15151E" stroke="rgba(255,255,255,0.28)" strokeWidth="1.4" />
        <circle cx="303" cy="187" r="5" fill="none" stroke="#A1A1AA" strokeWidth="1.4" />
      </g>

      {/* HOME (16) */}
      <g {...bindBtn(16, 'Botão HOME')}>
        <circle
          cx="377"
          cy="187"
          r="14"
          fill={isPressed(16) ? ACTIVE_FILL : '#121218'}
          stroke={isPressed(16) ? ACTIVE_STROKE : 'var(--accent-color)'}
          strokeWidth="2.2"
        />
        <path d="M 371 187 L 377 181 L 383 187 V 193 H 379 V 189 H 375 V 193 H 371 Z" fill="#FAFAFA" />
      </g>

      {/* Analógico Esquerdo (10 LS) */}
      <g {...bindBtn(10, 'LS (Clique Analógico Esquerdo)')}>
        <circle cx="190" cy="182" r="38" fill="#101016" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
        <circle
          cx={lsX}
          cy={lsY}
          r="25"
          fill={isPressed(10) ? ACTIVE_FILL : '#232332'}
          stroke={isPressed(10) ? ACTIVE_STROKE : 'rgba(var(--accent-rgb), 0.7)'}
          strokeWidth="2.5"
        />
        <text x={lsX} y={lsY + 4} textAnchor="middle" fill="#FAFAFA" fontSize="11" fontWeight="700">
          LS
        </text>
      </g>

      {/* D-Pad (12, 13, 14, 15) */}
      <g>
        <circle cx="264" cy="260" r="36" fill="#101016" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
        <g {...bindBtn(12, 'D-Pad Cima')}>
          <rect x="252" y="229" width="24" height="23" rx="5" fill={isPressed(12) ? ACTIVE_FILL : IDLE_BTN_FILL} stroke={isPressed(12) ? ACTIVE_STROKE : IDLE_BTN_STROKE} strokeWidth="1.6" />
          <text x="264" y="245" textAnchor="middle" fill="#FAFAFA" fontSize="12" fontWeight="700">▲</text>
        </g>
        <g {...bindBtn(13, 'D-Pad Baixo')}>
          <rect x="252" y="268" width="24" height="23" rx="5" fill={isPressed(13) ? ACTIVE_FILL : IDLE_BTN_FILL} stroke={isPressed(13) ? ACTIVE_STROKE : IDLE_BTN_STROKE} strokeWidth="1.6" />
          <text x="264" y="284" textAnchor="middle" fill="#FAFAFA" fontSize="12" fontWeight="700">▼</text>
        </g>
        <g {...bindBtn(14, 'D-Pad Esquerda')}>
          <rect x="232" y="248" width="24" height="24" rx="5" fill={isPressed(14) ? ACTIVE_FILL : IDLE_BTN_FILL} stroke={isPressed(14) ? ACTIVE_STROKE : IDLE_BTN_STROKE} strokeWidth="1.6" />
          <text x="244" y="264" textAnchor="middle" fill="#FAFAFA" fontSize="12" fontWeight="700">◀</text>
        </g>
        <g {...bindBtn(15, 'D-Pad Direita')}>
          <rect x="272" y="248" width="24" height="24" rx="5" fill={isPressed(15) ? ACTIVE_FILL : IDLE_BTN_FILL} stroke={isPressed(15) ? ACTIVE_STROKE : IDLE_BTN_STROKE} strokeWidth="1.6" />
          <text x="284" y="264" textAnchor="middle" fill="#FAFAFA" fontSize="12" fontWeight="700">▶</text>
        </g>
      </g>

      {/* Analógico Direito (11 RS) */}
      <g {...bindBtn(11, 'RS (Clique Analógico Direito)')}>
        <circle cx="415" cy="260" r="38" fill="#101016" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
        <circle
          cx={rsX}
          cy={rsY}
          r="25"
          fill={isPressed(11) ? ACTIVE_FILL : '#232332'}
          stroke={isPressed(11) ? ACTIVE_STROKE : 'rgba(var(--accent-rgb), 0.7)'}
          strokeWidth="2.5"
        />
        <text x={rsX} y={rsY + 4} textAnchor="middle" fill="#FAFAFA" fontSize="11" fontWeight="700">
          RS
        </text>
      </g>

      {/* Botões Nintendo Switch (Layout Invertido: X cima [3], A dir [1], B baixo [0], Y esq [2]) */}
      <g {...bindBtn(3, 'Botão X (Norte)')}>
        <circle cx="488" cy="144" r="20" fill={isPressed(3) ? ACTIVE_FILL : IDLE_BTN_FILL} stroke={isPressed(3) ? ACTIVE_STROKE : IDLE_BTN_STROKE} strokeWidth="2.4" />
        <text x="488" y="150" textAnchor="middle" fill="#FAFAFA" fontSize="16" fontWeight="900">X</text>
      </g>

      <g {...bindBtn(1, 'Botão A (Leste)')}>
        <circle cx="528" cy="184" r="20" fill={isPressed(1) ? ACTIVE_FILL : IDLE_BTN_FILL} stroke={isPressed(1) ? ACTIVE_STROKE : IDLE_BTN_STROKE} strokeWidth="2.4" />
        <text x="528" y="190" textAnchor="middle" fill="#FAFAFA" fontSize="16" fontWeight="900">A</text>
      </g>

      <g {...bindBtn(0, 'Botão B (Sul)')}>
        <circle cx="488" cy="224" r="20" fill={isPressed(0) ? ACTIVE_FILL : IDLE_BTN_FILL} stroke={isPressed(0) ? ACTIVE_STROKE : IDLE_BTN_STROKE} strokeWidth="2.4" />
        <text x="488" y="230" textAnchor="middle" fill="#FAFAFA" fontSize="16" fontWeight="900">B</text>
      </g>

      <g {...bindBtn(2, 'Botão Y (Oeste)')}>
        <circle cx="448" cy="184" r="20" fill={isPressed(2) ? ACTIVE_FILL : IDLE_BTN_FILL} stroke={isPressed(2) ? ACTIVE_STROKE : IDLE_BTN_STROKE} strokeWidth="2.4" />
        <text x="448" y="190" textAnchor="middle" fill="#FAFAFA" fontSize="16" fontWeight="900">Y</text>
      </g>
    </svg>
  );
}
