import type {Ps2ButtonId} from '../data/ps2Mapping';

interface Ps2SymbolProps {
  id: Ps2ButtonId;
  className?: string;
}

export function Ps2Symbol({id, className = 'w-6 h-6'}: Ps2SymbolProps) {
  switch (id) {
    case 'triangle':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path
            d="M12 4.2L20.5 19H3.5L12 4.2Z"
            stroke="currentColor"
            strokeWidth="2.3"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'circle':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="2.3" />
        </svg>
      );
    case 'cross':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path
            d="M6 6L18 18M18 6L6 18"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'square':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <rect
            x="5.25"
            y="5.25"
            width="13.5"
            height="13.5"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="2.3"
          />
        </svg>
      );
    case 'up':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path
            d="M12 4L19 12H14.5V20H9.5V12H5L12 4Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'down':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path
            d="M12 20L5 12H9.5V4H14.5V12H19L12 20Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'left':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path
            d="M4 12L12 5V9.5H20V14.5H12V19L4 12Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'right':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path
            d="M20 12L12 19V14.5H4V9.5H12V5L20 12Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'l1':
    case 'l2':
    case 'r1':
    case 'r2':
    case 'l3':
    case 'r3':
      return (
        <span className="font-mono font-bold tracking-tight leading-none uppercase">
          {id.toUpperCase()}
        </span>
      );
    case 'select':
      return (
        <span className="font-mono font-bold tracking-wider leading-none text-[0.72em] uppercase">
          SELECT
        </span>
      );
    case 'start':
      return (
        <span className="font-mono font-bold tracking-wider leading-none text-[0.72em] uppercase">
          START
        </span>
      );
  }
}
