import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  PlusCircle,
  ArrowRight,
  ExternalLink,
  Shield,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useServiceContract } from '../hooks/useServiceContract';
import { ServiceRecord, ServiceStatus } from '../types/service';
import { StatusBadge } from '../components/StatusBadge';
import { formatAddress, formatBytes32, formatTimestamp } from '../utils/formatters';

interface DashboardProps {
  onNavigate: (tab: string) => void;
  onSelectService: (serviceId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onSelectService }) => {
  const { isConnected, address } = useAccount();
  const { fetchAllServices, fetchProviderServices } = useServiceContract();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
  });
  const [recentRecords, setRecentRecords] = useState<ServiceRecord[]>([]);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      setLoading(true);
      try {
        const { records, total } = await fetchAllServices(0, 30);
        if (!mounted) return;

        let pendingCount = 0;
        let completedCount = 0;
        let cancelledCount = 0;

        records.forEach((r) => {
          if (r.status === ServiceStatus.Pending) pendingCount++;
          else if (r.status === ServiceStatus.Completed) completedCount++;
          else if (r.status === ServiceStatus.Cancelled) cancelledCount++;
        });

        setStats({
          total: total || records.length,
          pending: pendingCount,
          completed: completedCount,
          cancelled: cancelledCount,
        });

        // Sort descending by creation date
        const sorted = [...records].sort((a, b) => b.createdAt - a.createdAt);
        setRecentRecords(sorted.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();
    return () => {
      mounted = false;
    };
  }, [fetchAllServices]);

  const statCards = [
    {
      title: 'Total Services',
      value: stats.total,
      icon: Layers,
      color: 'from-blue-500/20 to-indigo-500/20',
      text: 'text-blue-400',
      border: 'border-blue-500/30',
      badge: 'On-chain Records',
    },
    {
      title: 'Pending Milestone',
      value: stats.pending,
      icon: Clock,
      color: 'from-amber-500/20 to-yellow-500/20',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      badge: 'In Progress',
    },
    {
      title: 'Completed Services',
      value: stats.completed,
      icon: CheckCircle,
      color: 'from-emerald-500/20 to-teal-500/20',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      badge: 'Verified & Final',
    },
    {
      title: 'Cancelled Services',
      value: stats.cancelled,
      icon: XCircle,
      color: 'from-rose-500/20 to-red-500/20',
      text: 'text-rose-400',
      border: 'border-rose-500/30',
      badge: 'Voided by Provider',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-[#111827] via-[#0F172A] to-[#0A101D] p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              BOT Chain Testnet Live
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Decentralized Service Ledger
            </h1>
            <p className="text-sm text-slate-400 max-w-xl">
              Create cryptographically verifiable service milestones on BOT Chain. Immutable records,
              transparent verification, and decentralized audit trails.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('create')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              Create Service
            </button>
            <button
              onClick={() => onNavigate('verify')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm border border-slate-700 transition"
            >
              Verify Record
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`relative overflow-hidden rounded-2xl bg-[#111622] border ${card.border} p-5 transition hover:shadow-lg`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">{card.title}</span>
                <div className={`p-2 rounded-xl bg-gradient-to-br ${card.color} ${card.text}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white font-mono">
                  {loading ? '...' : card.value}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">{card.badge}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity Table & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Activity */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-[#111622] p-5 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h2 className="text-base font-bold text-white">Recent Service Activity</h2>
            </div>
            <button
              onClick={() => onNavigate('verify')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              Public Explorer
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              Loading on-chain records from BOT Chain...
            </div>
          ) : recentRecords.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <FileText className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-400">No service records registered yet.</p>
              <button
                onClick={() => onNavigate('create')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Create the First Record
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60 overflow-hidden">
              {recentRecords.map((item) => (
                <div
                  key={item.serviceId}
                  onClick={() => onSelectService(item.serviceId)}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/30 px-2 rounded-xl cursor-pointer transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-semibold text-sm text-white hover:text-emerald-400 transition">
                        {item.title}
                      </span>
                      <StatusBadge status={item.status} size="sm" />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
                      <span>ID: {formatBytes32(item.serviceId, 4)}</span>
                      <span>•</span>
                      <span>Provider: {formatAddress(item.provider)}</span>
                      <span>•</span>
                      <span>Customer: {formatAddress(item.customer)}</span>
                    </div>
                  </div>

                  <div className="text-right text-xs text-slate-400 whitespace-nowrap">
                    <div>{formatTimestamp(item.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Network Architecture Info */}
        <div className="rounded-2xl border border-slate-800 bg-[#111622] p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-bold text-white">BOT Chain Testnet</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-[#0A0D14] border border-slate-800 space-y-1.5">
              <span className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold">
                Network Status
              </span>
              <div className="flex items-center justify-between text-white font-medium">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Active & Synced
                </span>
                <span className="font-mono text-slate-400">Chain ID: 968</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0A0D14] border border-slate-800 space-y-1.5">
              <span className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold">
                RPC Endpoint
              </span>
              <div className="font-mono text-slate-300 break-all">https://rpc.bohr.life</div>
            </div>

            <div className="p-3 rounded-xl bg-[#0A0D14] border border-slate-800 space-y-1.5">
              <span className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold">
                Native Token
              </span>
              <div className="flex items-center justify-between text-white">
                <span className="font-semibold text-emerald-400">BOT</span>
                <span className="text-slate-400">150 Million Total Supply</span>
              </div>
            </div>

            <a
              href="https://scan.bohr.life"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
            >
              Open Block Explorer
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

