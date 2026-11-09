import React from 'react';
import { Loader2, CheckCircle2, XCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import { formatBytes32 } from '../utils/formatters';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  txHash?: `0x${string}`;
  isConfirming: boolean;
  isConfirmed: boolean;
  error?: string | null;
  actionTitle?: string;
  serviceId?: `0x${string}`;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  txHash,
  isConfirming,
  isConfirmed,
  error,
  actionTitle = 'Transaction',
  serviceId,
}) => {
  if (!isOpen) return null;

  const explorerBase = 'https://scan.bohr.life';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#111622] border border-slate-800 rounded-2xl p-6 shadow-2xl text-center">
        {/* State: Confirming on BOT Chain */}
        {isConfirming && (
          <div className="space-y-4 py-4">
            <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
              <Loader2 className="w-8 h-8 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Confirming on BOT Chain</h3>
              <p className="text-sm text-slate-400 mt-1">
                Waiting for block verification. Please do not close this window.
              </p>
            </div>
            {txHash && (
              <div className="bg-[#0A0D14] border border-slate-800/80 rounded-xl p-3 text-xs text-slate-400 font-mono break-all text-left">
                <span className="text-slate-500 block mb-0.5">Tx Hash:</span>
                <a
                  href={`${explorerBase}/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5"
                >
                  {formatBytes32(txHash, 10)}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        )}

        {/* State: Confirmed */}
        {isConfirmed && !error && (
          <div className="space-y-4 py-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{actionTitle} Confirmed!</h3>
              <p className="text-sm text-slate-300 mt-1">
                The record has been permanently written to BOT Chain Testnet.
              </p>
            </div>

            {serviceId && (
              <div className="bg-[#0A0D14] border border-emerald-500/30 rounded-xl p-3.5 text-xs text-left">
                <span className="text-slate-400 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Service Record ID
                </span>
                <span className="font-mono text-emerald-300 break-all select-all block">
                  {serviceId}
                </span>
              </div>
            )}

            {txHash && (
              <div className="pt-2">
                <a
                  href={`${explorerBase}/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition"
                >
                  View on BOT Chain Explorer
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full mt-3 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition"
            >
              Done
            </button>
          </div>
        )}

        {/* State: Error */}
        {error && (
          <div className="space-y-4 py-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <XCircle className="w-9 h-9" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Transaction Failed</h3>
              <p className="text-xs text-rose-300/80 mt-1 max-h-32 overflow-y-auto font-mono bg-rose-950/20 p-2.5 rounded-lg border border-rose-900/30 text-left">
                {error}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm transition"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

