import {Check, Pencil, RotateCcw} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';

interface ControllerNameEditorProps {
  rawDeviceName: string;
  customName: string | null;
  onSaveCustomName: (name: string) => void;
  onResetCustomName: () => void;
}

export function ControllerNameEditor({
  rawDeviceName,
  customName,
  onSaveCustomName,
  onResetCustomName,
}: ControllerNameEditorProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [draft, setDraft] = useState<string>(customName ?? rawDeviceName);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayedName = customName || rawDeviceName;
  const isCustomized = Boolean(
    customName && customName.trim() !== '' && customName !== rawDeviceName
  );

  useEffect(() => {
    if (isEditing) {
      setDraft(customName || rawDeviceName);
      const timer = window.setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [isEditing, customName, rawDeviceName]);

  const commitEdit = () => {
    const trimmed = draft.trim();
    if (trimmed === '' || trimmed === rawDeviceName) {
      onResetCustomName();
    } else {
      onSaveCustomName(trimmed);
    }
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setDraft(displayedName);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1.5 min-w-0">
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commitEdit();
            } else if (e.key === 'Escape') {
              e.preventDefault();
              cancelEdit();
            }
          }}
          maxLength={48}
          aria-label="Editar nome do controle"
          placeholder={rawDeviceName}
          className="h-7 w-40 sm:w-52 px-2.5 rounded-md bg-[#09090B] text-xs font-mono text-[#FAFAFA] outline-none neon-glow-accent"
          style={{border: '1px solid var(--accent-color)'}}
        />
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
          }}
          onClick={commitEdit}
          aria-label="Confirmar nome do controle"
          title="Confirmar"
          className="w-7 h-7 rounded-md flex items-center justify-center transition-colors cursor-pointer shrink-0 text-white"
          style={{
            backgroundColor: 'rgba(var(--accent-rgb), 0.25)',
            border: '1px solid var(--accent-color)',
          }}
        >
          <Check className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-1 min-w-0">
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        title={`Clique para editar (${rawDeviceName})`}
        className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-md hover:bg-white/5 text-left transition-colors cursor-pointer min-w-0"
      >
        <span className="font-mono text-[11px] text-[#A1A1AA] group-hover:text-[#FAFAFA] max-w-[160px] sm:max-w-[210px] truncate transition-colors">
          {displayedName}
        </span>
        <Pencil
          className="w-3 h-3 shrink-0 transition-colors opacity-75 group-hover:opacity-100"
          style={{color: 'var(--accent-color)'}}
          aria-hidden="true"
        />
      </button>

      {isCustomized && (
        <button
          type="button"
          onClick={onResetCustomName}
          title={`Restaurar nome original: ${rawDeviceName}`}
          aria-label="Restaurar nome padrão do controle"
          className="opacity-70 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 w-6 h-6 rounded-md text-[#A1A1AA] hover:text-white hover:bg-white/5 flex items-center justify-center transition-all cursor-pointer shrink-0"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
