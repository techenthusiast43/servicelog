import React, { useEffect, useState, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import {
  Briefcase,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Wallet,
  RefreshCw,
  PlusCircle,
  ShieldAlert,
} from 'lucide-react';
import { useServiceContract } from '../hooks/useServiceContract';
import { ServiceRecord, ServiceStatus } from '../types/service';
import { StatusBadge } from '../components/StatusBadge';
import { formatAddress, formatBytes32, formatTimestamp } from '../utils/formatters';
import { TransactionModal } from '../components/TransactionModal';

interface ProviderDashboardProps {
  onNavigate: (tab: string) => void;
  onSelectService: (serviceId: string) => void;
}

export const ProviderDashboard: React.FC<ProviderDashboardProps> = ({
  onNavigate,
  onSelectService,
}) => {
  const { isConnected, address } = useAccount();
  const { open } = useAppKit();
  const {
    fetchProviderServices,
    completeService,
    cancelService,
    currentTxHash,
    isConfirming,
    isConfirmed,
    actionError,
    clearTxState,
  } = useServiceContract();

  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Action states
  const [activeActionId, setActiveActionId] = useState<`0x${string}` | undefined>(undefined);
  const [actionTitle, setActionTitle] = useState('Service Update');
  const [showModal, setShowModal] = useState(false);

  const loadServices = async () => {
    if (!isConnected || !address) {
      setServices([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const records = await fetchProviderServices();
      // sort descending by createdAt
      records.sort((a, b) => b.createdAt - a.createdAt);
      setServices(records);
    } catch (err) {
      console.error('Failed to load provider services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, [isConnected, address]);

  const handleComplete = async (serviceId: `0x${string}`) => {
    setActiveActionId(serviceId);
    setActionTitle('Complete Service');
    setShowModal(true);
    try {
      await completeService(serviceId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = async (serviceId: `0x${string}`) => {
    if (!window.confirm('Are you sure you want to cancel this pending service? This action is permanent on BOT Chain.')) {
      return;
    }
    setActiveActionId(serviceId);
    setActionTitle('Cancel Service');
    setShowModal(true);
    try {
      await cancelService(serviceId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    if (isConfirmed) {
      loadServices();
      clearTxState();
    }
  };

  // Filtered services
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchesSearch =
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.serviceId.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === 'pending') return s.status === ServiceStatus.Pending;
      if (statusFilter === 'completed') return s.status === ServiceStatus.Completed;
      if (statusFilter === 'cancelled') return s.status === ServiceStatus.Cancelled;

      return true;
    });
  }, [services, searchQuery, statusFilter]);

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto rounded-2xl border border-slate-800 bg-[#111622] p-8 text-center space-y-4 animate-in fade-in">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
          <Briefcase className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white">Provider Portal</h2>
        <p className="text-sm text-slate-400">
          Connect the service provider wallet used to register records on BOT Chain.
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
            <Briefcase className="w-6 h-6 text-emerald-400" />
            Provider Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage, complete, or cancel records minted under your provider address.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadServices}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="Refresh from BOT Chain"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => onNavigate('create')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition"
          >
            <PlusCircle className="w-4 h-4" />
            New Service
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by title, customer (0x...), or service ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-[#111622] border border-slate-800 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/40"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'pending', 'completed', 'cancelled'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition ${
                statusFilter === filter
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-[#111622] text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Services List */}
      <div className="rounded-2xl border border-slate-800 bg-[#111622] overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-16 text-center text-slate-500 text-sm">
            Fetching provider records from BOT Chain...
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Briefcase className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm text-slate-400">
              {services.length === 0
                ? "You haven't recorded any services on BOT Chain yet."
                : 'No services match the current filter.'}
            </p>
            {services.length === 0 && (
              <button
                onClick={() => onNavigate('create')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold transition"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Create Service
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0A0D14] border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Service & ID</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Created</th>
                  <th className="px-5 py-3.5 text-right">Provider Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredServices.map((record) => (
                  <tr key={record.serviceId} className="hover:bg-slate-800/25 transition">
                    <td className="px-5 py-4">
                      <div className="space-y-0.5">
                        <button
                          onClick={() => onSelectService(record.serviceId)}
                          className="font-semibold text-sm text-white hover:text-emerald-400 text-left transition"
                        >
                          {record.title}
                        </button>
                        <div className="font-mono text-[11px] text-slate-500">
                          {formatBytes32(record.serviceId, 6)}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <a
                        href={`https://scan.bohr.life/address/${record.customer}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-slate-300 hover:text-emerald-400 flex items-center gap-1.5"
                      >
                        {formatAddress(record.customer)}
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      </a>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={record.status} size="sm" />
                    </td>
                    <td className="px-5 py-4 text-slate-400 whitespace-nowrap">
                      {formatTimestamp(record.createdAt)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {record.status === ServiceStatus.Pending ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleComplete(record.serviceId as `0x${string}`)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Complete
                          </button>
                          <button
                            onClick={() => handleCancel(record.serviceId as `0x${string}`)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">
                          Locked on-chain
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={showModal}
        onClose={handleModalClose}
        txHash={currentTxHash}
        isConfirming={isConfirming}
        isConfirmed={isConfirmed}
        error={actionError}
        actionTitle={actionTitle}
        serviceId={activeActionId}
      />
    </div>
  );
};

