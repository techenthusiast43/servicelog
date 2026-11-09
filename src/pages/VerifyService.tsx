import React, { useState, useEffect } from 'react';
import {
  Search,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  Copy,
  Check,
  Building2,
  User,
  Calendar,
  Layers,
} from 'lucide-react';
import { useServiceContract } from '../hooks/useServiceContract';
import { ServiceRecord, ServiceStatus } from '../types/service';
import { StatusBadge } from '../components/StatusBadge';
import { formatAddress, formatBytes32, formatTimestamp } from '../utils/formatters';
import { isValidBytes32 } from '../utils/serviceId';

interface VerifyServiceProps {
  initialServiceId?: string;
  onClearInitialId?: () => void;
}

export const VerifyService: React.FC<VerifyServiceProps> = ({
  initialServiceId,
  onClearInitialId,
}) => {
  const { fetchServiceById, contractAddress } = useServiceContract();
  const [inputId, setInputId] = useState(initialServiceId || '');
  const [searchedId, setSearchedId] = useState<string | null>(null);
  const [record, setRecord] = useState<ServiceRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialServiceId && isValidBytes32(initialServiceId)) {
      setInputId(initialServiceId);
      performSearch(initialServiceId);
    }
  }, [initialServiceId]);

  const performSearch = async (idToQuery: string) => {
    const cleanId = idToQuery.trim();
    if (!isValidBytes32(cleanId)) {
      setNotFound(true);
      setRecord(null);
      setSearchedId(cleanId);
      return;
    }

    setLoading(true);
    setNotFound(false);
    setSearchedId(cleanId);
    try {
      const res = await fetchServiceById(cleanId as `0x${string}`);
      if (res && res.provider !== '0x0000000000000000000000000000000000000000') {
        setRecord(res);
        setNotFound(false);
      } else {
        setRecord(null);
        setNotFound(true);
      }
    } catch (err) {
      console.error(err);
      setRecord(null);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputId.trim()) {
      performSearch(inputId.trim());
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          Public On-Chain Verification
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Verify Service Record
        </h1>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Query the BOT Chain smart contract to cryptographically verify status, timestamps, and
          milestone agreements without needing wallet access.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex flex-col sm:flex-row gap-2 rounded-2xl bg-[#111622] border border-slate-800 p-2 shadow-2xl focus-within:border-emerald-500/40 transition">
          <div className="relative flex-1 flex items-center">
            <Search className="w-5 h-5 text-slate-500 absolute left-4" />
            <input
              type="text"
              required
              placeholder="Enter 32-byte Service ID (e.g. 0xabc...)"
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
              className="w-full bg-transparent pl-12 pr-4 py-3 text-sm font-mono text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition active:scale-95 whitespace-nowrap"
          >
            {loading ? 'Verifying...' : 'Verify On-Chain'}
          </button>
        </div>
      </form>

      {/* Loading State */}
      {loading && (
        <div className="rounded-2xl border border-slate-800 bg-[#111622] p-12 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-sm text-slate-400">
            Reading state directly from BOT Chain RPC endpoint...
          </p>
        </div>
      )}

      {/* Not Found State */}
      {!loading && notFound && searchedId && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-950/10 p-8 text-center space-y-3">
          <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">Record Not Found</h3>
          <p className="text-xs text-rose-200/80 max-w-md mx-auto">
            No service record with ID <span className="font-mono text-rose-300">{formatBytes32(searchedId, 8)}</span> exists
            on the BOT Chain smart contract.
          </p>
        </div>
      )}

      {/* Verified Record Details Card */}
      {!loading && record && (
        <div className="rounded-3xl border border-emerald-500/30 bg-[#111622] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
          {/* Card Top Banner */}
          <div className="bg-gradient-to-r from-emerald-950/30 via-slate-900 to-slate-900 px-6 sm:px-8 py-5 border-b border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Verified On-Chain
                </span>
                <h2 className="text-xl font-bold text-white">{record.title}</h2>
              </div>
            </div>

            <StatusBadge status={record.status} size="lg" />
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Description */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Service Description & Milestone Scope
              </span>
              <p className="text-sm text-slate-200 bg-[#0A0D14] border border-slate-800 p-4 rounded-xl leading-relaxed">
                {record.description || 'No description provided.'}
              </p>
            </div>

            {/* Parties Involved */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Provider */}
              <div className="p-4 rounded-2xl bg-[#0A0D14] border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  Service Provider (Creator)
                </span>
                <div className="font-mono text-xs text-white break-all select-all">
                  {record.provider}
                </div>
                <a
                  href={`https://scan.bohr.life/address/${record.provider}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-medium"
                >
                  View Provider on BOT Explorer
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Customer */}
              <div className="p-4 rounded-2xl bg-[#0A0D14] border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-teal-400" />
                  Designated Customer
                </span>
                <div className="font-mono text-xs text-white break-all select-all">
                  {record.customer}
                </div>
                <a
                  href={`https://scan.bohr.life/address/${record.customer}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-teal-400 hover:text-teal-300 font-medium"
                >
                  View Customer on BOT Explorer
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Timestamps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#0A0D14] border border-slate-800 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-800 text-slate-300">
                  <Calendar className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-500">
                    Registration Timestamp
                  </span>
                  <div className="text-xs font-semibold text-slate-200">
                    {formatTimestamp(record.createdAt)}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0A0D14] border border-slate-800 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-800 text-slate-300">
                  <Clock className="w-5 h-5 text-teal-400" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-500">
                    Finalized Timestamp
                  </span>
                  <div className="text-xs font-semibold text-slate-200">
                    {record.completedAt > 0
                      ? formatTimestamp(record.completedAt)
                      : record.status === ServiceStatus.Cancelled
                      ? 'Cancelled without completion'
                      : 'Pending completion'}
                  </div>
                </div>
              </div>
            </div>

            {/* Cryptographic Proof Identifier */}
            <div className="p-4 rounded-2xl bg-[#0A0D14] border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Cryptographic Service ID (bytes32)
                </span>
                <button
                  onClick={() => handleCopy(record.serviceId)}
                  className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 transition"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied!' : 'Copy Hash'}
                </button>
              </div>
              <div className="font-mono text-xs text-emerald-300/90 break-all select-all">
                {record.serviceId}
              </div>
            </div>

            {/* Smart Contract Proof Details */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Network:</span>
                <span>BOT Chain Testnet (ID: 968)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Contract:</span>
                <a
                  href={`https://scan.bohr.life/address/${contractAddress}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  {formatAddress(contractAddress)}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

