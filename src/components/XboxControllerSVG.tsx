import React from 'react';
import type { StickState } from '../hooks/useGamepad';

interface XboxControllerSVGProps {
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

export function XboxControllerSVG({
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
}: XboxControllerSVGProps) {
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

  const lsX = 195 + leftStick.x * 16;
  const lsY = 186 + leftStick.y * 16;
  const rsX = 415 + rightStick.x * 16;
  const rsY = 264 + rightStick.y * 16;

  return (
    <svg
      viewBox="0 0 680 430"
      className={`w-full h-auto select-none ${isCompact ? 'max-w-[360px]' : 'max-w-[660px]'}`}
      style={{
        filter: 'drop-shadow(0 18px 42px rgba(0, 0, 0, 0.72))',
      }}
    >
      <defs>
        <linearGradient id="xboxBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1D1D27" />
          <stop offset="100%" stopColor="#0E0E14" />
        </linearGradient>
        <filter id="xboxGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Gatilhos LT (6) e RT (7) */}
      <g {...bindBtn(6, 'LT (Gatilho Esquerdo)')}>
        <rect
          x="148"
          y="22"
          width="88"
          height="32"
          rx="12"
          fill={isPressed(6) || l2Value > 0.08 ? ACTIVE_FILL : IDLE_BTN_FILL}
          stroke={isPressed(6) || l2Value > 0.08 ? ACTIVE_STROKE : IDLE_BTN_STROKE}
          strokeWidth="2"
        />
        <text x="192" y="42" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="700">
          LT {l2Value > 0.05 ? `${Math.round(l2Value * 100)}%` : ''}
        </text>
      </g>

      <g {...bindBtn(7, 'RT (Gatilho Direito)')}>
        <rect
          x="444"
          y="22"
          width="88"
          height="32"
          rx="12"
          fill={isPressed(7) || r2Value > 0.08 ? ACTIVE_FILL : IDLE_BTN_FILL}
          stroke={isPressed(7) || r2Value > 0.08 ? ACTIVE_STROKE : IDLE_BTN_STROKE}
          strokeWidth="2"
        />
        <text x="488" y="42" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="700">
          RT {r2Value > 0.05 ? `${Math.round(r2Value * 100)}%` : ''}
        </text>
      </g>

      {/* Ombros LB (4) e RB (5) */}
      <g {...bindBtn(4, 'LB (Ombro Esquerdo)')}>
        <path
          d="M 122 86 C 128 60 154 56 242 58 L 246 82 L 122 92 Z"
          fill={isPressed(4) ? ACTIVE_FILL : IDLE_BTN_FILL}
          stroke={isPressed(4) ? ACTIVE_STROKE : IDLE_BTN_STROKE}
          strokeWidth="2"
        />
        <text x="184" y="76" textAnchor="middle" fill="#FAFAFA" fontSize="12" fontWeight="700">
          LB
        </text>
      </g>

      <g {...bindBtn(5, 'RB (Ombro Direito)')}>
        <path
          d="M 558 86 C 552 60 526 56 438 58 L 434 82 L 558 92 Z"
          fill={isPressed(5) ? ACTIVE_FILL : IDLE_BTN_FILL}
          stroke={isPressed(5) ? ACTIVE_STROKE : IDLE_BTN_STROKE}
          strokeWidth="2"
        />
        <text x="496" y="76" textAnchor="middle" fill="#FAFAFA" fontSize="12" fontWeight="700">
          RB
        </text>
      </g>

      {/* Corpo Principal Xbox Series */}
      <path
        d="M 148 84
           C 198 76 266 78 340 78
           C 414 78 482 76 532 84
           C 574 92 600 132 612 204
           C 624 274 624 352 590 380
           C 562 402 522 390 486 334
           C 464 300 434 294 340 294
           C 246 294 216 300 194 334
           C 158 390 118 402 90 380
           C 56 352 56 274 68 204
           C 80 132 106 92 148 84 Z"
        fill="url(#xboxBodyGrad)"
        stroke={BODY_STROKE}
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Botão Xbox Guide (16) */}
      <g {...bindBtn(16, 'Botão Xbox (Home)')}>
        <circle
          cx="340"
          cy="128"
          r="21"
          fill={isPressed(16) ? ACTIVE_FILL : '#121218'}
          stroke={isPressed(16) ? ACTIVE_STROKE : 'var(--accent-color)'}
          strokeWidth="2.5"
          filter="url(#xboxGlow)"
        />
        <path
          d="M 329 118 C 335 123 345 123 351 118 M 328 138 C 334 130 346 130 352 138 M 329 120 L 351 137 M 351 120 L 329 137"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </g>

      {/* View (8), Share (decorativo) e Menu (9) */}
      <g {...bindBtn(8, 'View (Back)')}>
        <circle
          cx="286"
          cy="176"
          r="13"
          fill={isPressed(8) ? ACTIVE_FILL : IDLE_BTN_FILL}
          stroke={isPressed(8) ? ACTIVE_STROKE : IDLE_BTN_STROKE}
          strokeWidth="2"
        />
        <rect x="280" y="171" width="8" height="7" rx="1" fill="none" stroke="#E4E4E7" strokeWidth="1.4" />
        <rect x="284" y="174" width="8" height="7" rx="1" fill="none" stroke="#E4E4E7" strokeWidth="1.4" />
      </g>

      <g>
        <rect
          x="328"
          y="196"
          width="24"
          height="14"
          rx="7"
          fill="#15151E"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="1.2"
        />
        <path d="M 340 199 V 206 M 337 202 L 340 199 L 343 202" stroke="#A1A1AA" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      </g>

      <g {...bindBtn(9, 'Menu (Start)')}>
        <circle
          cx="394"
          cy="176"
          r="13"
          fill={isPressed(9) ? ACTIVE_FILL : IDLE_BTN_FILL}
          stroke={isPressed(9) ? ACTIVE_STROKE : IDLE_BTN_STROKE}
          strokeWidth="2"
        />
        <line x1="388" y1="172" x2="400" y2="172" stroke="#E4E4E7" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="388" y1="176" x2="400" y2="176" stroke="#E4E4E7" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="388" y1="180" x2="400" y2="180" stroke="#E4E4E7" strokeWidth="1.6" strokeLinecap="round" />
      </g>

      {/* Analógico Esquerdo (Superior Esq - 10 LS) */}
      <g {...bindBtn(10, 'LS (Clique Analógico Esquerdo)')}>
        <circle cx="195" cy="186" r="38" fill="#101016" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
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

      {/* D-Pad (Inferior Esq - 12, 13, 14, 15) */}
      <g>
        <circle cx="264" cy="264" r="38" fill="#101016" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
        {/* Up (12) */}
        <g {...bindBtn(12, 'D-Pad Cima')}>
          <rect x="252" y="232" width="24" height="24" rx="5" fill={isPressed(12) ? ACTIVE_FILL : IDLE_BTN_FILL} stroke={isPressed(12) ? ACTIVE_STROKE : IDLE_BTN_STROKE} strokeWidth="1.6" />
          <text x="264" y="248" textAnchor="middle" fill="#FAFAFA" fontSize="12" fontWeight="700">▲</text>
        </g>
        {/* Down (13) */}
        <g {...bindBtn(13, 'D-Pad Baixo')}>
          <rect x="252" y="272" width="24" height="24" rx="5" fill={isPressed(13) ? ACTIVE_FILL : IDLE_BTN_FILL} stroke={isPressed(13) ? ACTIVE_STROKE : IDLE_BTN_STROKE} strokeWidth="1.6" />
          <text x="264" y="288" textAnchor="middle" fill="#FAFAFA" fontSize="12" fontWeight="700">▼</text>
        </g>
        {/* Left (14) */}
        <g {...bindBtn(14, 'D-Pad Esquerda')}>
          <rect x="232" y="252" width="24" height="24" rx="5" fill={isPressed(14) ? ACTIVE_FILL : IDLE_BTN_FILL} stroke={isPressed(14) ? ACTIVE_STROKE : IDLE_BTN_STROKE} strokeWidth="1.6" />
          <text x="244" y="268" textAnchor="middle" fill="#FAFAFA" fontSize="12" fontWeight="700">◀</text>
        </g>
        {/* Right (15) */}
        <g {...bindBtn(15, 'D-Pad Direita')}>
          <rect x="272" y="252" width="24" height="24" rx="5" fill={isPressed(15) ? ACTIVE_FILL : IDLE_BTN_FILL} stroke={isPressed(15) ? ACTIVE_STROKE : IDLE_BTN_STROKE} strokeWidth="1.6" />
          <text x="284" y="268" textAnchor="middle" fill="#FAFAFA" fontSize="12" fontWeight="700">▶</text>
        </g>
      </g>

      {/* Analógico Direito (Inferior Dir - 11 RS) */}
      <g {...bindBtn(11, 'RS (Clique Analógico Direito)')}>
        <circle cx="415" cy="264" r="38" fill="#101016" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
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

      {/* Botões de Ação Coloridos Xbox: Y (3), B (1), A (0), X (2) */}
      {/* Y (Top - Amarelo) */}
      <g {...bindBtn(3, 'Botão Y (Amarelo)')}>
        <circle
          cx="488"
          cy="144"
          r="20"
          fill={isPressed(3) ? '#EAB308' : IDLE_BTN_FILL}
          stroke={isPressed(3) ? '#FFFFFF' : '#EAB308'}
          strokeWidth="2.6"
        />
        <text x="488" y="150" textAnchor="middle" fill={isPressed(3) ? '#09090D' : '#EAB308'} fontSize="16" fontWeight="900">
          Y
        </text>
      </g>

      {/* B (Right - Vermelho) */}
      <g {...bindBtn(1, 'Botão B (Vermelho)')}>
        <circle
          cx="528"
          cy="184"
          r="20"
          fill={isPressed(1) ? '#EF4444' : IDLE_BTN_FILL}
          stroke={isPressed(1) ? '#FFFFFF' : '#EF4444'}
          strokeWidth="2.6"
        />
        <text x="528" y="190" textAnchor="middle" fill={isPressed(1) ? '#FFFFFF' : '#EF4444'} fontSize="16" fontWeight="900">
          B
        </text>
      </g>

      {/* A (Bottom - Verde) */}
      <g {...bindBtn(0, 'Botão A (Verde)')}>
        <circle
          cx="488"
          cy="224"
          r="20"
          fill={isPressed(0) ? '#22C55E' : IDLE_BTN_FILL}
          stroke={isPressed(0) ? '#FFFFFF' : '#22C55E'}
          strokeWidth="2.6"
        />
        <text x="488" y="230" textAnchor="middle" fill={isPressed(0) ? '#09090D' : '#22C55E'} fontSize="16" fontWeight="900">
          A
        </text>
      </g>

      {/* X (Left - Azul) */}
      <g {...bindBtn(2, 'Botão X (Azul)')}>
        <circle
          cx="448"
          cy="184"
          r="20"
          fill={isPressed(2) ? '#3B82F6' : IDLE_BTN_FILL}
          stroke={isPressed(2) ? '#FFFFFF' : '#3B82F6'}
          strokeWidth="2.6"
        />
        <text x="448" y="190" textAnchor="middle" fill={isPressed(2) ? '#FFFFFF' : '#3B82F6'} fontSize="16" fontWeight="900">
          X
        </text>
      </g>
    </svg>
  );
}
