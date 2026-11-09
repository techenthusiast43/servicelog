import React, { useEffect, useState, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import {
  UserCheck,
  Search,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Clock,
  CheckCircle,
  FileText,
  Calendar,
} from 'lucide-react';
import { useServiceContract } from '../hooks/useServiceContract';
import { ServiceRecord, ServiceStatus } from '../types/service';
import { StatusBadge } from '../components/StatusBadge';
import { formatAddress, formatBytes32, formatTimestamp } from '../utils/formatters';

interface CustomerDashboardProps {
  onSelectService: (serviceId: string) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ onSelectService }) => {
  const { isConnected, address } = useAccount();
  const { open } = useAppKit();
  const { fetchCustomerServices } = useServiceContract();

  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadServices = async () => {
    if (!isConnected || !address) {
      setServices([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const records = await fetchCustomerServices();
      records.sort((a, b) => b.createdAt - a.createdAt);
      setServices(records);
    } catch (err) {
      console.error('Failed to load customer services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, [isConnected, address]);

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      return (
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.serviceId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [services, searchQuery]);

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto rounded-2xl border border-slate-800 bg-[#111622] p-8 text-center space-y-4 animate-in fade-in">
        <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mx-auto">
          <UserCheck className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white">Customer Service History</h2>
        <p className="text-sm text-slate-400">
          Connect your wallet to review all verified service milestones delivered to you on BOT Chain.
        </p>
        <button
          onClick={() => open()}
          className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-teal-400" />
            Customer Service History
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse services provided to your address, verify timestamps, and inspect on-chain proofs.
          </p>
        </div>

        <button
          onClick={loadServices}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 self-start sm:self-auto transition"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search by title, provider address (0x...), or service ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl bg-[#111622] border border-slate-800 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/40"
        />
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm">
          Fetching customer service records from BOT Chain...
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-[#111622] py-20 text-center space-y-3">
          <FileText className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="text-sm text-slate-400">
            {services.length === 0
              ? 'No service records found for your wallet address.'
              : 'No service records match your search criteria.'}
          </p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When a service provider creates an entry designating your wallet as customer, it will appear here permanently.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredServices.map((record) => (
            <div
              key={record.serviceId}
              className="rounded-2xl border border-slate-800 bg-[#111622] p-5 space-y-4 hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <button
                    onClick={() => onSelectService(record.serviceId)}
                    className="font-bold text-base text-white hover:text-emerald-400 text-left transition"
                  >
                    {record.title}
                  </button>
                  <div className="font-mono text-xs text-slate-500">
                    ID: {formatBytes32(record.serviceId, 8)}
                  </div>
                </div>
                <StatusBadge status={record.status} size="sm" />
              </div>

              {record.description && (
                <p className="text-xs text-slate-400 bg-[#0A0D14] p-3 rounded-xl border border-slate-800/80 line-clamp-2">
                  {record.description}
                </p>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs pt-1 border-t border-slate-800/60">
                <div className="space-y-0.5">
                  <span className="text-slate-500 text-[10px] uppercase font-semibold">Provider</span>
                  <a
                    href={`https://scan.bohr.life/address/${record.provider}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    {formatAddress(record.provider)}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="space-y-0.5">
                  <span className="text-slate-500 text-[10px] uppercase font-semibold">Created</span>
                  <div className="text-slate-300 font-mono text-[11px]">
                    {formatTimestamp(record.createdAt)}
                  </div>
                </div>
              </div>

              {record.status === ServiceStatus.Completed && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center justify-between text-emerald-300">
                  <span className="flex items-center gap-1.5 font-medium">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Completed:
                  </span>
                  <span className="font-mono text-[11px] text-emerald-400">
                    {formatTimestamp(record.completedAt)}
                  </span>
                </div>
              )}

              <div className="pt-1 flex items-center justify-between">
                <button
                  onClick={() => onSelectService(record.serviceId)}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
                >
                  Inspect Full Proof →
                </button>
                <a
                  href={`https://scan.bohr.life/address/${record.provider}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
                >
                  Verify in Explorer
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

