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
  const isCustomized = Boolean(customName && customName.trim() !== '' && customName !== rawDeviceName);

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
          className="h-7 w-44 sm:w-56 px-2.5 rounded-md bg-[#09090B] border border-[#FF2E93] text-xs font-mono text-[#FAFAFA] outline-none shadow-[0_0_12px_rgba(255,46,147,0.3)]"
        />
        <button
          type="button"
          onMouseDown={(e) => {
            // Prevent input onBlur from firing before click
            e.preventDefault();
          }}
          onClick={commitEdit}
          aria-label="Confirmar nome do controle"
          title="Confirmar"
          className="w-7 h-7 rounded-md bg-[#FF2E93]/20 border border-[#FF2E93]/60 text-[#FF2E93] hover:bg-[#FF2E93] hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
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
        className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-md hover:bg-pink-500/10 text-left transition-colors cursor-pointer min-w-0"
      >
        <span className="font-mono text-[11px] text-[#A1A1AA] group-hover:text-[#FAFAFA] max-w-[180px] sm:max-w-[240px] truncate transition-colors">
          {displayedName}
        </span>
        <Pencil
          className="w-3 h-3 text-pink-400/70 group-hover:text-[#FF2E93] shrink-0 transition-colors"
          aria-hidden="true"
        />
      </button>

      {isCustomized && (
        <button
          type="button"
          onClick={onResetCustomName}
          title={`Restaurar nome original: ${rawDeviceName}`}
          aria-label="Restaurar nome padrão do controle"
          className="opacity-70 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 w-6 h-6 rounded-md text-[#A1A1AA] hover:text-[#FF2E93] hover:bg-pink-500/10 flex items-center justify-center transition-all cursor-pointer shrink-0"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
