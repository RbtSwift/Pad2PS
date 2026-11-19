import { Download, ExternalLink, Sparkles, X } from 'lucide-react';
import React from 'react';
import type { UpdateCheckResult } from '../utils/updateChecker';

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  updateInfo: UpdateCheckResult | null;
  appName?: string;
}

export function UpdateModal({ isOpen, onClose, updateInfo, appName = 'Pad2PS' }: UpdateModalProps) {
  if (!isOpen || !updateInfo) return null;

  const handleDownload = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-[#0E0E12] border border-[#27273A] shadow-2xl overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="relative p-6 border-b border-[#27273A] bg-gradient-to-r from-violet-900/20 via-transparent to-pink-900/20">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center shadow-lg text-white">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">
                  Nova Versão Disponível
                </h3>
                <p className="text-xs text-[#A1A1AA]">
                  {appName} v{updateInfo.latestVersion} (atual: v{updateInfo.currentVersion})
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Corpo: Notas da Versão */}
        <div className="p-6 max-h-[50vh] overflow-y-auto space-y-4 text-sm text-[#D4D4D8]">
          {updateInfo.releaseName && updateInfo.releaseName !== `v${updateInfo.latestVersion}` && (
            <p className="font-semibold text-white text-base">
              {updateInfo.releaseName}
            </p>
          )}

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA] mb-1.5">
              O que mudou nesta atualização:
            </h4>
            <div className="p-3.5 rounded-xl bg-[#14141B] border border-[#27273A] font-sans text-xs sm:text-sm whitespace-pre-wrap leading-relaxed text-[#E4E4E7]">
              {updateInfo.releaseNotes || 'Melhorias de desempenho, correções de estabilidade e novos recursos.'}
            </div>
          </div>

          {/* Botão Primário de Download */}
          {updateInfo.primaryAsset && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleDownload(updateInfo.primaryAsset!.url)}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-pink-500 hover:brightness-110 shadow-lg cursor-pointer transition-all"
              >
                <Download className="w-4 h-4" />
                <span>{updateInfo.primaryAsset.label}</span>
              </button>
            </div>
          )}

          {/* Outros Instaladores Disponíveis */}
          {updateInfo.allAssets.length > 1 && (
            <div className="pt-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#A1A1AA] mb-2">
                Outros instaladores disponíveis:
              </p>
              <div className="flex flex-wrap gap-2">
                {updateInfo.allAssets
                  .filter((a) => a.browser_download_url !== updateInfo.primaryAsset?.url)
                  .map((a) => (
                    <button
                      key={a.name}
                      type="button"
                      onClick={() => handleDownload(a.browser_download_url)}
                      className="px-3 py-1.5 rounded-lg text-xs bg-[#1A1A24] border border-[#2E2E40] text-[#D4D4D8] hover:text-white hover:border-[#4B4B66] cursor-pointer transition-all"
                    >
                      {a.name}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="p-4 border-t border-[#27273A] bg-[#0A0A0D] flex items-center justify-between gap-3">
          <a
            href={updateInfo.releaseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#A1A1AA] hover:text-white transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Ver no GitHub</span>
          </a>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            Lembrar mais tarde
          </button>
        </div>
      </div>
    </div>
  );
}
